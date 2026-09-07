# Global Settings Modal — SDD Controller Prompt

> Paste this entire prompt into a **new chat** to execute the implementation plan.

---

## Your Role

You are the **SDD Controller** for this implementation. You dispatch implementer and reviewer subagents, track progress in a ledger file, and drive the plan to completion without stopping to check in unless one of the four hard stops applies (irreversible/destructive operation; security-sensitive action; side effect outside this worktree; plan so broken every path is a guess).

**Key documents:**
- Plan: `docs/superpowers/plans/2025-01-global-settings-modal.md`
- Spec: `docs/superpowers/specs/2025-01-global-settings-modal-design.md`
- Workspace root: `/Users/chandler/Project/Resume_Builder/FE-AI_Resume_Builder`

Read both documents before doing anything else.

---

## Global Constraints (copy these verbatim into every reviewer dispatch)

- Use only libraries already in `package.json` — do NOT install new dependencies.
- New files use TypeScript (`.ts` / `.tsx`). Existing `.jsx` files stay as JSX.
- Zustand v3 API: `import create from 'zustand'` (default import, not named).
- Dark palette: `#222`, `#2a2a2a`, `#3a3a3a`, `rgb(230,230,230)`, `#aaa`, `#888`.
- Ant Design version is **4** — use `bodyStyle` prop on `Modal`, not `styles.body`.
- All styled-components follow existing patterns in `SideDrawer.jsx`, `Sidebar.jsx`.
- No automated test infrastructure — each task ends with a manual verification checklist recorded in the report.

---

## Setup (do this first)

1. `cd /Users/chandler/Project/Resume_Builder/FE-AI_Resume_Builder`
2. Confirm branch: `git branch` — you should be on `main`. If the codebase has no feature branch, proceed on `main` (no worktree needed for a single-developer project).
3. Run the SDD workspace script to create the ledger directory:
   ```bash
   ~/.bob/skills/subagent-driven-development/scripts/sdd-workspace docs/superpowers/plans/2025-01-global-settings-modal.md
   ```
   Note the printed workspace path (e.g. `.superpowers/sdd/2025-01-global-settings-modal/`).
4. Create the ledger at `<workspace>/progress.md` with first line:
   `# SDD ledger — plan: docs/superpowers/plans/2025-01-global-settings-modal.md`
5. Record `MERGE_BASE=$(git rev-parse HEAD)` — needed for the final review.

---

## Pre-flight scan

Before dispatching Task 1, scan the plan for conflicts and record the table in the ledger. Check:

| Task pair | Shared file / interface | Finding |
|-----------|------------------------|---------|
| T1 → T3 | `useAIStore`, `AIModel`, `AISection`, `AIConfig` types | T3 consumes T1's exports; T1 must be committed before T3 dispatches |
| T1 → T5 | `useAIStore.getConfig()` | T5 consumes T1's `getConfig`; T1 must be committed before T5 dispatches |
| T2 → T4 | `getIcon('settings')` | T4 consumes T2's registered icon; T2 must be committed before T4 dispatches |
| T3 → T4 | `SettingsModal` export | T4 imports T3's export; T3 must be committed before T4 dispatches |
| T3 self | `AIPane` reads store; `PANE_MAP` holds `<AIPane />` instance | `AIPane` is defined before `PANE_MAP` — order correct |
| T5 self | Calls `create({ ..., ai_config: getAIConfig() })` | `getAIConfig` is `useAIStore((state) => state.getConfig)` — a function reference, called inline; correct |

---

## Execution Order (parallel batches)

```
Batch A (parallel): Task 1 + Task 2    — no shared files, fully independent
         ↓
Batch B (parallel): Task 3 + Task 5   — both depend on Task 1 completion; mutually independent
         ↓
Batch C (sequential): Task 4           — depends on Task 2 (icon) + Task 3 (SettingsModal)
```

**Rule:** Never dispatch an implementer until all its dependencies are committed to git.

---

## Batch A — Dispatch Task 1 and Task 2 in parallel

Record `BASE_A=$(git rev-parse HEAD)` before dispatching.

### Task 1 implementer prompt

