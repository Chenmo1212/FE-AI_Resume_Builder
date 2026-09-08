import create from 'zustand';
import { persist } from 'zustand/middleware';
import produce from 'immer';

const ALL_SECTIONS = ['experience', 'projects', 'skills', 'summary'];

export const useAIStore = create(
  persist(
    (set, get) => ({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      sections: ALL_SECTIONS,

      setModel: (model) =>
        set(
          produce((state) => {
            state.model = model;
          })
        ),

      setTemperature: (temperature) =>
        set(
          produce((state) => {
            state.temperature = temperature;
          })
        ),

      setSections: (sections) =>
        set(
          produce((state) => {
            state.sections = sections;
          })
        ),

      getConfig: () => {
        const { model, temperature, sections } = get();
        return { model, temperature, sections };
      },
    }),
    { name: 'sprb-ai-config' }
  )
);
