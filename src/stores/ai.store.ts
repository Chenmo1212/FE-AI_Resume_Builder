import create from 'zustand';
import { persist } from 'zustand/middleware';
import produce from 'immer';

export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
export type AISection = 'experience' | 'projects' | 'skills' | 'summary';

export interface AIConfig {
  model: AIModel;
  temperature: number;
  sections: AISection[];
}

export interface AIStore extends AIConfig {
  setModel: (model: AIModel) => void;
  setTemperature: (temperature: number) => void;
  setSections: (sections: AISection[]) => void;
  getConfig: () => AIConfig;
}

const ALL_SECTIONS: AISection[] = ['experience', 'projects', 'skills', 'summary'];

export const useAIStore = create<AIStore>(
  persist(
    (set, get) => ({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      sections: ALL_SECTIONS,

      setModel: (model) =>
        set(produce((state: AIStore) => { state.model = model; })),

      setTemperature: (temperature) =>
        set(produce((state: AIStore) => { state.temperature = temperature; })),

      setSections: (sections) =>
        set(produce((state: AIStore) => { state.sections = sections; })),

      getConfig: () => {
        const { model, temperature, sections } = get();
        return { model, temperature, sections };
      },
    }),
    { name: 'sprb-ai-config' }
  )
);
