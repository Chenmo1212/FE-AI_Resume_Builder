# Global Settings Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent global Settings Modal to the Resume Builder FE, starting with an AI Configuration category that lets users control LLM model, temperature, and optimized resume sections.

**Architecture:** New `ai.store.ts` (zustand + persist) holds AI config. A new `SettingsModal.tsx` (two-column Modal) reads/writes the store. A ⚙ button in `Sidebar.jsx` opens the Modal. `AIResume.tsx` injects `ai_config` into the task submit payload.

**Tech Stack:** Next.js 12, React 17, TypeScript, Ant Design 4, styled-components 5, zustand 3 (v3 API), immer 9, react-icons 4.

**Spec:** `docs/superpowers/specs/2025-01-global-settings-modal-design.md`

## Global Constraints

- Use only libraries already in `package.json` — do NOT install new dependencies.
- New files use TypeScript (`.ts` / `.tsx`). Existing `.jsx` files stay as JSX.
- Zustand v3 API: `import create from 'zustand'` (default import, not named).
- Dark palette: `#222`, `#2a2a2a`, `#3a3a3a`, `rgb(230,230,230)`, `#aaa`, `#888`.
- Ant Design version is **4** — use `Modal` props for v4 (e.g. `visible` → `open` is fine for v4.23+; use `bodyStyle` not `styles.body` if v4 <4.23).
- All styled-components follow existing patterns in `SideDrawer.jsx`, `Sidebar.jsx`.
- No automated test infrastructure — each task ends with a manual verification checklist.

---

## File Map

| File | Action |
|------|--------|
| `src/stores/ai.store.ts` | **Create** |
| `src/core/widgets/SettingsModal.tsx` | **Create** |
| `src/styles/icons.jsx` | **Modify** — add `MdSettings` |
| `src/core/containers/Sidebar.jsx` | **Modify** — settings button + Modal mount |
| `src/core/widgets/AIResume.tsx` | **Modify** — inject `ai_config` on submit |

---

### Task 1: AI Config Store

**Files:**
- Create: `src/stores/ai.store.ts`

**Interfaces:**
- Produces:
  - `export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo'`
  - `export type AISection = 'experience' | 'projects' | 'skills' | 'summary'`
  - `export interface AIConfig { model: AIModel; temperature: number; sections: AISection[]; }`
  - `export const useAIStore` — zustand store with actions `setModel`, `setTemperature`, `setSections`, `getConfig`

- [ ] **Step 1: Create `src/stores/ai.store.ts`**

```typescript
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
```

- [ ] **Step 2: Manual verification**
  - Open browser DevTools → Application → Local Storage
  - Navigate to the editor page and confirm key `sprb-ai-config` does NOT yet exist (store hasn't been used yet — that's expected at this stage)
  - Confirm the file has no TypeScript errors by checking that the import paths match: `zustand` `zustand/middleware` `immer` all exist in `package.json`

- [ ] **Step 3: Commit**

```bash
git add src/stores/ai.store.ts
git commit -m "feat: add AI config store with zustand persist"
```

---

### Task 2: Settings icon

**Files:**
- Modify: `src/styles/icons.jsx`

**Interfaces:**
- Produces: `getIcon('settings')` returns `<MdSettings />`

- [ ] **Step 1: Add `MdSettings` to the import block in `src/styles/icons.jsx`**

Find the existing `react-icons/md` import block (lines 15–38). Add `MdSettings` to it:

```jsx
import {
  MdVpnKey,
  MdVerifiedUser,
  MdWork,
  MdLocationOn,
  MdCall,
  MdMail,
  MdPermIdentity,
  MdBuild,
  MdEdit,
  MdColorLens,
  MdLibraryBooks,
  MdAddCircleOutline,
  MdPeople,
  MdLabel,
  MdZoomOut,
  MdZoomIn,
  MdSave,
  MdCloudUpload,
  MdPrint,
  MdHome,
  MdLanguage,
  MdPets,
  MdOutlinePersonPin,
  MdSettings,
} from 'react-icons/md';
```

- [ ] **Step 2: Register the icon in the `icons` Map**

Find the line `['reset', <IoReload />],` and add the entry immediately after:

```jsx
  ['reset', <IoReload />],
  ['settings', <MdSettings />],
```

- [ ] **Step 3: Manual verification**
  - Temporarily add `console.log(getIcon('settings'))` in any component, run `next dev`, confirm it logs a React element (not `undefined`). Remove the log after.

- [ ] **Step 4: Commit**

```bash
git add src/styles/icons.jsx
git commit -m "feat: register settings icon (MdSettings)"
```

---

### Task 3: SettingsModal component

**Files:**
- Create: `src/core/widgets/SettingsModal.tsx`

**Interfaces:**
- Consumes:
  - `useAIStore` from `../../stores/ai.store` — actions: `setModel(AIModel)`, `setTemperature(number)`, `setSections(AISection[])`, fields: `model`, `temperature`, `sections`
- Produces:
  - `export const SettingsModal: React.FC<{ open: boolean; onClose: () => void }>`

