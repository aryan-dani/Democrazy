# Democrazy

Interactive **election readiness** learning app: scripted “classic” voter journeys backed by curated packs, an optional **Gemini-powered adaptive simulation**, quizzes with history, badges, timeline explorer, civic AI tutor, and optional **Firebase** sign-in + **Firestore** progress mirror. Built as a React SPA (Vite) with lightweight serverless endpoints for Gemini on Vercel.

## Prerequisites

- **Node.js** 20+ recommended (aligned with modern Vite / tooling)
- **npm** (or use `pnpm` / `yarn` if you mirror the scripts yourself)
- A **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/) if you want live adaptive simulation + tutor (offline fallbacks exist for parts of the sim)

## Quick start

```bash
git clone <YOUR_REPO_URL> democrazy
cd democrazy
npm ci
copy .env.example .env          # PowerShell / Windows
# cp .env.example .env           # macOS / Linux — then edit .env to add GEMINI_API_KEY
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Development uses **`vite.config.js` middleware**: `POST /api/simulation/turn` and `POST /api/assistant/chat` run in-process and read **`GEMINI_API_KEY` from `.env`**. Restart the dev server after changing env files.

Optional split process (standalone Node HTTP API on port **8787** for experimentation or external clients):

```bash
npm run dev:split
```

With the split server, configure the SPA to reach it by setting in `.env`:

```env
VITE_API_ORIGIN=http://localhost:8787
```

If `VITE_API_ORIGIN` is empty, the app uses **same-origin** requests (default with `npm run dev`).

## Environment variables

| Variable                 | Scope                                                     | Purpose                                                                            |
| ------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`         | Server (Vite middleware locally, Vercel function in prod) | Required for adaptive simulation + tutor.                                          |
| `GEMINI_MODEL`           | Server                                                    | Optional model override (default in `.env.example`: `gemini-2.0-flash`).           |
| `VITE_API_ORIGIN`        | Client build                                              | Optional absolute API origin (e.g. split dev API). Omit for relative `/api/...`.   |
| `VITE_FIREBASE_*`        | Client only (`VITE_` prefixed)                            | Optional Firebase Auth + Firestore mirror; omit to run fully local/offline UX.     |
| `VITE_GA_MEASUREMENT_ID` | Client                                                    | Optional GA4; `trackEvent()` no-ops without it.                                    |
| `DEMOCRAZY_CORS_ORIGIN`  | Server (`api/*`, Vite middleware, `scripts/dev-api.mjs`)  | Optional `Access-Control-Allow-Origin`; defaults to `*` when unset (dev-friendly). |

**`GEMINI_API_KEY`** is loaded only on the server (Vercel handlers, dev middleware, `dev-api.mjs`). It must never be prefixed with `VITE_` and is not shipped in the SPA bundle.

Copy **`.env.example`** → **`.env`** and fill secrets locally. Optionally add **`.env.local`** for machine-specific overrides (also gitignored). **Do not commit** `.env` or any file containing real keys.

## Scripts

| Command                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Vite dev server + in-process Gemini API middleware.       |
| `npm run dev:split`     | Concurrently: Vite + `scripts/dev-api.mjs`.               |
| `npm run lint`          | ESLint (flat config) on `src/`, `server/`, and config.    |
| `npm run lint:fix`      | ESLint with `--fix`.                                      |
| `npm run format`        | Prettier write.                                           |
| `npm run format:check`  | Prettier CI check.                                        |
| `npm test`              | Vitest unit/integration tests.                            |
| `npm run test:coverage` | Vitest with V8 coverage thresholds (also used in CI).     |
| `npm run build`         | TypeScript (`tsc` on typed entry shims) + Vite → `dist/`. |
| `npm run preview`       | Preview the production build locally.                     |

## Learning outcomes ↔ product areas

| Experience            | What learners practice                                     |
| --------------------- | ---------------------------------------------------------- |
| Classic simulation    | Scripted voter journey, tradeoffs, pack-specific themes.   |
| Adaptive (Gemini) sim | JSON-grounded AI consequences with server-side guardrails. |
| Timeline              | Election phases and sequencing literacy.                   |
| Quizzes               | Knowledge checks tied to sim context.                      |
| Dashboard + badges    | Progress, motivation, revisit weak areas.                  |
| Civic tutor           | Short, non-partisan Q&A via `/api/assistant/chat`.         |
| Optional Firebase     | Account + cloud progress mirror with user-scoped docs.     |

## Deploying on Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import the project in [Vercel](https://vercel.com/).
2. Set **Environment Variables** in the Vercel project:
   - `GEMINI_API_KEY` — **Production** (and Preview if needed).
   - Optional: `GEMINI_MODEL`.
   - Client: any `VITE_*` vars you rely on (`VITE_FIREBASE_*`, `VITE_GA_MEASUREMENT_ID`).
3. The repository includes **`api/simulation/turn.js`** and **`api/assistant/chat.js`** as Vercel Serverless/API routes alongside `vercel.json` (SPA build → `dist`). Production responses also pick up baseline **`vercel.json` security headers** (e.g. `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`). For same-origin SPA+API setups, tighten CORS by setting **`DEMOCRAZY_CORS_ORIGIN`** to your site origin.

After deploy, confirm:

- `POST /api/simulation/turn`
- `POST /api/assistant/chat`

respond with JSON (use the Network tab during adaptive mode + tutor FAB).

### Firebase (optional)

If you configure `VITE_FIREBASE_*` in your env:

1. Enable **Google** sign-in in Firebase Console → Authentication → Sign-in methods.
2. Add your **deployment domain(s)** (including `localhost` for dev where applicable) under authorized domains.
3. Create Firestore with rules that restrict access to **`request.auth.uid`**, for example allowing each user read/write **only their own progress document**. Do **not** use open `allow read, write: if true` rules in production.

The app gracefully degrades when Firebase env is incomplete (local-only persistence via `localStorage`).

## Project layout (overview)

```
api/                    # Vercel serverless handlers (Gemini)
server/                 # Shared server logic used by api/ + vite middleware + dev-api
scripts/dev-api.mjs     # Standalone dev API server
src/                    # React app (pages, hooks, UI, firebase, analytics helpers)
public/
vercel.json
vite.config.js
```

## Troubleshooting

**Build fails**

- Run `npm run build` locally; fix any `tsc` errors before deploying.

**Gemini routes 401 / missing key**

- Ensure `GEMINI_API_KEY` exists in `.env` (local) or Vercel env (production), then restart dev server or redeploy.

**Theme / SPA**

- Default theme is set on `<html>`; user toggle + persistence lives in theme utilities referenced from `Navbar`.

## Why `.env` showed up as “tracked” or scary in Git?

`.env` contains **secrets**. This repo did **not** ignore `.env` by default (`*.local` alone only ignores paths like `.env.local`, **not** `.env`). That means:

- `git status` lists `.env` as **untracked** until you `.gitignore` it — Cursor and other GUIs highlight it alongside files you might commit.

We now ignore `.env`, `.env.*`, and re-include **`.env.example`** so the safe template is what you push.

### If you already committed `.env` (remove from Git history safely)

Rotate all exposed keys immediately, then drop the file from the index:

```bash
git rm --cached --ignore-unmatch .env
git commit -m "Stop tracking env file"
```

If it ever reached GitHub publicly, assume the keys are leaked and **rotate** them in AI Studio / Firebase.

## Contributing / license

This project is authored for a hackathon-style demo (**Prompt Wars**). Add your own `LICENSE` and contribution guidelines when you fork for production.
