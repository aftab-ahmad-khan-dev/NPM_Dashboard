# NPM Packages Dashboard

Standalone monitoring dashboard for npm packages you publish under your npm username. **Nothing hits npm or GitHub until you press Refresh** in the header; each run rediscovers packages from the public registry search (`maintainer:` / `author:`) and reloads stats.

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
├── data/packages.ts              # npm username, optional denylist + pinned package names
├── lib/
│   ├── npm-api.ts                # registry + downloads fetchers
│   └── format.ts                 # number / date helpers
├── context/PackagesContext.tsx   # discovers package names from npm, then fetches metadata
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

## Packages list

Nothing to edit when you publish a new package: use **Refresh** in the header — the app then calls npm’s search API (`maintainer:` + `author:`) and loads whatever the registry returns. Adjust `NPM_MAINTAINER_USERNAME` in `src/data/packages.ts` if needed, or add names to `PACKAGE_DENYLIST` to hide packages from the dashboard.

Loads run in **small batches** with a **cooldown between batches**, **sequential** registry/downloads calls per package (avoids npm **429** bursts), and **automatic retries** on **429/503** with backoff + `Retry-After`.

If totals still drift because search occasionally omits a package, add those names to **`NPM_PACKAGES_PINNED`** in `src/data/packages.ts` (always merged with discovery).

New publishes can take a short while to appear in npm search (registry indexing lag).

## GitHub org card (Overview)

The **[NPM-Packages-Modules](https://github.com/orgs/NPM-Packages-Modules/repositories)** org uses **umbrella monorepos** (`mern`, `react-native`, `flutter`). Those roots are **excluded** from the “unpublished vs npm name” heuristic. The **`all-packages`** repo is **ignored** entirely (meta umbrella). Only **standalone** org repos are compared to package names on the dashboard (still approximate: slug match only).