- [ ] **Step 1: Create `src/core/widgets/SettingsModal.tsx`**

```tsx
import React, { useState } from 'react';
import { Modal, Select, Slider, Checkbox } from 'antd';
import styled from 'styled-components';
import { useAIStore, AIModel, AISection } from '../../stores/ai.store';

// ─── Layout ──────────────────────────────────────────────────────────────────

const ModalBody = styled.div`
  display: flex;
  min-height: 300px;
`;

const CategoryList = styled.ul`
  width: 130px;
  flex-shrink: 0;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  border-right: 1px solid #3a3a3a;
`;

const CategoryItem = styled.li<{ active: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px 0 0 4px;
  font-size: 13px;
  color: ${({ active }) => (active ? '#fff' : '#aaa')};
  background: ${({ active }) => (active ? '#3a3a3a' : 'transparent')};
  transition: background 0.15s, color 0.15s;
  &:hover {
    color: #fff;
    background: #333;
  }
`;

const ContentPane = styled.div`
  flex: 1;
  padding: 8px 24px 8px 20px;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  margin: 18px 0 10px;
  &:first-child {
    margin-top: 4px;
  }
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const FieldLabel = styled.span`
  color: #ccc;
  font-size: 13px;
  min-width: 90px;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const TempValue = styled.span`
  color: #aaa;
  font-size: 12px;
  width: 28px;
  text-align: right;
  flex-shrink: 0;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
`;

// ─── Constants ────────────────────────────────────────────────────────────────

type CategoryKey = 'ai';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'ai', label: 'AI' },
];

