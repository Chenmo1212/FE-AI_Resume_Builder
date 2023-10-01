import create from 'zustand';
import {debounce} from 'lodash';
import {arrayMoveImmutable} from 'array-move';
import {persist} from 'zustand/middleware';
import produce from 'immer';
import {getJobs, addJob, updateJob, purgeJob, checkTasksStatus, addTasks} from '../axios/api';

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
        addJob({}).then(res => {
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
              useTasks.getState().add(job);
              state.loading = false;
            })
          );
        }).catch(err => {
          console.error(err);
          set((state: any) => state.loading = false);
        })
      },

      update: (index: string, key: string, value: string) =>
        set(
          produce((state: any) => {
            state.jobs[index][key] = value;
            useTasks.getState().update(index, key, value);
            debouncedUpdateJob(index)
          })
        ),

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

export const useTasks = create(
  persist(
    (set) => ({
      tasks: TASK_DATA,
      loading: true,

      fetch: () => {
        useTasks.getState().updateLoading(true);
        let taskIds: string[] = [];
        let taskIdx: number[] = [];
        useTasks.getState().tasks.forEach((task, idx) => {
          if (task.id) {
            taskIds.push(task.id);
            taskIdx.push(idx);
          }
        });
        set(
          produce((state: any) => {
            state.tasks.forEach((task, index) => {
              task.status = -1;
              task.key = index.toString();
              task.isApply = false;
            });
          })
        );
        // if (taskIds.length) {
        checkTasksStatus({task_ids: taskIds})
          .then((res) => {
            const tasks = res.data.tasks;
            taskIdx.forEach((idx, i) => {
              set(
                produce((state: any) => {
                  if (tasks[i]) {
                    state.tasks[idx] = {
                      ...state.tasks[idx],
                      status: tasks[i].status,
                      resume: tasks[i].resume,
                      newResumeId: tasks[i].new_resume_id,
                      isApply: tasks[i]['is_apply']
                    };
                  } else {
                    console.log('The database does not have this id: ', taskIds[i]);
                    state.tasks[idx]['id'] = '';
                  }
                })
              );
            });
            useTasks.getState().updateLoading(false);
          })
          .catch((err) => {
            console.log(err);
            useTasks.getState().updateLoading(false);
          });
        // }
      },

      add: (data: any) => {
        set(
          produce((state: any) => {
            state.tasks.push({
              ...data,
              jobId: data.id,
              status: -1,
              id: '',
              key: state.tasks.length.toString(),
            });
          })
        );
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
