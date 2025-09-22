import create from 'zustand';
import { debounce } from 'lodash';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import { dbService, STORES } from '../services/db.service';
import { useTasks } from './tasks.store';

const debouncedUpdateJob = debounce(async (index) => {
  let updatedJob = null
  try {
    const currentState = useJobs.getState();
    updatedJob = { ...currentState.jobs[index] };
    const jobId = updatedJob.id;
    // Update job in IndexedDB
    await dbService.update(STORES.JOBS, jobId, updatedJob);
  } catch (err) {
    console.error('Error updating job in IndexedDB:', err);
  }

  // Update job details to IndexedDB
  try {
    const tasks = await dbService.getAll(STORES.TASKS);
    const index = tasks.findIndex((task) => task.jobId === updatedJob.id);
    const task = tasks[index];
    if (task && (updatedJob.title !== task.title || updatedJob.company !== task.company)) {
      await dbService.update(STORES.TASKS, task.id, { ...task, title: updatedJob.title, company: updatedJob.company });
    }
  } catch (err) {
    console.error('Error updating task in IndexedDB:', err);
  }
}, 1000);

export const useJobs = create(
  persist(
    (set, get) => ({
      jobs: [],
      loading: true,

      // Fetch jobs from IndexedDB
      fetch: async () => {
        get().updateLoading(true);
        try {
          // Get all jobs from IndexedDB
          const jobs = await dbService.getAll(STORES.JOBS);
          
          set(
            produce((state) => {
              state.jobs = jobs;
              state.loading = false;
            })
          );
        } catch (err) {
          console.error('Error fetching jobs from IndexedDB:', err);
          set(produce((state) => {
            state.loading = false;
          }));
        }
      },

      // Add a new job to IndexedDB
      add: async () => {
        get().updateLoading(true);
        try {
          // Create new job object
          const newJob = {
            company: '',
            title: 'job title',
            link: '',
            description: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          
          // Add job to IndexedDB
          const jobId = await dbService.add(STORES.JOBS, newJob);
          
          // Get the job with the generated ID
          const job = await dbService.getById(STORES.JOBS, jobId);
          
          set(
            produce((state) => {
              state.jobs.push(job);
              state.loading = false;
            })
          );

          if (useTasks.getState) {
            useTasks.getState().add({ job_id: jobId });
          }
          
          return jobId;
        } catch (err) {
          console.error('Error adding job to IndexedDB:', err);
          set(produce((state) => {
            state.loading = false;
          }));
          return null;
        }
      },

      // Update a job in IndexedDB
      update: (index, key, value) =>
        set((state) => produce(state, (draftState) => {
          draftState.jobs[index][key] = value;
          draftState.jobs[index].updatedAt = Date.now();
          debouncedUpdateJob(index);
        })),

      // Delete a job from IndexedDB
      purge: async (index) => {
        try {
          set((state) => ({ ...state, loading: true }));
          
          const currentState = useJobs.getState();
          const jobId = currentState.jobs[index].id;
          
          // Delete job from IndexedDB
          await dbService.delete(STORES.JOBS, jobId);
          
          set(
            produce((state) => {
              state.jobs = state.jobs.filter((_, ind) => ind !== index);
              state.loading = false;
            })
          );

          if (useTasks.getState) {
            useTasks.getState().purge(index);
          }
        } catch (err) {
          console.error('Error deleting job from IndexedDB:', err);
          set(produce((state) => {
            state.loading = false;
          }));
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
      name: 'sprb-jobs'
    }
  )
);
