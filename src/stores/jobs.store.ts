import create from 'zustand';
import { arrayMoveImmutable } from 'array-move';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import { getJobList } from '../axios/api';

interface Job {
  id?: string;
  company: string;
  job: string;
  description: string;
  link: string;
}

const JOBS_DATA: Job[] = [
  {
    company: 'Company Name1',
    job: 'Job Title1',
    link: 'Job Link',
    description: 'Job Description',
  },
  {
    company: 'Company Name2',
    job: 'Job Title2',
    link: 'Job Link',
    description: 'Job Description',
  },
  {
    company: 'Company Name3',
    job: 'Job Title3',
    link: 'Job Link',
    description: 'Job Description',
  },
];

const handleJobs = (jobs: Job[]) => {
  return jobs.map((job) => ({
    id: job['_id'],
    company: job['company'],
    job: job['job_title'],
    description: job['raw']['raw_job'],
    link: job.link || '',
  }));
};

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

      add: () =>
        set(
          produce((state: any) => {
            state.jobs.push({
              company: '',
              job: '',
              link: '',
              description: '',
            });
          })
        ),

      update: (index: string, key: string, value: string) =>
        set(
          produce((state: any) => {
            state.jobs[index][key] = value;
          })
        ),

      purge: (index: number) =>
        set((state: any) => ({
          jobs: state.jobs.filter((_, ind) => ind !== index),
        })),
    }),
    {
      name: 'sprb-jobs',
    }
  )
);
