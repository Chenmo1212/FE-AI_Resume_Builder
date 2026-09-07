# Global Settings Modal — Design Spec

**Date:** 2025-01  
**Status:** Approved

---

## 1. Overview

Add a **global Settings system** to the Resume Builder FE. The initial release ships one category: **AI Configuration**, which lets users control the LLM model, temperature, and which resume sections to optimize before submitting an AI task. The system is designed to grow — future categories (Display, API Keys, etc.) can be added by appending to a single constants file without touching the Modal framework.

### Problem being solved

Currently all AI parameters (model, temperature, optimized sections) are hardcoded on the backend. Users have no visibility or control. The `SubmitBtn` in `AIResume.tsx` sends only `task_list` and `resume` — no AI config is transmitted.

### Success criteria

1. A ⚙ Settings button appears in the right sidebar's bottom action group.
2. Clicking it opens a two-column Modal (left: categories, right: content).
3. The AI category exposes Model, Temperature, and Optimize Sections controls.
4. Changes persist across browser sessions via `localStorage`.
5. When a task is submitted, `ai_config` is included in the request body alongside the existing `task_list` and `resume` fields.
6. Adding a new Settings category in the future requires changes to constants only, not to the Modal shell.

---

## 2. Architecture

```
Sidebar.jsx
  └─ useState(settingsOpen)
  └─ <SettingsModal open={settingsOpen} onClose={...} />

SettingsModal.tsx
  └─ useState(activeCategory)  // 'ai' | future keys
  └─ <CategoryList> + <ContentPane>
  └─ <AIPane> reads/writes → ai.store.ts

ai.store.ts  (zustand + persist)
  └─ model, temperature, sections
  └─ setModel(), setTemperature(), setSections(), getConfig()

AIResume.tsx / SubmitBtn
  └─ useAIStore().getConfig()
  └─ passes ai_config into useTasks.create()

jobs.store.ts / create()
  └─ forwards ai_config to addTasks() → POST /tasks/run
```

### Data flow: Settings → Request

```
User changes Model in SettingsModal
  → useAIStore.setModel('gpt-4o')
  → zustand persists to localStorage key 'sprb-ai-config'

User clicks Submit in AIResume
  → SubmitBtn calls useAIStore().getConfig()
  → create({ task_list, resume, ai_config: { model, temperature, sections } })
  → addTasks(data) → POST /tasks/run body includes ai_config
```

---

## 3. File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/stores/ai.store.ts` | **Create** | AI config state + persistence |
| `src/core/widgets/SettingsModal.tsx` | **Create** | Modal shell + AI pane |
| `src/styles/icons.jsx` | **Modify** | Register `settings` icon (`MdSettings`) |
| `src/core/containers/Sidebar.jsx` | **Modify** | Settings button + mount Modal |
| `src/core/widgets/AIResume.tsx` | **Modify** | Inject `ai_config` on submit |

`jobs.store.ts` and `src/axios/api.ts` require **no changes** — `addTasks` already passes its argument as-is to the API.

---

## 4. Store: `ai.store.ts`

### Types

```typescript
export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
export type AISection = 'experience' | 'projects' | 'skills' | 'summary';

export interface AIConfig {
  model: AIModel;
  temperature: number;   // 0.0 – 1.0
  sections: AISection[];
}
```

### Default values

| Field | Default |
|-------|---------|
| `model` | `'gpt-4o-mini'` |
| `temperature` | `0.7` |
| `sections` | `['experience', 'projects', 'skills', 'summary']` |

### Store actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `setModel` | `(model: AIModel) => void` | Replace model |
| `setTemperature` | `(temperature: number) => void` | Replace temperature |
| `setSections` | `(sections: AISection[]) => void` | Replace sections array |
| `getConfig` | `() => AIConfig` | Return `{ model, temperature, sections }` snapshot |

### Persistence

`zustand/persist` with key `'sprb-ai-config'`. Consistent with existing keys `'sprb-jobs'` and `'sprb-tasks'`.

---

## 5. Component: `SettingsModal.tsx`

### Props

```typescript
interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}
```

### Layout