```
You are implementing Task 1: AI Config Store

## Task Description

Read your task brief first. Run:
  ~/.bob/skills/subagent-driven-development/scripts/task-brief \
    docs/superpowers/plans/2025-01-global-settings-modal.md 1
The printed path is your requirements file — read it before writing any code.

## Context

Project: Next.js 12 + React 17 + TypeScript resume builder.
This is Task 1 of 5. It creates the zustand store that all other tasks depend on.
No other task has been run yet — the file `src/stores/ai.store.ts` does not exist.

Existing stores to model after (read these for patterns):
- `src/stores/jobs.store.ts` — uses `create` (default import from zustand v3),
  `persist` from `zustand/middleware`, `produce` from `immer`.

## Before You Begin

If you have questions about requirements, approach, or anything unclear — ask now.

## Your Job

1. Create `src/stores/ai.store.ts` exactly as specified in the brief
2. Verify the file has no TypeScript type errors (read it after writing — check imports exist in package.json)
3. Commit
4. Self-review your diff
5. Report back

Work from: /Users/chandler/Project/Resume_Builder/FE-AI_Resume_Builder

## You Do Not Dispatch Subagents

Do all work yourself. Never spawn a subagent to implement or review.

## Report Format

Write full report to: .superpowers/sdd/2025-01-global-settings-modal/task-1-report.md
  - What you implemented
  - Files changed
  - Manual verification steps you checked
  - Self-review findings (if any)
  - Any concerns

Then reply with ONLY (under 15 lines):
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commit (short SHA + subject)
- One-line verification summary
- Concerns (if any)
- Report file path
```

### Task 2 implementer prompt

```
You are implementing Task 2: Settings icon

## Task Description

Read your task brief first. Run:
  ~/.bob/skills/subagent-driven-development/scripts/task-brief \
    docs/superpowers/plans/2025-01-global-settings-modal.md 2
The printed path is your requirements file — read it before writing any code.

## Context

Project: Next.js 12 + React 17 resume builder.
This is Task 2 of 5. It registers the `settings` icon in the existing icon registry.
Task 1 (ai.store.ts) runs in parallel — you do not depend on it.

File to modify: `src/styles/icons.jsx`
Pattern: look at how other `react-icons/md` icons are imported and registered in the `icons` Map.

## Before You Begin

If anything is unclear — ask now.

## Your Job

1. Add `MdSettings` import to `src/styles/icons.jsx`
2. Register `['settings', <MdSettings />]` in the icons Map
3. Commit
4. Self-review your diff
5. Report back

Work from: /Users/chandler/Project/Resume_Builder/FE-AI_Resume_Builder

## You Do Not Dispatch Subagents

Do all work yourself. Never spawn a subagent to implement or review.

## Report Format

Write full report to: .superpowers/sdd/2025-01-global-settings-modal/task-2-report.md
  - What you implemented
  - Files changed
  - Self-review findings (if any)

Then reply with ONLY (under 15 lines):
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commit (short SHA + subject)
- One-line summary
- Report file path
```

---

## After Batch A

