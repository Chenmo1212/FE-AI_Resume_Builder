<div align="center">
<h1>AI Resume Builder — Frontend</h1>

### A local-first, AI-powered resume builder with multiple templates and BYOK support

</div>

---

## Overview

A Next.js web application for building, editing, and AI-optimising single-page resumes. All user data lives in the browser via IndexedDB — no account or server database required.

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server (http://localhost:3000)
yarn dev

# Production build
yarn build

# Export static site
yarn build:export

# Start production server (http://localhost:9000)
yarn start
```

## Project Structure

```
src/
├── pages/              # Next.js pages (index, editor, error pages)
│   └── api/            # Next.js API routes
├── home/               # Landing page sections (hero, features, templates, footer)
├── core/
│   ├── components/     # Feature components (editor, jobs, templates, themes)
│   ├── containers/     # Layout containers (LeftNav, Sidebar, Resume)
│   ├── widgets/        # UI widgets (AI panel, settings, job modal, prompt studio)
│   ├── meta-data/      # Static metadata
│   └── utils/          # Shared utility functions
├── templates/
│   ├── layouts/        # Resume template layouts (8 templates)
│   ├── components/     # Template building blocks (intro, exp, education, skills…)
│   └── hooks/          # Template-specific hooks
├── stores/             # Zustand stores (data, AI, jobs, settings, theme, templates)
├── db/                 # Dexie.js database, backup helpers, default prompts
├── axios/              # Axios instance / API client
└── styles/             # Global styles
```

## Resume Templates

| Template | File |
|---|---|
| Basic | `BasicTemplate.jsx` |
| Classic | `ClassicTemplate.jsx` |
| Graduate | `GraduateTemplate.jsx` |
| Legacy | `LegacyTemplate.jsx` |
| One Column | `OneColumnTemplate.jsx` |
| Professional | `ProfessionalTemplate.jsx` |
| Professional 2 | `ProfessionalTemplate2.jsx` |

All templates extend `BaseTemplate.jsx`.

## Architecture: Local-First Zero-DB

All user data lives **exclusively in your browser** via [Dexie.js](https://dexie.org/) (IndexedDB):

| Store | Contents |
|---|---|
| Resumes | CV data, edited sections, AI-generated results |
| Jobs | Job postings you've added |
| Tasks | AI optimisation task history and status |
| Prompt Templates | Custom AI prompt overrides |

No personal data is ever sent to or stored on the server. The backend processes AI requests ephemerally and discards all data when the request completes.

### BYOK (Bring Your Own Key)

Your AI provider API key is stored locally in `localStorage` only. It is forwarded to the backend as an `X-API-Key` header for the duration of the request and never persisted server-side.

### Data Backup & Cross-Device Migration

Use **Settings → Data & Backup** to:
- **Export Backup** — downloads all data as a single `.json` file
- **Import Backup** — restores data from a previously exported backup

To migrate to another browser or device:
1. Export a backup on the source device
2. Transfer the `.json` file
3. Import the backup on the target device

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 12 |
| UI | [React](https://reactjs.org/) 17 + [Ant Design](https://ant.design/) + [MUI](https://mui.com/) |
| Styling | [Styled Components](https://styled-components.com/) |
| State management | [Zustand](https://github.com/pmndrs/zustand) |
| Local storage | [Dexie.js](https://dexie.org/) (IndexedDB) |
| HTTP client | [Axios](https://axios-http.com/) |
| AI integration | OpenAI / DeepSeek via backend |

## Print Settings

When printing or saving as PDF, use these browser settings for best results:

| Setting | Value |
|---|---|
| Orientation | Portrait |
| Paper size | A4 |
| Scale | Fit to width |
| Margins | None |
| Headers & footers | Uncheck |
| Background graphics | Check |

## Key Widgets

| Widget | Purpose |
|---|---|
| `AIResume.jsx` | AI optimisation panel — sends resume + job description to backend |
| `PromptStudioPane.jsx` | Edit and preview custom AI prompt templates |
| `JobModal.jsx` | Add and manage job postings |
| `SettingsModal.jsx` | App-level settings (API key, theme, data backup) |
| `SideDrawer.jsx` / `SideMenu.jsx` | Navigation and section editing sidebar |
| `PrintSettings.jsx` | Print/export configuration |

## Linting & Formatting

```bash
# Lint
yarn lint

# Format staged files (runs automatically on commit via Husky)
yarn pretty-quick
```

ESLint config: `.eslintrc.json` — extends `next/core-web-vitals` + `prettier`.  
Prettier config: `.prettierrc`.
