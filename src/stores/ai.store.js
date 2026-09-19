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
      provider: 'openai',
      apiKey: '',
      baseUrl: '',
      _hydrated: false,

      setModel: (model) =>
        set(produce((state) => { state.model = model; })),

      setTemperature: (temperature) =>
        set(produce((state) => { state.temperature = temperature; })),

      setSections: (sections) =>
        set(produce((state) => { state.sections = sections; })),

      setProvider: (provider) =>
        set(produce((state) => { state.provider = provider; })),

      setApiKey: (apiKey) =>
        set(produce((state) => { state.apiKey = apiKey; })),

      clearApiKey: () =>
        set(produce((state) => { state.apiKey = ''; })),

      setBaseUrl: (baseUrl) =>
        set(produce((state) => { state.baseUrl = baseUrl; })),

      clearBaseUrl: () =>
        set(produce((state) => { state.baseUrl = ''; })),

      getConfig: () => {
        const { model, temperature, sections, provider, apiKey, baseUrl } = get();
        return { model, temperature, sections, provider, apiKey, baseUrl };
      },
    }),
    {
      name: 'sprb-ai-config',
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    }
  )
);
