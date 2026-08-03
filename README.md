# Dr Data Pulse Web

Private decision-intelligence platform for Dr. Data Decision Intelligence.

Repo: [Zmugha1/DrDataPulseWeb](https://github.com/Zmugha1/DrDataPulseWeb)

## What this is

The digital card is the front door. The accumulated decision engine is the product. This repo will hold the Pulse web app and dashboard (dogfood first on Dr. Data's own business).

Product definition and build list live in `docs/`. Brand tokens live in `BRANDING.md`.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (brand colors from `BRANDING.md`)
- React Router

## Local setup

```bash
cd ~/Documents/DrDataPulseWeb
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build   # typecheck + production build
npm run preview # serve dist locally
```

## Push to GitHub (when ready)

Remote is already pointed at the empty repo. From this folder:

```bash
git add README.md package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.js postcss.config.js .gitignore BRANDING.md docs src public
git commit -m "Initial scaffold for Dr Data Pulse web app"
git push -u origin main
```

Do not use `git add .` if you prefer the project working rule of specific adds. Never commit `.env` files.

## Working rules (from product definition)

- One focused change at a time
- Diagnose before building
- No push without explicit approval
- No em dashes in product copy
- `npm run build` clean before each commit

## Next build slice (v1)

1. Supabase project + leads/events schema with RLS
2. Auth (single user)
3. Capture endpoint
4. Dashboard triage (hot / warm / cold)
