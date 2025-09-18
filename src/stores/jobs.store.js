import create from 'zustand';
import {debounce} from 'lodash';
import {arrayMoveImmutable} from 'array-move';
import {persist} from 'zustand/middleware';
import produce from 'immer';
import {
  getJobs,
  addJob,
  updateJob,
  purgeJob,
  addTasks,
  addTask,
  getTasks
} from '../axios/api';

const JOBS_DATA = [];

const TASK_DATA = [];

const debouncedUpdateJob = debounce(async (index) => {
  try {
    const currentState = useJobs.getState();
    const updatedJob = {...currentState.jobs[index]};
    const jobId = updatedJob['id'];
    updatedJob['raw'] = updatedJob['description'];
    delete updatedJob['description'];
    delete updatedJob['id'];
    await updateJob(jobId, updatedJob);
  } catch (err) {
    console.log(err);
  }
}, 3000);

export const useJobs = create(
  persist(
    (set) => ({
      jobs: JOBS_DATA,
      loading: true,

      fetch: () => {
        useJobs.getState().updateLoading(true);
        getJobs()
          .then((res) => {
            set(
              produce((state) => {
                state.jobs = res.data.jobs.map((job) => ({
                  id: job.id,
                  company: job.company,
                  title: job.title,
                  link: job.link,
                  description: job.raw,
                }));
                state.loading = false;
              })
            );
          })
          .catch((err) => {
            console.log(err);
          });
      },

      add: () => {
        useJobs.getState().updateLoading(true);
        addJob({title: 'job title'}).then(res => {
          set(
            produce((state) => {
              const job = {
                id: res.data['job_id'],
                company: '',
                title: 'job title',
                link: '',
                description: '',
              };
              state.jobs.push(job);
              useTasks.getState().add({job_id: job.id});
              state.loading = false;
            })
          );
        }).catch(err => {
          console.error(err);
          set((state) => state.loading = false);
        })
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
          await purgeJob(delJobId);
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

      fetch: () => {
        useTasks.getState().updateLoading(true);
        let jobIds = [];
        useJobs.getState().jobs.forEach((job, idx) => {
          if (job.id) jobIds.push(job.id);
        });
        getTasks({job_ids: jobIds})
          .then((res) => {
            const tasks = res.data.data;
            set(produce((state) => {
              let camelTasks = tasks.map(e => underscoreToCamel(e))
              camelTasks.forEach(task => task.key = task.id)
              state.tasks = camelTasks
              state.loading = false
            }));
          })
          .catch((err) => {
            console.log(err);
            useTasks.getState().updateLoading(false);
          });
      },

      add: (data) => {
        addTask(data).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err)
        })
      },

      create: (data) => {
        useTasks.getState().updateLoading(true);
        addTasks(data)
          .then((res) => {
            console.log(res)
            useTasks.getState().updateLoading(false);
            useTasks.getState().fetch();
          })
          .catch((err) => {
            console.log(err);
          });
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
      }
    }),
    {
      name: 'sprb-tasks',
    }
  )
);
