import create from 'zustand';
import produce from 'immer';
import { db } from '../db/index';
import { DEFAULT_PROMPT_TEMPLATES } from '../db/defaultPrompts';

export const usePromptTemplatesStore = create((set, get) => ({
  templates: [],
  editingMessages: {},
  loading: false,
  saving: {},

  fetchTemplates: async () => {
    set(produce((state) => { state.loading = true; }));
    try {
      const stored = await db.prompt_templates.toArray();
      const storedMap = Object.fromEntries(stored.map((t) => [t.id, t]));
      const merged = DEFAULT_PROMPT_TEMPLATES.map(
        (def) => storedMap[def.id] ?? def
      );
      set(produce((state) => {
        state.templates = merged;
        merged.forEach((t) => {
          if (!state.editingMessages[t.id]) {
            state.editingMessages[t.id] = t.messages.map((m) => ({ ...m }));
          }
        });
      }));
    } catch (err) {
      console.error('Failed to fetch prompt templates:', err);
    } finally {
      set(produce((state) => { state.loading = false; }));
    }
  },

  setEditingMessages: (id, messages) =>
    set(produce((state) => {
      state.editingMessages[id] = messages;
    })),

  saveTemplate: async (id) => {
    const { editingMessages } = get();
    const messages = editingMessages[id];
    if (!messages) return;
    set(produce((state) => { state.saving[id] = true; }));
    try {
      const existing = await db.prompt_templates.get(id);
      const defaultTpl = DEFAULT_PROMPT_TEMPLATES.find((t) => t.id === id);
      const newVersion = (existing?.version ?? defaultTpl?.version ?? 0) + 1;
      await db.prompt_templates.put({
        ...(existing ?? defaultTpl ?? { id, name: id, description: '' }),
        messages,
        version: newVersion,
      });
      set(produce((state) => {
        const tpl = state.templates.find((t) => t.id === id);
        if (tpl) {
          tpl.version = newVersion;
          tpl.messages = messages.map((m) => ({ ...m }));
        }
      }));
    } catch (err) {
      console.error('Failed to save prompt template:', err);
    } finally {
      set(produce((state) => { state.saving[id] = false; }));
    }
  },

  resetTemplate: async (id) => {
    await db.prompt_templates.delete(id);
    const def = DEFAULT_PROMPT_TEMPLATES.find((t) => t.id === id);
    set(produce((state) => {
      const tpl = state.templates.find((t) => t.id === id);
      if (tpl && def) { Object.assign(tpl, def); }
      state.editingMessages[id] = def ? def.messages.map((m) => ({ ...m })) : [];
    }));
  },

  isDirty: (id) => {
    const { templates, editingMessages } = get();
    const tpl = templates.find((t) => t.id === id);
    const editing = editingMessages[id];
    if (!tpl || !editing) return false;
    return JSON.stringify(tpl.messages) !== JSON.stringify(editing);
  },
}));
