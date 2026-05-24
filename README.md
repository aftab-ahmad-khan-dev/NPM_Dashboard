# NPM Packages Dashboard

Standalone monitoring dashboard for npm packages you publish under your npm username. On load, the app discovers packages via the registry search (`maintainer:` / `author:`), then **loads download stats through one POST to your `/api/package-downloads` serverless worker** so the browser stops spamming npm and tripping rate limits (429).

## Stack

- **Vite 6** — fast dev server & bundler
- **React 18** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@tailwindcss/vite`)
- **React Router 6** — nested routes with `<Outlet />`
- **lucide-react** — icons

No standalone backend runtime in the SPA bundle. Calls go to:

- **`registry.npmjs.org`** — package search & metadata (**browser → registry**, CORS allowed).
- **`POST /api/package-downloads`** — **`api/package-downloads.ts`** aggregates **`api.npmjs.org/downloads/…`** on the server: **bulk comma URLs for unscoped** packages plus **paced single-package lookups for scoped `@scope/name`** (npm rejects scoped names in bulk). The SPA sends **one** JSON body `{ "packages": string[] }` and gets **all point + range** series back in one payload. Locally, `vite.config.ts` runs the same aggregator in middleware (no duplicate GET proxy).

Downloads work is **serialized with a minimum gap between npm calls** plus **retry/backoff on 429/503**, so upstream rate limits mostly hit Vercel’s IP once per dashboard load instead of dozens of concurrent browser callbacks.

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
api/
└── package-downloads.ts           # POST { packages } → server-side npm aggregation + pacing
lib/
└── npmAggregateDownloads.ts       # shared worker (bundled into the above + Vite dev middleware)
src/
├── main.tsx                       # bootstrap
├── index.css                      # tailwind v4 entry
├── data/packages.ts               # npm username, optional denylist + pinned package names
├── lib/
│   ├── npm-api.ts                # registry + SPA → POST downloads API
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

Nothing to edit when you publish a new package: use **Refresh** in the header (or reload the tab) — the app calls npm’s search API (`maintainer:` + `author:`), then **`POST /api/package-downloads`** returns every package’s downloads in one shot. Adjust `NPM_MAINTAINER_USERNAME` in `src/data/packages.ts` if needed, or add names to `PACKAGE_DENYLIST` to hide packages from the dashboard.

**Note:** `npm run preview` serves only static `./dist`; **`POST /api/package-downloads` is not simulated** unless you deploy to Vercel or reuse the aggregator another way — use **`npm run dev`** locally (Vite exposes the middleware).

If the aggregator times out (**504**) with a very large number of **scoped** packages (each requires four upstream calls), bump **`maxDuration`** in `vercel.json`/`api/package-downloads.ts` toward your plan’s cap or reduce the pinned list scope.

If totals still drift because search occasionally omits a package, add those names to **`NPM_PACKAGES_PINNED`** in `src/data/packages.ts` (always merged with discovery).

New publishes can take a short while to appear in npm search (registry indexing lag).

## GitHub org card (Overview)

The **[NPM-Packages-Modules](https://github.com/orgs/NPM-Packages-Modules/repositories)** org uses **umbrella monorepos** (`mern`, `react-native`, `flutter`). Those roots are **excluded** from the “unpublished vs npm name” heuristic. The **`all-packages`** repo is **ignored** entirely (meta umbrella). Only **standalone** org repos are compared to package names on the dashboard (still approximate: slug match only).
