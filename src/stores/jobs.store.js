import create from 'zustand';
import {debounce} from 'lodash';
import {persist} from 'zustand/middleware';
import produce from 'immer';
import {
  addTasks,
  cancelTask,
  checkTasksStatus,
} from '../axios/api';
import { db } from '../db/index';

const JOBS_DATA = [];

const TASK_DATA = [];

const debouncedUpdateJob = debounce(async (index) => {
  try {
    const currentState = useJobs.getState();
    const job = currentState.jobs[index];
    if (!job) return;
    await db.jobs.update(job.id, { company: job.company, title: job.title, link: job.link, description: job.description, update_time: Date.now() });
  } catch (err) {
    console.log(err);
  }
}, 3000);

export const useJobs = create(
  persist(
    (set) => ({
      jobs: JOBS_DATA,
      loading: true,

      fetch: async () => {
        useJobs.getState().updateLoading(true);
        try {
          const rawJobs = await db.jobs.where('is_delete').equals(0).toArray();
          set(
            produce((state) => {
              state.jobs = rawJobs.map((job) => ({
                id: job.id,
                company: job.company || '',
                title: job.title || '',
                link: job.link || '',
                description: job.description || '',
              }));
              state.loading = false;
            })
          );
        } catch (err) {
          console.log(err);
          useJobs.getState().updateLoading(false);
        }
      },

      add: async () => {
        useJobs.getState().updateLoading(true);
        try {
          const newJob = {
            id: crypto.randomUUID(),
            title: 'job title',
            company: '',
            link: '',
            description: '',
            create_time: Date.now(),
            is_delete: 0,
          };
          await db.jobs.put(newJob);
          set(
            produce((state) => {
              const job = {
                id: newJob.id,
                company: newJob.company,
                title: newJob.title,
                link: newJob.link,
                description: newJob.description,
              };
              state.jobs.push(job);
              useTasks.getState().add({job_id: job.id});
              state.loading = false;
            })
          );
        } catch (err) {
          console.error(err);
          useJobs.getState().updateLoading(false);
        }
      },

      update: (index, key, value) =>
        set((state) => produce(state, (draftState) => {
          draftState.jobs[index][key] = value;
          debouncedUpdateJob(index);
        })),

      purge: async (index) => {
        try {
          set((state) => state.loading = true);
          const currentState = useJobs.getState();
          const delJobId = currentState.jobs[index].id;
          await db.jobs.update(delJobId, { is_delete: 1, delete_time: Date.now() });
          set(
            produce((state) => {
              state.jobs = state.jobs.filter((_, ind) => ind !== index);
              useTasks.getState().purge(index);
              state.loading = false;
            })
          );
        } catch (err) {
          console.log(err);
        }
      },

      updateLoading: (bool) => {
        set(produce((state) => {
          state.loading = bool;
        }));
      }
    }),
    {
      name: 'sprb-jobs',
    }
  )
);

const underscoreToCamel = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => underscoreToCamel(item));
  }
  const camelCaseObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelCaseObj[camelKey] = underscoreToCamel(obj[key]);
    }
  }
  return camelCaseObj;
}

export const useTasks = create(
  persist(
    (set) => ({
      tasks: TASK_DATA,
      loading: true,

      fetch: async () => {
        useTasks.getState().updateLoading(true);
        try {
          const rawTasks = await db.tasks.toArray();
          const enriched = await Promise.all(
            rawTasks.map(async (task) => {
              const job = task.job_id ? await db.jobs.get(task.job_id) : null;
              return {
                ...underscoreToCamel(task),
                key: task.id,
                title: job ? job.title : '',
                company: job ? job.company : '',
                link: job ? job.link : '',
              };
            })
          );
          set(produce((state) => {
            state.tasks = enriched;
            state.loading = false;
          }));
        } catch (err) {
          console.log(err);
          useTasks.getState().updateLoading(false);
        }
      },

      add: async (data) => {
        try {
          const newTask = {
            id: crypto.randomUUID(),
            job_id: data.job_id,
            status: -1,
            create_time: Date.now(),
          };
          await db.tasks.put(newTask);
        } catch (err) {
          console.error(err);
        }
      },

      create: async (data) => {
        useTasks.getState().updateLoading(true);
        try {
          // Upsert all tasks in Dexie with status = 0
          if (data.task_list && data.task_list.length) {
            await Promise.all(
              data.task_list.map((task) =>
                db.tasks.put({ ...task, status: 0 })
              )
            );
          }

          // POST to backend to run the LLM pipeline
          const res = await addTasks({
            resume: data.resume,
            task_list: data.task_list,
            ai_config: data.ai_config,
          });
          console.log(res);

          // Poll until all tasks are done or failed
          const taskIds = data.task_list.map((t) => t.id).filter(Boolean);
          if (taskIds.length) {
            const poll = async () => {
              try {
                const pollRes = await checkTasksStatus({ task_ids: taskIds });
                const results = pollRes.data;
                let allDone = true;
                await Promise.all(
                  results.map(async (result) => {
                    await db.tasks.update(result.id, { status: result.status });
                    if (result.status === 2 && result.new_resume_id && result.resume) {
                      await db.resumes.put({ id: result.new_resume_id, ...result.resume, update_time: Date.now() });
                    }
                    if (result.status !== 2 && result.status !== -2) {
                      allDone = false;
                    }
                  })
                );
                // Refresh state
                await useTasks.getState().fetch();
                if (!allDone) {
                  setTimeout(poll, 3000);
                } else {
                  useTasks.getState().updateLoading(false);
                }
              } catch (err) {
                console.log(err);
                useTasks.getState().updateLoading(false);
              }
            };
            await poll();
          } else {
            useTasks.getState().updateLoading(false);
            await useTasks.getState().fetch();
          }
        } catch (err) {
          console.log(err);
          useTasks.getState().updateLoading(false);
        }
      },

      update: (index, key, value) =>
        set(
          produce((state) => {
            state.tasks[index][key] = value;
          })
        ),

      purge: (index) => {
        set(
          produce((state) => {
            state.tasks = state.tasks.filter((_, ind) => ind !== index);
          })
        );
      },

      updateLoading: (bool) => {
        set(produce((state) => {
          state.loading = bool;
        }));
      },

      cancel: async (taskId) => {
        try {
          await cancelTask(taskId);
          await db.tasks.update(taskId, { status: -1 });
          await useTasks.getState().fetch();
        } catch (err) {
          console.error('Failed to cancel task:', err);
        }
      },
    }),
    {
      name: 'sprb-tasks',
    }
  )
);
