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

interface Job {
  id?: string;
  company: string;
  title: string;
  description: string;
  link: string;
}

export interface Resume {
  basics: object;
  skills: object;
  work: object;
  education: object;
  projects: object;
  activities: object;
  volunteer: object;
  awards: object;
}

export interface Task {
  id?: string;
  title: string;
  company: string;
  link: string;
  description: string;
  jobId: string;
  status: number;
  resume: Resume;
  rawResumeId: string;
  newResumeId: string;
  key: string;
  isApply: boolean;
}

const JOBS_DATA: Job[] = [];

const TASK_DATA: Task[] = [];

const debouncedUpdateJob = debounce(async (index: string) => {
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
              produce((state: any) => {
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
            produce((state: any) => {
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
          set((state: any) => state.loading = false);
        })
      },

      update: (index: string, key: string, value: string) =>
        set((state: any) => produce(state, (draftState) => {
          draftState.jobs[index][key] = value;
          debouncedUpdateJob(index);
        })),

      purge: async (index: number) => {
        try {
          set((state: any) => state.loading = true);
          const currentState = useJobs.getState();
          const delJobId = currentState.jobs[index].id;
          await purgeJob(delJobId);
          set(
            produce((state: any) => {
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
        set(produce((state: any) => {
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
        let jobIds: string[] = [];
        useJobs.getState().jobs.forEach((job, idx) => {
          if (job.id) jobIds.push(job.id);
        });
        getTasks({job_ids: jobIds})
          .then((res) => {
            const tasks = res.data.data;
            set(produce((state: any) => {
              state.tasks = tasks.map(e => underscoreToCamel(e))
              state.loading = false
            }));
          })
          .catch((err) => {
            console.log(err);
            useTasks.getState().updateLoading(false);
          });
      },

      add: (data: any) => {
        addTask(data).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err)
        })
      },

      create: (data: any) => {
        useTasks.getState().updateLoading(true);
        addTasks(data)
          .then((res) => {
            const taskIds = res.data['task_ids'];
            const jobs = data['job_list'].map((job, index) => ({
              ...job,
              taskId: taskIds[index],
            }));
            set(
              produce((state: any) => {
                for (let i = 0; i < jobs.length; i++) {
                  const taskIndex = state.tasks.findIndex((task) => task.jobId === jobs[i].id);
                  if (taskIndex >= 0) {
                    // state.update(taskIndex, 'id', jobs[i].id)
                    state.tasks[taskIndex]['id'] = jobs[i].taskId;
                  }
                }
                state.loading = false;
              })
            );
            useTasks.getState().fetch();
          })
          .catch((err) => {
            console.log(err);
          });
      },

      update: (index: string, key: string, value: string) =>
        set(
          produce((state: any) => {
            state.tasks[index][key] = value;
          })
        ),

      purge: (index: number) => {
        set(
          produce((state: any) => {
            state.tasks = state.tasks.filter((_, ind) => ind !== index);
          })
        );
      },

      updateLoading: (bool) => {
        set(produce((state: any) => {
          state.loading = bool;
        }));
      }
    }),
    {
      name: 'sprb-tasks',
    }
  )
);
