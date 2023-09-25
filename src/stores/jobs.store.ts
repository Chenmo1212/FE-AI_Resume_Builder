import create from 'zustand';
import { debounce } from 'lodash';
import { arrayMoveImmutable } from 'array-move';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import { getJobs, addJob, updateJob, purgeJob, getTasks, addTasks } from '../axios/api';

interface Job {
  id?: string;
  company: string;
  title: string;
  description: string;
  link: string;
}

interface Task {
  id?: string;
  title: string;
  company: string;
  link: string;
  description: string;
  jobId: string;
  status: number;
  resume: object;
  rawResumeId: string;
  newResumeId: string;
  key: string;
}

const JOBS_DATA: Job[] = [
  {
    company: 'Company Name1',
    title: 'Job Title1',
    link: 'Job Link',
    description: 'Job Description',
  },
  {
    company: 'Company Name2',
    title: 'Job Title2',
    link: 'Job Link',
    description: 'Job Description',
  },
  {
    company: 'Company Name3',
    title: 'Job Title3',
    link: 'Job Link',
    description: 'Job Description',
  },
];

const TASK_DATA: Task[] = [];

const debouncedUpdateJob = debounce(async (index: string) => {
  try {
    const currentState = useJobs.getState();
    const updatedJob = { ...currentState.jobs[index] };
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
        getJobs()
          .then((res) => {
            set(
              produce((state: any) => {
                state.jobs = res.data.map((job) => ({
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

      add: async () => {
        try {
          const res = await addJob({});
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
            })
          );
        } catch (err) {
          console.error(err);
        }
      },

      update: (index: string, key: string, value: string) => {
        set(
          produce((state: any) => {
            state.jobs = [...state.jobs];
            state.jobs[index][key] = value;
            useTasks.getState().update(index, key, value);
          }),
          debouncedUpdateJob(index)
        );
      },

      purge: async (index: number) => {
        try {
          const currentState = useJobs.getState();
          const delJobId = currentState.jobs[index].id;
          await purgeJob(delJobId);
          set(
            produce((state: any) => {
              state.jobs = state.jobs.filter((_, ind) => ind !== index);
              useTasks.getState().purge(index);
            })
          );
        } catch (err) {
          console.log(err);
        }
      },
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
            state.tasks.forEach((task) => {
              task.status = -1;
            });
          })
        );

        if (taskIds.length) {
          getTasks({ task_ids: taskIds })
            .then((res) => {
              const tasks = res.data.tasks;
              taskIdx.forEach((idx, i) => {
                set(
                  produce((state: any) => {
                    if (tasks[i]) {
                      state.tasks[idx] = {
                        ...state.tasks[idx],
                        status: tasks[i].status,
                      };
                    } else {
                      console.log('The database does not have this id: ', taskIds[i]);
                      state.tasks[idx]['id'] = '';
                    }
                  })
                );
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }
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
              })
            );
            useTasks.getState().fetch();
          })
          .catch((err) => {
            console.log(err);
          });
      },

      update: (index: string, key: string, value: string) => {
        set(
          produce((state: any) => {
            state.tasks = [...state.tasks];
            state.tasks[index][key] = value;
          })
        );
      },

      purge: (index: number) => {
        set(
          produce((state: any) => {
            state.tasks = state.tasks.filter((_, ind) => ind !== index);
          })
        );
      },
    }),
    {
      name: 'sprb-tasks',
    }
  )
);
