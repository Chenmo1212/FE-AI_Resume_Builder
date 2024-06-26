import create from 'zustand';
import {arrayMoveImmutable} from 'array-move';
import {persist} from 'zustand/middleware';
import produce from 'immer';
import userData from 'src/stores/data.json';
import preferUserData from 'src/stores/prefer.data.json';

const labels = [
  'Experience',
  'Key Projects',
  'Certificates and Awards',
  'About me',
  'Career Objective',
  'Technical Expertise',
  'Skills / Exposure',
  'Methodology / Approach',
  'Tools',
  'Education',
  'Biography',
  'Total Experience',
  'Involvements',
  'Referral',
];

export const usePreferData = create(
  persist(
    () => ({
      basics: preferUserData.basics,
      education: preferUserData.education,
      awards: preferUserData.awards,
      volunteer: preferUserData.volunteer,
      skills: preferUserData.skills,
      activities: preferUserData.activities,
      projects: preferUserData.projects,
      work: preferUserData.work,

      getResume: () => ({
        basics: preferUserData.basics,
        education: preferUserData.education,
        awards: preferUserData.awards,
        volunteer: preferUserData.volunteer,
        skills: preferUserData.skills,
        activities: preferUserData.activities,
        projects: preferUserData.projects,
        work: preferUserData.work,
      })
    }),

    {
      name: 'sprb-prefer',
    }
  )
);

export const useIntro = create(
  persist(
    (set) => ({
      intro: userData.basics,

      reset: (data = userData.basics) => {
        set({intro: data});
      },

      update: (type: string, value: string) =>
        set(
          produce((state: any) => {
            if (type.includes('.')) {
              const [parent, child] = type.split('.');
              state.intro[parent][child] = value;
            } else state.intro[type] = value;
          })
        ),

      updateProfiles: (type: string, field: string, value: string) =>
        set(
          produce((state: any) => {
            const object = state.intro.profiles.find((profile) => profile.network === type);

            if (object) {
              object[field] = value;
              return;
            }

            state.intro.profiles.push({network: type, [field]: value});
          })
        ),
    }),
    {
      name: 'sprb-intro',
    }
  )
);

export const useSkills = create(
  persist(
    (set) => ({
      languages: userData.skills.languages,
      frameworks: userData.skills.frameworks,
      libraries: userData.skills.libraries,
      databases: userData.skills.databases,
      technologies: userData.skills.technologies,
      practices: userData.skills.practices,
      tools: userData.skills.tools,

      reset: (data = userData.skills) => {
        set({
          languages: data.languages,
          frameworks: data.frameworks,
          libraries: data.libraries,
          databases: data.databases,
          technologies: data.technologies,
          practices: data.practices,
          tools: data.tools,
        });
      },

      add: (type: string, name = '', level = 1) =>
        set((state: any) => {
          if (state[type].some((skill) => skill.name === '')) return;

          state[type] = [...state[type]];
          state[type].push({name, level});
        }),

      update: (type: string, index: number, key: 'name' | 'level', value: string | number) =>
        set((state: any) => {
          state[type] = produce(state[type], (draftType) => {
            draftType[index][key] = value;
          });
        }),

      purge: (type: string, index: number) =>
        set((state: any) => {
          state[type] = state[type].filter((_, ind) => index !== ind);
        }),

      changeOrder: (type: string, oldIndex: number, newIndex: number) =>
        set((state: any) => ({
          ...state,
          [type]: arrayMoveImmutable(state[type], oldIndex, newIndex),
        })),
    }),
    {
      name: 'sprb-skills',
    }
  )
);

export const useWork = create(
  persist(
    (set) => ({
      companies: userData.work,

      reset: (data = userData.work) => {
        set({companies: data});
      },

      setField: (event: InputEvent) =>
        set((state: any) => {
          const field = event.target?.['dataset']?.label;

          if (field === undefined) return;
          state[field] = event.target?.['value'];
        }),

      add: () =>
        set((state: any) => ({
          companies: [
            ...state.companies,
            {
              name: 'Company',
              role: '',
              from: '',
              to: '',
              years: '',
              description: '* Point 1\n* Point 2\n* Point 3',
            },
          ],
        })),

      update: (index, field, value) =>
        set((state: any) =>
          produce(state, (draftState) => {
            draftState.companies[index][field] = value;
          })),

      purge: (index: number) =>
        set((state: any) => ({
          companies: state.companies.filter((_, ind) => ind !== index),
        })),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state: any) => ({
          companies: arrayMoveImmutable(state.companies, oldIndex, newIndex),
        })),
    }),
    {
      name: 'sprb-work',
    }
  )
);

