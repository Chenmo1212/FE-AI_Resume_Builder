import create from 'zustand';
import { debounce } from 'lodash';
import { arrayMoveImmutable } from 'array-move';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import { getJobList, addJob, updateJob, purgeJob } from '../axios/api';

interface Job {
  id?: string;
  company: string;
  title: string;
  description: string;
  link: string;
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

const handleJobs = (jobs: Job[]) => {
  return jobs.map((job) => ({
    id: job['_id'],
    company: job['company'],
    title: job['title'],
    description: job['raw'],
    link: job.link || '',
  }));
};

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

      fetch: async () => {
        try {
          const res = await getJobList();
          const processedData = handleJobs(res.data);
          set((state: any) => {
            state.jobs = processedData;
            state.loading = false;
          });
        } catch (err) {
          console.error(err);
        }
      },

      add: async () => {
        try {
          const res = await addJob({});
          set(
            produce((state: any) => {
              state.jobs.push({
                id: res.data['job_id'],
                company: '',
                title: 'job title',
                link: '',
                description: '',
              });
            })
          );
        } catch (err) {
          console.error(err);
        }
      },

      update: async (index: string, key: string, value: string) => {
        set(
          produce((state: any) => {
            state.jobs[index][key] = value;
          }),
          debouncedUpdateJob(index)
        );
      },

      purge: async (index: number) => {
        try {
          const currentState = useJobs.getState();
          const delJobId = currentState.jobs[index].id;
          await purgeJob(delJobId);
          set((state: any) => ({
            jobs: state.jobs.filter((_, ind) => ind !== index),
          }));
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
