import create from 'zustand';
import {arrayMoveImmutable} from 'array-move';
import {persist} from 'zustand/middleware';
import produce from 'immer';
import defaultData from '../../src/stores/data.json';

export const usePreferData = create(
  persist(
    (set) => ({
      basics: defaultData.basics,
      education: defaultData.education,
      awards: defaultData.awards,
      volunteer: defaultData.volunteer,
      skills: defaultData.skills,
      activities: defaultData.activities,
      projects: defaultData.projects,
      work: defaultData.work,

      // Add a setter method to properly update the state
      setPreferredResume: (resumeData) => set({
        basics: resumeData.basics,
        education: resumeData.education,
        awards: resumeData.awards,
        volunteer: resumeData.volunteer,
        skills: resumeData.skills,
        activities: resumeData.activities,
        projects: resumeData.projects,
        work: resumeData.work,
      }),

      getResume: function() {
        return {
          basics: this.basics,
          education: this.education,
          awards: this.awards,
          volunteer: this.volunteer,
          skills: this.skills,
          activities: this.activities,
          projects: this.projects,
          work: this.work,
        };
      }
    }),
    {
      name: 'sprb-prefer',
    }
  )
);

// Function to get user data from preferData or fall back to defaultData
const getUserData = () => {
  const preferStore = usePreferData.getState();
  if (preferStore && Object.keys(preferStore).length > 0) {
    return {
      basics: preferStore.basics || defaultData.basics,
      education: preferStore.education || defaultData.education,
      awards: preferStore.awards || defaultData.awards,
      volunteer: preferStore.volunteer || defaultData.volunteer,
      skills: preferStore.skills || defaultData.skills,
      activities: preferStore.activities || defaultData.activities,
      projects: preferStore.projects || defaultData.projects,
      work: preferStore.work || defaultData.work,
    };
  }
  return defaultData;
};

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
  'References',
];

// This section was removed as it was a duplicate of the usePreferData store

export const useIntro = create(
  persist(
    (set) => ({
      intro: getUserData().basics,

      reset: (data = getUserData().basics) => {
        set({intro: data});
      },

      update: (type, value) =>
        set(
          produce((state) => {
            if (type.includes('.')) {
              const [parent, child] = type.split('.');
              state.intro[parent][child] = value;
            } else state.intro[type] = value;
          })
        ),

      updateProfiles: (type, field, value) =>
        set(
          produce((state) => {
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
      languages: getUserData().skills.languages,
      technologies: getUserData().skills.technologies,
      practices: getUserData().skills.practices,
      tools: getUserData().skills.tools,

      reset: (data = getUserData().skills) => {
        set({
          languages: data.languages,
          technologies: data.technologies,
          practices: data.practices,
          tools: data.tools,
        });
      },

      add: (type, name = '', level = 1) =>
        set((state) => {
          if (state[type].some((skill) => skill.name === '')) return;

          state[type] = [...state[type]];
          state[type].push({name, level});
        }),

      update: (type, index, key, value) =>
        set((state) => {
          state[type] = produce(state[type], (draftType) => {
            draftType[index][key] = value;
          });
        }),

      purge: (type, index) =>
        set((state) => {
          state[type] = state[type].filter((_, ind) => index !== ind);
        }),

      changeOrder: (type, oldIndex, newIndex) =>
        set((state) => ({
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
      companies: getUserData().work,
      workConfig: {
        isShowLocation: false,
      },

      reset: (data = getUserData().work) => {
        set({
          companies: data,
          workConfig: {
            isShowLocation: false,
          }
        });
      },

      setField: (event) =>
        set((state) => {
          const field = event.target?.['dataset']?.label;

          if (field === undefined) return;
          state[field] = event.target?.['value'];
        }),

      add: () =>
        set((state) => ({
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
        set((state) =>
          produce(state, (draftState) => {
            draftState.companies[index][field] = value;
            if (field === 'summary') draftState.companies[index].highlights = value.split("\n");
          })),

      purge: (index) =>
        set((state) => ({
          companies: state.companies.filter((_, ind) => ind !== index),
        })),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state) => ({
          companies: arrayMoveImmutable(state.companies, oldIndex, newIndex),
        })),
        
      updateConfig: (field, value) =>
        set((state) =>
          produce(state, (draftState) => {
            draftState.workConfig[field] = value;
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
      education: getUserData().education,
      eduConfig: {
        isShowDissertation: false,
        isShowCourses: false,
        isShowHighlights: false
      },

      reset: (data = getUserData().education) => {
        set({
          education: data,
          eduConfig: {
            isShowDissertation: false,
            isShowCourses: false,
            isShowHighlights: false
          }
        });
      },

      add: () =>
        set((state) => ({
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
              highlights: '',
            },
          ],
          config: {
            ...state.config,
            isShowDissertation: true,
            isShowCourses: true,
            isShowHighlights: true,
          }
        })),

      update: (index, field, value) =>
        set((state) =>
          produce(state, (draftState) => {
            draftState.education[index][field] = value;
          })),

      updateConfig: (field, value) =>
        set((state) =>
          produce(state, (draftState) => {
            draftState.eduConfig[field] = value;
          })),

      purge: (index) =>
        set((state) => ({education: state.education.filter((_, ind) => ind !== index)})),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state) => ({
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
      projects: getUserData().projects,

      reset: (data = getUserData().projects) => {
        set({projects: data});
      },

      add: () =>
        set((state) => ({
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
        set((state) =>
          produce(state, (draftState) => {
            draftState.projects[index][field] = value;
          })),

      purge: (index) =>
        set((state) => ({projects: state.projects.filter((_, ind) => ind !== index)})),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state) => ({
          projects: arrayMoveImmutable(state.projects, oldIndex, newIndex),
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
      involvements: getUserData().activities.involvements,
      achievements: getUserData().activities.achievements,

      reset: (data = getUserData().activities) => {
        set({
          involvements: data.involvements,
          achievements: data.achievements,
        });
      },

      update: (type, value) =>
        set((state) =>
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
      volunteer: getUserData().volunteer,

      add: () =>
        set(
          produce((state) => {
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

      update: (index, key, value) =>
        set(
          produce((state) => {
            state.volunteer[index][key] = value;
          })
        ),

      purge: (index) =>
        set((state) => ({
          volunteer: state.volunteer.filter((_, ind) => ind !== index),
        })),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state) => ({
          volunteer: arrayMoveImmutable(state.volunteer, oldIndex, newIndex),
        })),

      reset: (data = getUserData().volunteer) => {
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
      awards: getUserData().awards,

      add: () =>
        set(
          produce((state) => {
            state.awards.push({
              title: 'Award X',
              date: '',
              awarder: '',
              summary: '',
            });
          })
        ),

      update: (index, key, value) =>
        set(
          produce((state) => {
            state.awards[index][key] = value;
          })
        ),

      purge: (index) =>
        set((state) => ({
          awards: state.awards.filter((_, ind) => ind !== index),
        })),

      changeOrder: ({oldIndex, newIndex}) =>
        set((state) => ({
          awards: arrayMoveImmutable(state.awards, oldIndex, newIndex),
        })),

      reset: (data = getUserData().awards) => {
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

      update: (index, value) =>
        set(produce((state) => {
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
