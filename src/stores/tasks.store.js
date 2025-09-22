import create from 'zustand';
import { persist } from 'zustand/middleware';
import { dbService, STORES } from '../services/db.service';
import produce from 'immer';
import { debounce } from 'lodash';

const debouncedUpdateTask = debounce(async (index) => {
  try {
    const currentState = useTasks.getState();
    const updatedTask = { ...currentState.tasks[index] };
    const taskId = updatedTask.id;

    // Update task in IndexedDB
    await dbService.update(STORES.TASKS, taskId, updatedTask);
  } catch (err) {
    console.error('Error updating task in IndexedDB:', err);
  }
}, 1000);

export const useTasks = create(
  persist(
    (set, get) => ({
      tasks: [],
      loading: true,

      // Fetch tasks from IndexedDB
      fetch: async () => {
        get().updateLoading(true);
        try {
          const tasks = await dbService.getAll(STORES.TASKS);
          set(
            produce((state) => {
              state.tasks = tasks.map(task => ({
                ...task,
                key: task.id
              }));
              state.loading = false;
            })
          );
        } catch (err) {
          console.error('Error fetching tasks from IndexedDB:', err);
          get().updateLoading(false);
        }
      },

      // Add a task to IndexedDB
      add: async (data) => {
        try {
          // Create task object
          const task = {
            jobId: data.job_id,
            title: '', // job title
            company: '', // job company
            status: -1,
            progress: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          // Add task to IndexedDB
          await dbService.add(STORES.TASKS, task);
        } catch (err) {
          console.error('Error adding task to IndexedDB:', err);
        }
      },

      // Create multiple tasks
      create: async (data) => {
        get().updateLoading(true);
        try {
          // Add tasks to IndexedDB
          for (const taskData of data) {
            await dbService.add(STORES.TASKS, {
              ...taskData,
              status: 0,
              progress: 0,
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
          }

          get().updateLoading(false);
          get().fetch();
        } catch (err) {
          console.error('Error creating tasks in IndexedDB:', err);
          get().updateLoading(false);
        }
      },

      // Update a task in IndexedDB
      update: async (index, key, value) => {
        set((state) => produce(state, (draftState) => {
          draftState.tasks[index][key] = value;
          draftState.tasks[index].updatedAt = Date.now();
          debouncedUpdateTask(index);
        }));
      },

      // Delete a task from IndexedDB
      purge: async (index) => {
        try {
          const currentState = get();
          if (currentState.tasks[index]) {
            const taskId = currentState.tasks[index].id;

            // Delete task from IndexedDB
            await dbService.delete(STORES.TASKS, taskId);
          }

          set(
            produce((state) => {
              state.tasks = state.tasks.filter((_, ind) => ind !== index);
            })
          );
        } catch (err) {
          console.error('Error deleting task from IndexedDB:', err);
        }
      },

      // Update loading state
      updateLoading: (bool) => {
        set(produce((state) => {
          state.loading = bool;
        }));
      }
    }),
    {
      name: 'sprb-tasks'
    }
  )
);
