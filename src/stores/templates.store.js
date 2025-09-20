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

// Section configuration definitions
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

// Define all available sections with their default visibility
export const AVAILABLE_SECTIONS = {
  summary: {
    id: 'summary',
    displayName: 'Summary',
    visibilityKey: 'isShowSummary',
    defaultVisible: true
  },
  education: {
    id: 'education',
    displayName: 'Education',
    visibilityKey: 'isShowEdu',
    defaultVisible: true
  },
  experience: {
    id: 'experience',
    displayName: 'Experience',
    visibilityKey: 'isShowExp',
    defaultVisible: true
  },
  skills: {
    id: 'skills',
    displayName: 'Skills',
    visibilityKey: 'isShowSkills',
    defaultVisible: true
  },
  practices: {
    id: 'practices',
    displayName: 'Practices',
    visibilityKey: 'isShowPractices',
    defaultVisible: true
  },
  projects: {
    id: 'projects',
    displayName: 'Projects',
    visibilityKey: 'isShowProjects',
    defaultVisible: true
  },
  achievements: {
    id: 'achievements',
    displayName: 'Achievements',
    visibilityKey: 'isShowAchievements',
    defaultVisible: true
  },
  involvements: {
    id: 'involvements',
    displayName: 'Involvements',
    visibilityKey: 'isShowInvolvements',
    defaultVisible: true
  },
  referral: {
    id: 'referral',
    displayName: 'References',
    visibilityKey: 'isShowReferral',
    defaultVisible: true
  }
};

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

// Base configuration with default settings
const baseConfig = {
  // Section visibility settings
  isShowSummary: true,
  isShowEdu: true,
  isShowExp: true,
  isShowSkills: true,
  isShowPractices: true,
  isShowProjects: true,
  isShowAchievements: true,
  isShowInvolvements: true,
  isShowReferral: true,
  
  // Education specific settings
  isExchangeEduInstitution: true,
  isShowEduDissertation: false,
  isShowEduCourses: false,
  isShowEduHighlights: false,
  
  // Experience specific settings
  isExchangeExpCompany: true,
  isShowExpLocation: true,
  
  // Other settings
  isShowAwards: true,
  isShowVolunteer: true,
  
  // Default section order
  sectionOrder: [...defaultSectionOrder],
};

// Template-specific configurations
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
    'achievements'
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
    'referral'
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
    'experience'
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
    'referral'
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
    'referral'
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
        
        // If this is a visibility setting, we may need to update the section order
        if (field.startsWith('isShow')) {
          // Find which section this visibility setting controls
          const sectionId = Object.keys(AVAILABLE_SECTIONS).find(
            key => AVAILABLE_SECTIONS[key].visibilityKey === field
          );
          
          if (sectionId) {
            // If turning off visibility, remove from section order
            if (!value && newConfigs[state.index].sectionOrder.includes(sectionId)) {
              newConfigs[state.index].sectionOrder = newConfigs[state.index].sectionOrder
                .filter(id => id !== sectionId);
            } 
            // If turning on visibility and not already in order, add to end
            else if (value && !newConfigs[state.index].sectionOrder.includes(sectionId)) {
              newConfigs[state.index].sectionOrder = [
                ...newConfigs[state.index].sectionOrder,
                sectionId
              ];
            }
          }
        }
        
        return { configs: newConfigs };
      }),

      // Update section order for current template
      updateSectionOrder: (newOrder) => set((state) => {
        const newConfigs = [...state.configs];
        const currentConfig = newConfigs[state.index];
        
        // Only include sections that are visible in the new order
        const validOrder = newOrder.filter(sectionId => {
          const section = AVAILABLE_SECTIONS[sectionId];
          return section && currentConfig[section.visibilityKey] !== false;
        });
        
        newConfigs[state.index] = {
          ...currentConfig,
          sectionOrder: validOrder
        };
        
        return { configs: newConfigs };
      }),

      currConfig: () => get().configs[get().index],
      
      // Get section order for current template, filtered by visibility
      getSectionOrder: () => {
        const config = get().configs[get().index];
        const allSections = config.sectionOrder || defaultSectionOrder;
        
        // Filter out sections that are disabled
        return allSections.filter(sectionId => {
          const section = AVAILABLE_SECTIONS[sectionId];
          return section && config[section.visibilityKey] !== false;
        });
      },
      
      // Get all available sections with their current visibility status
      getAvailableSections: () => {
        const config = get().configs[get().index];
        
        return Object.keys(AVAILABLE_SECTIONS).map(id => {
          const section = AVAILABLE_SECTIONS[id];
          return {
            ...section,
            isVisible: config[section.visibilityKey] !== false
          };
        });
      }
    }), {
      name: 'sprb-templates',
    }
  )
);
