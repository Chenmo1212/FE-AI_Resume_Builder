import create from 'zustand';
import { arrayMoveImmutable } from 'array-move';
import { persist } from 'zustand/middleware';
import produce from 'immer';

const JOBS_DATA = [
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

export const useJobs = create(
  persist(
    (set) => ({
      jobs: JOBS_DATA,

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
