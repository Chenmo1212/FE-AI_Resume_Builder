import create from 'zustand';
import dynamic from 'next/dynamic';
import { persist } from 'zustand/middleware';

// Use string paths instead of direct imports for images
const ProfessionalImg = '/images/professional.png';
const LegacyImg = '/images/legacy.png';
const GraduateImg = '/images/graduate.png';
const OneColumnImg = '/images/onecolumn.png';
const ClassicImg = '/images/classic.png';

const ProfessionalTemplate = dynamic(() => import('../templates/layouts/ProfessionalTemplate'), {
  ssr: false,
});

const LegacyTemplate = dynamic(() => import('../templates/layouts/LegacyTemplate'), {
  ssr: false,
});

const GraduateTemplate = dynamic(() => import('../templates/layouts/GraduateTemplate'), {
  ssr: false,
})

const OneColumnTemplate = dynamic(() => import('../templates/layouts/OneColumnTemplate'), {
  ssr: false,
})

const ClassicTemplate = dynamic(() => import('../templates/layouts/ClassicTemplate'), {
  ssr: false,
})

export const templates = [ProfessionalTemplate, LegacyTemplate, GraduateTemplate, OneColumnTemplate, ClassicTemplate];
export const templatesSrc = [ProfessionalImg, LegacyImg, GraduateImg, OneColumnImg, ClassicImg];
export const templatesName = ['Professional', 'Legacy', 'Graduate', 'OneColumn', 'Classic'];

export const INTRO_CONFIGS = [{
  key: "isShowSummary",
  label: "Display Summary"
}, {
  key: "isShowReferral",
  label: "Display Reference"
}]
export const EDU_CONFIGS = [{
  key: "isShowEdu",
  label: "Display Education"
}, {
  key: "isShowEduDissertation",
  label: "Display Dissertation"
}, {
  key: "isShowEduCourses",
  label: "Display Courses"
}, {
  key: "isShowEduHighlights",
  label: "Display Highlights"
}, {
  key: "isExchangeEduInstitution",
  label: "Exchange Institution/Degree"
}]

export const EXP_CONFIGS = [{
  key: "isShowExp",
  label: "Display Experience"
}, {
  key: "isShowExpLocation",
  label: "Display Location/Year"
}, {
  key: "isExchangeExpCompany",
  label: "Exchange Company/Role"
}]

export const PROJECTS_CONFIGS = [{
  key: "isShowInvolvements",
  label: "Display Involvement"
}, {
  key: "isShowAchievements",
  label: "Display Achievements"
}, {
  key: "isShowProjects",
  label: "Display Projects"
}]

export const AWARDS_CONFIGS = [{
  key: "isShowAwards",
  label: "Display Awards"
}, {
  key: "isShowVolunteer",
  label: "Display Volunteer"
}]

export const SKILLS_CONFIGS = [{
  key: "isShowSkills",
  label: "Display Skills"
}, {
  key: "isShowPractices",
  label: "Display Practices"
}]

const baseConfig = {
  isShowSummary: true,
  isShowReferral: true,
  isShowEdu: true,
  isExchangeEduInstitution: true,
  isShowEduDissertation: false,
  isShowEduCourses: false,
  isShowEduHighlights: false,

  isShowExp: true,
  isExchangeExpCompany: true,
  isShowExpLocation: true,

  isShowInvolvements: true,
  isShowAchievements: true,
  isShowProjects: true,
  isShowAwards: true,
  isShowVolunteer: true,
  isShowPractices: true,
  isShowSkills: true,
};

export const useTemplates = create(
  persist(
    (set, get) => ({
      index: 0,
      configs: [{
        ...baseConfig,
        isShowInvolvements: false,
        isShowReferral: false,
      }, {
        ...baseConfig,
        isShowProjects: false,
      }, {
        ...baseConfig,
        isShowProjects: false,
        isShowEduCourses: true,
      }, {
        ...baseConfig,
        isShowAchievements: false,
        isShowInvolvements: false,
        isShowPractices: false,
        isShowProjects: false,
      }, {
        ...baseConfig,
        isExchangeEduInstitution: false,
        isShowInvolvements: false,
        isShowProjects: false,
      }],

      getTemplate: () => templates[get().index],

      setTemplate: (index) => set(() => ({ index })),

      // Update specific config for current template
      updateConfig: (field, value) => set((state) => {
        const newConfigs = [...state.configs];
        newConfigs[state.index] = {
          ...newConfigs[state.index],
          [field]: value
        };
        return { configs: newConfigs };
      }),

      currConfig: () => get().configs[get().index],
    }), {
      name: 'sprb-templates',
    }
  )
);
