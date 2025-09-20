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

// Default section order
export const defaultSectionOrder = [
  'summary',
  'education',
  'experience',
  'skills',
  'practices',
  'projects',
  'achievements',
  'involvements',
  'referral'
];

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
  
  // Store section order for each template
  sectionOrder: [...defaultSectionOrder],
};

export const professionalConfig = {
  ...baseConfig,
  isShowInvolvements: false,
  isShowReferral: false,
  sectionOrder: [
    'experience',
    'projects',
    'summary',
    'education',
    'skills',
    'practices',
    'achievements',
    'involvements',
    'referral'
  ],
}

export const legacyConfig = {
  ...baseConfig,
  isShowProjects: false,
  sectionOrder: [
    'experience',
    'achievements',
    'involvements',
    'summary',
    'education',
    'skills',
    'practices',
    'projects',
    'referral',
  ],
}

export const graduateConfig = {
  ...baseConfig,
  isShowProjects: false,
  isShowEduCourses: true,
  sectionOrder: [
    'achievements',
    'involvements',
    'skills',
    'practices',
    'referral',
    'summary',
    'education',
    'experience',
    'projects',
  ],
}

export const oneColumnConfig = {
  ...baseConfig,
  isShowAchievements: false,
  isShowInvolvements: false,
  isShowPractices: false,
  isShowProjects: false,
  sectionOrder: [
    'summary',
    'education',
    'experience',
    'skills',
    'practices',
    'achievements',
    'involvements',
    'projects',
    'referral',
  ],
}

export const classicConfig = {
  ...baseConfig,
  isExchangeEduInstitution: false,
  isShowInvolvements: false,
  isShowProjects: false,
  sectionOrder: [
    'summary',
    'education',
    'experience',
    'skills',
    'achievements',
    'involvements',
    'projects',
    'referral',
  ],
}

export const TEMPLATE_CONFIGS = [professionalConfig, legacyConfig, graduateConfig, oneColumnConfig, classicConfig];

export const useTemplates = create(
  persist(
    (set, get) => ({
      index: 0,
      configs: TEMPLATE_CONFIGS,

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

      // Update section order for current template
      updateSectionOrder: (newOrder) => set((state) => {
        const newConfigs = [...state.configs];
        newConfigs[state.index] = {
          ...newConfigs[state.index],
          sectionOrder: newOrder
        };
        return { configs: newConfigs };
      }),

      currConfig: () => get().configs[get().index],
      
      // Get section order for current template
      getSectionOrder: () => {
        const config = get().configs[get().index];
        return config.sectionOrder || defaultSectionOrder;
      },
    }), {
      name: 'sprb-templates',
    }
  )
);
