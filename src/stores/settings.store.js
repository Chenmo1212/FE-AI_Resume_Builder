import create from 'zustand';

import ProfessionalImg from '../../public/images/professional.png';
import LegacyImg from '../../public/images/legacy.png';
import dynamic from 'next/dynamic';

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

export const templates = [ProfessionalTemplate, LegacyTemplate, GraduateTemplate, OneColumnTemplate];
export const templatesSrc = [ProfessionalImg, LegacyImg, ProfessionalImg, LegacyImg];
export const templatesName = ['Professional', 'Legacy', 'Graduate', 'OneColumn'];

export const useTemplates = create((set) => ({
  index: 0,
  template: templates[0],

  setTemplate: (index) => set({ index, template: templates[index] }),
}));

export const useItems = create((set) => ({
  isPhotoDisplayed: true,

  setIsPhotoDisplayed: (isPhotoDisplayed) => set({ isPhotoDisplayed }),
}));

export const useZoom = create((set) => ({
  zoom: 0,

  update: (value) => {
    const zoomLevel = +value.toFixed(1);

    set((state) => {
      if (zoomLevel > 0.5) state.zoom = 0.5;
      else if (zoomLevel < -0.5) state.zoom = -0.5;
      else state.zoom = zoomLevel;
    });
  },
}));

export const useLeftDrawer = create((set) => ({
  activeTab: -1,

  update: (value) => {
    set((state) => {
      state.activeTab = value === state.activeTab ? -1 : value;
    });
  },
}));

export const useRightDrawer = create((set) => ({
  activeTab: -1,

  update: (value) => {
    set((state) => {
      state.activeTab = value === state.activeTab ? -1 : value;
    });
  },
}));
