import create from 'zustand';
import dynamic from 'next/dynamic';
import ProfessionalImg from '../../public/images/professional.png';
import LegacyImg from '../../public/images/legacy.png';
import OneColumnImg from '../../public/images/onecolumn.png';
import ClassicImg from '../../public/images/classic.png';
import { persist } from 'zustand/middleware';

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
export const templatesSrc = [ProfessionalImg, LegacyImg, ProfessionalImg, OneColumnImg, ClassicImg];
export const templatesName = ['Professional', 'Legacy', 'Graduate', 'OneColumn', 'Classic'];

export const INTRO_CONFIGS = [{
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
  key: "isShowInvolvement",
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

const baseConfig = {
  isShowReferral: true,
  isShowEdu: true,
  isExchangeEduInstitution: true,
  isShowEduDissertation: true,
  isShowEduCourses: true,
  isShowEduHighlights: true,

  isShowExp: true,
  isExchangeExpCompany: true,
  isShowExpLocation: true,

  isShowInvolvement: true,
  isShowAchievements: true,
  isShowProjects: true,
  isShowAwards: true,
  isShowVolunteer: true,
};

export const useTemplates = create(
  persist(
    (set, get) => ({
      index: 0,
      configs: [baseConfig, baseConfig, baseConfig, baseConfig, baseConfig],

      getTemplate: () => templates[get().index],

      setTemplate: (index) => set((state) => ({
        index,
        template: templates[index],
        config: state.configs[index],
      })),

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
