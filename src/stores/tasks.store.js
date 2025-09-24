import create from 'zustand';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import { debounce } from 'lodash';
import { taskService, TASK_STATUS } from '../services/task.service';

const debouncedUpdateTask = debounce(async (index) => {
  try {
    const currentState = useTasks.getState();
    const updatedTask = { ...currentState.tasks[index] };
    const taskId = updatedTask.id;

    // Update task using taskService
    await taskService.updateTaskStatus(taskId, updatedTask.status, updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
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
          const tasks = await taskService.getAllTasks();
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
          console.error('Error fetching tasks:', err);
          get().updateLoading(false);
        }
      },

      add: async (data) => {
        try {
          const taskData = {
            jobId: data.job_id,
            title: '', // job title
            company: '', // job company
          };

          // Add task using taskService
          await taskService.createTask(taskData);
        } catch (err) {
          console.error('Error adding task:', err);
        }
      },

      // Create multiple tasks
      create: async (data) => {
        get().updateLoading(true);
        try {
          for (const taskData of data) {
            await taskService.createTask({
              ...taskData,
              status: TASK_STATUS.WAITING,
              progress: 0
            });
          }

          get().updateLoading(false);
          get().fetch();
        } catch (err) {
          console.error('Error creating tasks:', err);
          get().updateLoading(false);
        }
      },

      // Update a task in IndexedDB
      update: async (id, key, value) => {
        set((state) => produce(state, (draftState) => {
          const index = draftState.tasks.findIndex(task => task.id === id);
          draftState.tasks[index][key] = value;
          draftState.tasks[index].updatedAt = Date.now();
          debouncedUpdateTask(index);
        }));
      },

      // Update optimization steps for a task
      updateOptimizationSteps: async (id, steps) => {
        set((state) => produce(state, (draftState) => {
          const index = draftState.tasks.findIndex(task => task.id === id);
          if (index !== -1) {
            draftState.tasks[index].optimizationSteps = steps;
            draftState.tasks[index].updatedAt = Date.now();
            // Update the task in IndexedDB
            debouncedUpdateTask(index);
          }
        }));
      },

      // Delete a task using taskService
      purge: async (taskId) => {
        try {
          await taskService.deleteTask(taskId);

          set(
            produce((state) => {
              state.tasks = state.tasks.filter(task => task.id !== taskId);
            })
          );
        } catch (err) {
          console.error('Error deleting task:', err);
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