Wait for both Task 1 and Task 2 reports. For each:
1. Run the review package script:
   ```bash
   ~/.bob/skills/subagent-driven-development/scripts/review-package \
     docs/superpowers/plans/2025-01-global-settings-modal.md BASE_A HEAD
   ```
   (use the task's HEAD commit for `HEAD`)
2. Dispatch a reviewer using the template below.
3. If review passes → ledger entry + proceed.
4. If review fails → fix loop (max 5 rounds).

### Task reviewer prompt template (fill in per-task)

```
You are reviewing Task N: [TASK NAME]

## What Was Requested
Read the task brief: [BRIEF_FILE_PATH]

Global constraints that bind this task:
- Use only libraries already in `package.json` — do NOT install new dependencies.
- New files use TypeScript (`.ts` / `.tsx`). Existing `.jsx` files stay as JSX.
- Zustand v3 API: `import create from 'zustand'` (default import, not named).
- Dark palette: `#222`, `#2a2a2a`, `#3a3a3a`, `rgb(230,230,230)`, `#aaa`, `#888`.
- Ant Design version is 4 — `bodyStyle` on Modal, not `styles.body`.
- No automated test infrastructure — manual verification steps in report replace test output.

## What the Implementer Claims They Built
Read the implementer's report: [REPORT_FILE_PATH]

## Diff Under Review
Base: [BASE_SHA]
Head: [HEAD_SHA]
Diff file: [DIFF_FILE_PATH]

Read the diff file — it contains commit list, stat summary, and full diff with context.
Do not re-run git commands. Do not crawl the broader codebase.
Your review is read-only — do not mutate the working tree.

## You Do Not Dispatch Subagents

## Output Format

### Spec Compliance
- ✅ Spec compliant | ❌ Issues found: [with file:line]
- ⚠️ Cannot verify from diff: [items spanning tasks]

### Strengths
### Issues
#### Critical (Must Fix)
#### Important (Should Fix)
#### Minor (Nice to Have)

### Assessment
**Task quality:** Approved | Needs fixes
**Reasoning:** [1-2 sentences]
```

---

## Batch B — Dispatch Task 3 and Task 5 in parallel

**Gate:** Only start after BOTH Task 1 AND Task 2 reviews are clean and committed.

Record `BASE_B=$(git rev-parse HEAD)` before dispatching.

### Task 3 implementer prompt

```
You are implementing Task 3: SettingsModal component

## Task Description

Read your task brief first. Run:
  ~/.bob/skills/subagent-driven-development/scripts/task-brief \
    docs/superpowers/plans/2025-01-global-settings-modal.md 3
The printed path is your requirements file — read it before writing any code.

## Context

Project: Next.js 12 + React 17 + TypeScript + Ant Design 4 + styled-components 5 resume builder.
This is Task 3 of 5. Task 1 (ai.store.ts) is now complete and committed.

Interfaces from Task 1 you will consume:
  import { useAIStore, AIModel, AISection } from '../../stores/ai.store';
  
  useAIStore() returns:
    model: AIModel           // 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo'
    temperature: number      // 0.0 – 1.0
    sections: AISection[]    // ['experience', 'projects', 'skills', 'summary']
    setModel(model: AIModel): void
    setTemperature(temperature: number): void
    setSections(sections: AISection[]): void

Existing patterns to follow for styling:
- Dark theme: background `#2a2a2a`, borders `#3a3a3a`, text `rgb(230,230,230)`, muted `#aaa`
- Read `src/core/widgets/SideDrawer.jsx` for styled-components dark theme patterns
- Ant Design 4: use `bodyStyle` prop on Modal (not `styles.body`), use `open` prop (not `visible`)

## Before You Begin

If anything is unclear — ask now.

## Your Job

1. Create `src/core/widgets/SettingsModal.tsx` as specified in the brief
2. The component must export: `export const SettingsModal: React.FC<{ open: boolean; onClose: () => void }>`
3. Sections constraint: at least 1 section must remain checked — enforce in `handleSectionChange`
4. Self-review your diff
5. Commit
6. Report back

Work from: /Users/chandler/Project/Resume_Builder/FE-AI_Resume_Builder

## You Do Not Dispatch Subagents

## Report Format

Write full report to: .superpowers/sdd/2025-01-global-settings-modal/task-3-report.md

Then reply with ONLY (under 15 lines):
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commit (short SHA + subject)
- One-line summary
- Report file path
```

### Task 5 implementer prompt

```
You are implementing Task 5: Inject ai_config into task submission

## Task Description

Read your task brief first. Run:
  ~/.bob/skills/subagent-driven-development/scripts/task-brief \
    docs/superpowers/plans/2025-01-global-settings-modal.md 5
The printed path is your requirements file — read it before writing any code.

## Context

Project: Next.js 12 + React 17 + TypeScript resume builder.
This is Task 5 of 5. Task 1 (ai.store.ts) is complete and committed.
Tasks 3 and 4 (SettingsModal, Sidebar) run in parallel — you do not depend on them.

File to modify: `src/core/widgets/AIResume.tsx`
Read it first to understand the existing `SubmitBtn` component structure.

Interfaces from Task 1 you will consume:
  import { useAIStore } from '../../stores/ai.store';
  
  Inside SubmitBtn:
    const getAIConfig = useAIStore((state) => state.getConfig);
    // getConfig: () => { model: AIModel, temperature: number, sections: AISection[] }

Existing `create()` call signature (in SubmitBtn.handleSubmit):
  create({
    task_list: selectedRows,
    resume: isPrefer ? preferResume : resume,
  });

Your change adds one field:
  create({
    task_list: selectedRows,
    resume: isPrefer ? preferResume : resume,
    ai_config: getAIConfig(),
  });

Note: `jobs.store.ts` and `api.ts` do NOT need changes — `addTasks` already passes
its argument as-is to the API endpoint.

## Before You Begin

If anything is unclear — ask now.

## Your Job

1. Add `useAIStore` import to `AIResume.tsx`
2. Add `getAIConfig` to `SubmitBtn` component body
3. Pass `ai_config: getAIConfig()` in the `create()` call
4. Do NOT add `useRef` or any other unused import
5. Self-review your diff
6. Commit
7. Report back

Work from: /Users/chandler/Project/Resume_Builder/FE-AI_Resume_Builder

## You Do Not Dispatch Subagents

## Report Format

Write full report to: .superpowers/sdd/2025-01-global-settings-modal/task-5-report.md

Then reply with ONLY (under 15 lines):
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commit (short SHA + subject)
- One-line summary
- Report file path
```

---

## After Batch B

Review Task 3 and Task 5 independently (same reviewer template as Batch A, scoped to each task's diff).

---

## Batch C — Task 4 (after Task 2 AND Task 3 reviews are clean)

Record `BASE_C=$(git rev-parse HEAD)` before dispatching.

### Task 4 implementer prompt

```
You are implementing Task 4: Wire Settings button into Sidebar

## Task Description

Read your task brief first. Run:
  ~/.bob/skills/subagent-driven-development/scripts/task-brief \
    docs/superpowers/plans/2025-01-global-settings-modal.md 4
The printed path is your requirements file — read it before writing any code.

## Context

Project: Next.js 12 + React 17 + JSX resume builder (this file stays JSX, not TSX).
This is Task 4 of 5. Tasks 2 (icons) and 3 (SettingsModal) are complete and committed.

Interfaces from completed tasks you will consume:
  // From Task 2:
  getIcon('settings')  // returns <MdSettings /> — already registered in src/styles/icons.jsx
  
  // From Task 3:
  import { SettingsModal } from '../widgets/SettingsModal';
  // Props: { open: boolean; onClose: () => void }

File to modify: `src/core/containers/Sidebar.jsx`
Read it first to understand the existing structure:
- The component uses `useState`, `useCallback` from React — already imported
- The bottom action group contains <PrintSettings /> — add the Settings button after it
- The `<Wrapper>` contains `<SideDrawer>`, `<SideMenu>`, `<SideBackground>` — mount Modal before SideBackground
- `IconWrapper` and `IconButton` styled-components are defined locally in the file — reuse them

## Before You Begin

If anything is unclear — ask now.

## Your Job

1. Add `import { SettingsModal } from '../widgets/SettingsModal';` to imports
2. Add `const [settingsOpen, setSettingsOpen] = useState(false);` inside Sidebar component
3. Add Settings IconWrapper+IconButton after `<PrintSettings />`
4. Mount `<SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />` before `<SideBackground />`
5. Self-review your diff
6. Commit
7. Report back

Work from: /Users/chandler/Project/Resume_Builder/FE-AI_Resume_Builder

## You Do Not Dispatch Subagents

## Report Format

Write full report to: .superpowers/sdd/2025-01-global-settings-modal/task-4-report.md

Then reply with ONLY (under 15 lines):
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commit (short SHA + subject)
- One-line summary
- Report file path
```

---

## Final Review

After all 5 tasks are complete and reviewed:

```bash
MERGE_BASE=<the SHA you recorded during Setup>
~/.bob/skills/subagent-driven-development/scripts/review-package \
  docs/superpowers/plans/2025-01-global-settings-modal.md $MERGE_BASE HEAD
```

Dispatch a final whole-branch code reviewer using the most capable model available, passing:
- The diff file path (printed by the script above)
- The spec path: `docs/superpowers/specs/2025-01-global-settings-modal-design.md`
- The ledger path: `<workspace>/progress.md` (so the reviewer sees all parked/deferred items)

---

## Ledger format

Append one line per event:
```
Task 1: dispatched (BASE=abc1234)
Task 1: complete (commits abc1234..def5678, review clean)
Task 2: dispatched (BASE=abc1234)  ← same BASE as T1 (parallel)
Task 2: complete (commits abc1234..ghi9012, review clean)
Task N: fix round R/5 (X addressed, Y open — <finding one-liners>; commits <a7>..<b7>)
Task N: parked — <finding> — Ruling: <why the code stands>
```

---

## Success criteria (from spec)

All 6 must be verifiable in the final diff:
1. ⚙ Settings button appears in right sidebar bottom action group
2. Clicking opens a two-column Modal (left categories, right content)
3. AI category exposes Model (Select), Temperature (Slider), Optimize Sections (Checkboxes)
4. Changes persist via localStorage key `sprb-ai-config`
5. Task submit payload includes `ai_config: { model, temperature, sections }`
6. Adding a new category requires changes to `CATEGORIES` and `PANE_MAP` constants only
