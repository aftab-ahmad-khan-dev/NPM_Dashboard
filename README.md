# NPM Packages Dashboard

Standalone monitoring dashboard for all 11 published npm packages.

## Stack

- **Vite 6** — fast dev server & bundler
- **React 18** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@tailwindcss/vite`)
- **React Router 6** — nested routes with `<Outlet />`
- **lucide-react** — icons

No backend; data is fetched live in the browser from:
- `https://registry.npmjs.org/<pkg>` (metadata, versions, license, keywords, repo, etc.)
- `https://api.npmjs.org/downloads/point/<period>/<pkg>` (download stats)

## Run

```bash
cd dashboard
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build      # produces ./dist
npm run preview    # serve the production build locally
```

## Project layout

```
src/
├── App.tsx                       # routes
├── main.tsx                      # bootstrap
├── index.css                     # tailwind v4 entry
├── data/packages.ts              # the list of npm package names
├── lib/
│   ├── npm-api.ts                # registry + downloads fetchers
│   └── format.ts                 # number / date helpers
├── context/PackagesContext.tsx   # fetches & caches all packages
├── components/
│   ├── Layout.tsx                # sidebar + header + <Outlet />
│   ├── Sidebar.tsx               # collapsible mobile drawer
│   ├── Header.tsx                # sticky top bar + refresh
│   ├── StatCard.tsx
│   ├── PackageCard.tsx
│   └── Skeleton.tsx
└── pages/
    ├── Overview.tsx              # totals, top by downloads, recent updates
    ├── Packages.tsx              # searchable + sortable grid
    ├── PackageDetail.tsx         # full metadata + version history
    └── About.tsx
```

## Adding/removing packages

Edit `src/data/packages.ts` — that's the single source of truth.
