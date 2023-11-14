import create from 'zustand';

import ProfessionalImg from 'public/images/professional.png';
import LegacyImg from 'public/images/legacy.png';
import dynamic from 'next/dynamic';

const ProfessionalTemplate = dynamic(() => import('src/templates/layouts/ProfessionalTemplate'), {
  ssr: false,
});

const LegacyTemplate = dynamic(() => import('src/templates/layouts/LegacyTemplate'), {
  ssr: false,
});

const GraduateTemplate = dynamic(() => import('src/templates/layouts/GraduateTemplate'), {
  ssr: false,
})

export const templates = [ProfessionalTemplate, LegacyTemplate, GraduateTemplate];
export const templatesSrc = [ProfessionalImg, LegacyImg, ProfessionalImg];
export const templatesName = ['Professional', 'Legacy', 'Graduate'];

export const useTemplates = create((set: any) => ({
  index: 0,
  template: templates[0],

  setTemplate: (index: number) => set({ index, template: templates[index] }),
}));

export const useItems = create((set: any) => ({
  isPhotoDisplayed: true,

  setIsPhotoDisplayed: (isPhotoDisplayed: boolean) => set({ isPhotoDisplayed }),
}));

export const useZoom = create((set: any) => ({
  zoom: 0,

  update: (value: number) => {
    const zoomLevel = +value.toFixed(1);

    set((state: any) => {
      if (zoomLevel > 0.5) state.zoom = 0.5;
      else if (zoomLevel < -0.5) state.zoom = -0.5;
      else state.zoom = zoomLevel;
    });
  },
}));

export const useLeftDrawer = create((set: any) => ({
  activeTab: -1,

  update: (value: number) => {
    set((state: any) => {
      state.activeTab = value === state.activeTab ? -1 : value;
    });
  },
}));

export const useRightDrawer = create((set: any) => ({
  activeTab: -1,

  update: (value: number) => {
    set((state: any) => {
      state.activeTab = value === state.activeTab ? -1 : value;
    });
  },
}));
