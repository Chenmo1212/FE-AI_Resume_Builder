import create from 'zustand';
import produce from 'immer';
import { getPromptTemplates, updatePromptTemplate } from '../axios/api';

export interface PromptMessage {
  role: 'system' | 'human' | 'ai';
  content: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  version: number;
  messages: PromptMessage[];
}

export interface PromptTemplatesStore {
  templates: PromptTemplate[];
  editingMessages: Record<string, PromptMessage[]>;
  loading: boolean;
  saving: Record<string, boolean>;
  fetchTemplates: () => Promise<void>;
  setEditingMessages: (id: string, messages: PromptMessage[]) => void;
  saveTemplate: (id: string) => Promise<void>;
  isDirty: (id: string) => boolean;
}

export const usePromptTemplatesStore = create<PromptTemplatesStore>((set, get) => ({
  templates: [],
  editingMessages: {},
  loading: false,
  saving: {},

  fetchTemplates: async () => {
    set(produce((state: PromptTemplatesStore) => { state.loading = true; }));
    try {
      const res = await getPromptTemplates();
      const templates: PromptTemplate[] = res.data;
      set(produce((state: PromptTemplatesStore) => {
        state.templates = templates;
        state.loading = false;
        // Initialise editing state with current messages
        templates.forEach((t) => {
          if (!state.editingMessages[t.id]) {
            state.editingMessages[t.id] = t.messages.map((m) => ({ ...m }));
          }
        });
      }));
    } catch {
      set(produce((state: PromptTemplatesStore) => { state.loading = false; }));
    }
  },

  setEditingMessages: (id, messages) =>
    set(produce((state: PromptTemplatesStore) => {
      state.editingMessages[id] = messages;
    })),

  saveTemplate: async (id: string) => {
    const { editingMessages } = get();
    const messages = editingMessages[id];
    if (!messages) return;
    set(produce((state: PromptTemplatesStore) => { state.saving[id] = true; }));
    try {
      const res = await updatePromptTemplate(id, messages);
      const newVersion: number = res.data.version;
      set(produce((state: PromptTemplatesStore) => {
        state.saving[id] = false;
        const tpl = state.templates.find((t) => t.id === id);
        if (tpl) {
          tpl.version = newVersion;
          tpl.messages = messages.map((m) => ({ ...m }));
        }
      }));
    } catch {
      set(produce((state: PromptTemplatesStore) => { state.saving[id] = false; }));
    }
  },

  isDirty: (id: string) => {
    const { templates, editingMessages } = get();
    const tpl = templates.find((t) => t.id === id);
    const editing = editingMessages[id];
    if (!tpl || !editing) return false;
    return JSON.stringify(tpl.messages) !== JSON.stringify(editing);
  },
}));
