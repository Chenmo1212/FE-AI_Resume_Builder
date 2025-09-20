import create from 'zustand';

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
