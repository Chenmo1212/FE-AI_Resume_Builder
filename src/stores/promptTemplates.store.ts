import create from 'zustand';
import produce from 'immer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { db as _db } from '../db/index';
const db = _db as any;
import { DEFAULT_PROMPT_TEMPLATES } from '../db/defaultPrompts';

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
  resetTemplate: (id: string) => Promise<void>;
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
      const stored = await db.prompt_templates.toArray();
      const storedMap = Object.fromEntries(stored.map((t: PromptTemplate) => [t.id, t]));
      const merged: PromptTemplate[] = DEFAULT_PROMPT_TEMPLATES.map(
        (def) => (storedMap[def.id] ?? def) as PromptTemplate
      );
      set(produce((state: PromptTemplatesStore) => {
        state.templates = merged;
        state.loading = false;
        merged.forEach((t) => {
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
      const existing = await db.prompt_templates.get(id);
      const defaultTpl = DEFAULT_PROMPT_TEMPLATES.find((t) => t.id === id);
      const newVersion = (existing?.version ?? defaultTpl?.version ?? 0) + 1;
      await db.prompt_templates.put({
        ...(existing ?? defaultTpl ?? { id, name: id, description: '' }),
        messages,
        version: newVersion,
      });
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

  resetTemplate: async (id: string) => {
    await db.prompt_templates.delete(id);
    const def = DEFAULT_PROMPT_TEMPLATES.find((t) => t.id === id);
    set(produce((state: PromptTemplatesStore) => {
      const tpl = state.templates.find((t) => t.id === id);
      if (tpl && def) { Object.assign(tpl, def); }
      state.editingMessages[id] = def ? def.messages.map((m) => ({ ...m } as PromptMessage)) : [];
    }));
  },

  isDirty: (id: string) => {
    const { templates, editingMessages } = get();
    const tpl = templates.find((t) => t.id === id);
    const editing = editingMessages[id];
    if (!tpl || !editing) return false;
    return JSON.stringify(tpl.messages) !== JSON.stringify(editing);
  },
}));