- **Modal**: width `560px`, `top: 80px`, no footer (auto-save via store)
- **Background / border colours**: match existing dark theme (`#2a2a2a` body, `#3a3a3a` borders)
- **Two-column body** (`display: flex`):
  - Left `CategoryList`: `width: 130px`, `border-right: 1px solid #3a3a3a`
  - Right `ContentPane`: `flex: 1`, `padding: 8px 24px 8px 20px`

### Category list

```typescript
// Constants — the only place to touch when adding a new category
type CategoryKey = 'ai';   // extend union as categories are added

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'ai', label: 'AI' },
];

const PANE_MAP: Record<CategoryKey, React.ReactNode> = {
  ai: <AIPane />,
};
```

`activeCategory` defaults to `'ai'`. Clicking a category item sets it.

**Category item styles (styled-components):**
- Selected: `background #3a3a3a`, `color #fff`
- Default: `color #aaa`
- Hover: `background #333`, `color #fff`

### AI Pane controls

All controls use **Ant Design 4** components, matching the existing Ant Design usage in the project.

| Control | Component | Props |
|---------|-----------|-------|
| Model | `<Select>` | `size="small"`, width `160px`, options from `AI_MODELS` constant |
| Temperature | `<Slider>` + value label | `min=0 max=1 step=0.1`, `tooltip={{ formatter: null }}`, right-side `<span>` showing `value.toFixed(1)` |
| Sections | `<Checkbox>` × 4 | 2-column CSS grid, each writes back via `setSections` |

**Sections constraint:** At least 1 section must remain checked. If a user unchecks a box that would leave zero sections selected, ignore the change (do not call `setSections`).

### Section headings (visual grouping within AI pane)

Use small uppercase label style (`font-size: 11px`, `letter-spacing: 0.08em`, `color: #888`, `text-transform: uppercase`) above each group: **"MODEL"**, **"GENERATION"**, **"OPTIMIZE SECTIONS"**.

---

## 6. Sidebar changes

### New icon

`src/styles/icons.jsx`: import `MdSettings` from `react-icons/md`, register as key `'settings'`.

### Settings button

In `Sidebar.jsx`, add `const [settingsOpen, setSettingsOpen] = useState(false)`.

Add a new `<IconWrapper>` after `<PrintSettings />` (bottom of the action group):

```jsx
<IconWrapper onClick={() => setSettingsOpen(true)}>
  <Tooltip placement="left" title="Settings">
    <IconButton>{getIcon('settings')}</IconButton>
  </Tooltip>
</IconWrapper>
```

Mount `<SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />` inside the `<Wrapper>`, after `<SideMenu>`.

---

## 7. AIResume changes

In `SubmitBtn`, import `useAIStore` from `../../stores/ai.store`.

Add inside the component:
```typescript
const getAIConfig = useAIStore((state) => state.getConfig);
```

In `handleSubmit`, pass `ai_config` to `create`:
```typescript
create({
  task_list: selectedRows,
  resume: isPrefer ? preferResume : resume,
  ai_config: getAIConfig(),
});
```

No other changes to `AIResume.tsx`.

---

## 8. Constraints

- Use only libraries already present in `package.json` (Ant Design 4, styled-components 5, zustand 3, immer 9, react-icons 4).
- Do not install new dependencies.
- All styled-components use the same dark palette already in use: `#222`, `#2a2a2a`, `#3a3a3a`, `rgb(230,230,230)`, `#aaa`, `#888`.
- TypeScript for new files (`ai.store.ts`, `SettingsModal.tsx`). Existing `.jsx` files stay as JSX.
- Zustand store uses `create` (v3 API, default import) + `persist` middleware + `produce` from immer — consistent with `jobs.store.ts`.
- No unit test infrastructure exists in the project; manual verification steps replace automated tests.

---

## 9. Out of scope

- Prompt template management (deferred — requires backend DB changes)
- Dynamic model list from a `/models` endpoint (deferred — requires backend work)
- Display / API Key / Notification settings categories (future work; framework supports them)
- Backend changes (the backend receives `ai_config` in the request body and is responsible for reading it)