export const useEducation = create(
  persist(
    (set) => ({
      education: userData.education,

      reset: (data = userData.education) => {
        set({education: data});
      },

      add: () =>
        set((state: any) => ({
          education: [
            ...state.education,
            {
              institution: '',
              url: '',
              studyType: 'Degree',
              area: '',
              startDate: '',
              endDate: '',
              score: '',
              dissertation: '',
              courses: [],
            },
          ],
        })),

      update: (index, field, value) =>
        set((state: any) =>
          produce(state, (draftState) => {
            draftState.education[index][field] = value;
          })),

      purge: (index: number) =>
        set((state: any) => ({education: state.education.filter((_, ind) => ind !== index)})),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state: any) => ({
          education: arrayMoveImmutable(state.education, oldIndex, newIndex),
        })),
    }),
    {
      name: 'sprb-education',
    }
  )
);

export const useProjects = create(
  persist(
    (set) => ({
      projects: userData.projects,

      reset: (data = userData.projects) => {
        set({projects: data});
      },

      add: () =>
        set((state: any) => ({
          projects: [
            ...state.projects,
            {
              title: '',
              demoUrl: '',
              demoIcon: 'globe',
              githubUrl: '',
              githubIcon: 'github',
              skills: '',
              highlights: [],
              summary: '',
            },
          ],
        })),

      update: (index, field, value) =>
        set((state: any) =>
          produce(state, (draftState) => {
            draftState.projects[index][field] = value;
          })),

      purge: (index: number) =>
        set((state: any) => ({projects: state.projects.filter((_, ind) => ind !== index)})),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state: any) => ({
          project: arrayMoveImmutable(state.projects, oldIndex, newIndex),
        })),
    }),
    {
      name: 'sprb-projects',
    }
  )
);

export const useActivities = create(
  persist(
    (set) => ({
      involvements: userData.activities.involvements,
      achievements: userData.activities.achievements,

      reset: (data = userData.activities) => {
        set({
          involvements: data.involvements,
          achievements: data.achievements,
        });
      },

      update: (type: string, value: string | number) =>
        set((state: any) =>
          produce(state, (draftState) => {
            if (type === 'projects') {
              draftState[type] = value;
            } else {
              draftState[type] = value
            }
          })),
    }),
    {
      name: 'sprb-activities',
    }
  )
);

export const useVolunteer = create(
  persist(
    (set) => ({
      volunteer: userData.volunteer,

      add: () =>
        set(
          produce((state: any) => {
            state.volunteer.push({
              organization: 'Organization',
              position: 'Volunteer',
              url: '',
              startDate: '',
              endDate: '',
              summary: '',
              highlights: '',
            });
          })
        ),

      update: (index: string, key: string, value: string) =>
        set(
          produce((state: any) => {
            state.volunteer[index][key] = value;
          })
        ),

      purge: (index: number) =>
        set((state: any) => ({
          volunteer: state.volunteer.filter((_, ind) => ind !== index),
        })),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state: any) => ({
          volunteer: arrayMoveImmutable(state.volunteer, oldIndex, newIndex),
        })),

      reset: (data = userData.volunteer) => {
        set({volunteer: data});
      },
    }),
    {
      name: 'sprb-volunteer',
    }
  )
);

export const useAwards = create(
  persist(
    (set) => ({
      awards: userData.awards,

      add: () =>
        set(
          produce((state: any) => {
            state.awards.push({
              title: 'Award X',
              date: '',
              awarder: '',
              summary: '',
            });
          })
        ),

      update: (index: string, key: string, value: string) =>
        set(
          produce((state: any) => {
            state.awards[index][key] = value;
          })
        ),

      purge: (index: number) =>
        set((state: any) => ({
          awards: state.awards.filter((_, ind) => ind !== index),
        })),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state: any) => ({
          awards: arrayMoveImmutable(state.awards, oldIndex, newIndex),
        })),

      reset: (data = userData.awards) => {
        set({awards: data});
      },
    }),
    {
      name: 'sprb-awards',
    }
  )
);

export const useLabels = create(
  persist(
    (set) => ({
      labels,

      update: (index: number, value: string) =>
        set(produce((state: any) => {
          const newlabels = [...state.labels];
          newlabels[index] = value;
          return {
            labels: newlabels,
          };
        })),
    }),
    {
      name: 'sprb-labels',
    }
  )
);