const AI_MODELS: { label: string; value: AIModel }[] = [
  { label: 'gpt-4o', value: 'gpt-4o' },
  { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
  { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
];

const SECTION_OPTIONS: { label: string; value: AISection }[] = [
  { label: 'Experience', value: 'experience' },
  { label: 'Projects', value: 'projects' },
  { label: 'Skills', value: 'skills' },
  { label: 'Summary', value: 'summary' },
];

// ─── AI Pane ──────────────────────────────────────────────────────────────────

const AIPane: React.FC = () => {
  const { model, temperature, sections, setModel, setTemperature, setSections } = useAIStore();

  const handleSectionChange = (value: AISection, checked: boolean) => {
    const next = checked
      ? [...sections, value]
      : sections.filter((s) => s !== value);
    // Enforce: at least 1 section must remain selected
    if (next.length === 0) return;
    setSections(next);
  };

  return (
    <>
      <SectionTitle>Model</SectionTitle>
      <FieldRow>
        <FieldLabel>LLM Model</FieldLabel>
        <Select
          value={model}
          onChange={(val: AIModel) => setModel(val)}
          options={AI_MODELS}
          size="small"
          style={{ width: 160 }}
        />
      </FieldRow>

      <SectionTitle>Generation</SectionTitle>
      <FieldRow>
        <FieldLabel>Temperature</FieldLabel>
        <SliderRow>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(val: number) => setTemperature(val)}
            style={{ flex: 1 }}
            tooltip={{ formatter: null }}
          />
          <TempValue>{temperature.toFixed(1)}</TempValue>
        </SliderRow>
      </FieldRow>

      <SectionTitle>Optimize sections</SectionTitle>
      <CheckboxGrid>
        {SECTION_OPTIONS.map(({ label, value }) => (
          <Checkbox
            key={value}
            checked={sections.includes(value)}
            onChange={(e) => handleSectionChange(value, e.target.checked)}
            style={{ color: '#ccc', fontSize: 13 }}
          >
            {label}
          </Checkbox>
        ))}
      </CheckboxGrid>
    </>
  );
};

// ─── Pane map — add future categories here ────────────────────────────────────

const PANE_MAP: Record<CategoryKey, React.ReactNode> = {
  ai: <AIPane />,
};

// ─── Modal ────────────────────────────────────────────────────────────────────

export const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('ai');

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Settings"
      width={560}
      bodyStyle={{ padding: '8px 0', background: '#2a2a2a' }}
      style={{ top: 80 }}
    >
      <ModalBody>
        <CategoryList>
          {CATEGORIES.map(({ key, label }) => (
            <CategoryItem
              key={key}
              active={activeCategory === key}
              onClick={() => setActiveCategory(key)}
            >
              {label}
            </CategoryItem>
          ))}
        </CategoryList>
        <ContentPane>{PANE_MAP[activeCategory]}</ContentPane>
      </ModalBody>
    </Modal>
  );
};
```

- [ ] **Step 2: Manual verification**
  - Import `SettingsModal` in any page temporarily: `<SettingsModal open={true} onClose={() => {}} />`
  - Confirm the Modal renders with the two-column layout
  - Change Model dropdown → confirm store updates (check DevTools → Local Storage `sprb-ai-config`)
  - Drag Temperature slider → confirm value label updates in real time
  - Uncheck all sections one by one → confirm the last checked box cannot be unchecked
  - Remove the temporary usage after verifying

- [ ] **Step 3: Commit**

```bash
git add src/core/widgets/SettingsModal.tsx
git commit -m "feat: add SettingsModal with AI configuration pane"
```

---

### Task 4: Wire Settings button into Sidebar

**Files:**
- Modify: `src/core/containers/Sidebar.jsx`

**Interfaces:**
- Consumes:
  - `SettingsModal` from `../widgets/SettingsModal` — props: `{ open: boolean; onClose: () => void }`
  - `getIcon('settings')` from `../../styles/icons` — already registered in Task 2

- [ ] **Step 1: Add the import for `SettingsModal` in `Sidebar.jsx`**

Find the existing imports block (around lines 1–17). Add one line after the `PrintSettings` import:

```jsx
import { SettingsModal } from '../widgets/SettingsModal';
```

- [ ] **Step 2: Add `settingsOpen` state to the `Sidebar` component**

Find `export const Sidebar = () => {` (line ~73). Add the state declaration as the first line inside the component body:

```jsx
const [settingsOpen, setSettingsOpen] = useState(false);
```

- [ ] **Step 3: Add the Settings button after `<PrintSettings />`**

Find `<PrintSettings />` (around line 135). Add the icon button immediately after:

```jsx
<PrintSettings />
<IconWrapper onClick={() => setSettingsOpen(true)}>
  <Tooltip placement="left" title="Settings">
    <IconButton>{getIcon('settings')}</IconButton>
  </Tooltip>
</IconWrapper>
```

- [ ] **Step 4: Mount `<SettingsModal>` inside `<Wrapper>`**

Find `<SideBackground isShown={activeTab !== -1} update={setActiveTab} />` (last line before closing `</Wrapper>`). Add the Modal mount before it:

```jsx
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SideBackground isShown={activeTab !== -1} update={setActiveTab} />
```

- [ ] **Step 5: Manual verification**
  - Run `next dev`
  - Confirm ⚙ icon appears at the bottom of the right sidebar action group
  - Click it → Modal opens
  - Click outside Modal (backdrop) or press Escape → Modal closes
  - Modal closing does not affect the right sidebar drawers (Template / Theme / Robot)

- [ ] **Step 6: Commit**

```bash
git add src/core/containers/Sidebar.jsx
git commit -m "feat: add Settings button to sidebar, mount SettingsModal"
```

---

### Task 5: Inject ai_config into task submission

**Files:**
- Modify: `src/core/widgets/AIResume.tsx`

**Interfaces:**
- Consumes:
  - `useAIStore` from `../../stores/ai.store` — `getConfig: () => AIConfig`
  - `useTasks.create(data)` — existing signature; `data` now includes `ai_config: AIConfig`

- [ ] **Step 1: Add `useAIStore` import to `AIResume.tsx`**

Find the existing import block (lines 1–20). Add after the `shallow` import:

```tsx
import { useAIStore } from '../../stores/ai.store';
```

- [ ] **Step 2: Read `getConfig` inside `SubmitBtn`**

Find the `SubmitBtn` component body (around line 22). After the existing `preferResume` line, add:

```tsx
const getAIConfig = useAIStore((state) => state.getConfig);
```

- [ ] **Step 3: Pass `ai_config` in the `create()` call**

Find the `create({ task_list, resume })` call inside `handleSubmit` (around line 39). Replace it:

```tsx
create({
  task_list: selectedRows,
  resume: isPrefer ? preferResume : resume,
  ai_config: getAIConfig(),
});
```

- [ ] **Step 4: Manual verification**
  - Open DevTools → Network tab
  - Change AI Model to `gpt-4o` in Settings Modal
  - Select a task in the AI Resume tab and click Submit
  - Inspect the `POST /tasks/run` request body
  - Confirm it contains `"ai_config": { "model": "gpt-4o", "temperature": 0.7, "sections": [...] }`

- [ ] **Step 5: Commit**

```bash
git add src/core/widgets/AIResume.tsx
git commit -m "feat: inject ai_config into task submit payload"
```

---

## Plan self-review

### Spec coverage check

| Spec requirement | Covered by |
|-----------------|------------|
| ⚙ button in right sidebar | Task 4 |
| Two-column Modal (categories + content) | Task 3 |
| Model, Temperature, Sections controls | Task 3 |
| Changes persist via localStorage | Task 1 (zustand persist) |
| `ai_config` in request body | Task 5 |
| New category = constants only | Task 3 (CATEGORIES + PANE_MAP constants) |

All 6 success criteria covered. ✅

### Type consistency check

- `AIModel`, `AISection`, `AIConfig` defined in Task 1, consumed in Task 3 and Task 5 — names match. ✅
- `useAIStore` exported from Task 1, imported in Task 3 and Task 5 — export name consistent. ✅
- `getConfig()` defined in Task 1 as `() => AIConfig`, called in Task 5 as `getAIConfig()` (local alias) — correct. ✅
- `SettingsModal` exported in Task 3, imported in Task 4 — name matches. ✅

### Placeholder scan

No TBD, TODO, or "implement later" found. All code blocks are complete. ✅
