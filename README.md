# NPM Packages Dashboard

Standalone monitoring dashboard for npm packages you publish under your npm username. **Nothing hits npm or GitHub until you press Refresh** in the header; each run rediscovers packages from the public registry search (`maintainer:` / `author:`) and reloads stats.

## Stack

- **Vite 6** — fast dev server & bundler
- **React 18** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@tailwindcss/vite`)
- **React Router 6** — nested routes with `<Outlet />`
- **lucide-react** — icons

No standalone backend runtime in the SPA bundle. Calls go to:

- **`registry.npmjs.org`** — package search & metadata (**browser → registry**, CORS allowed).
- **`/api/npm-downloads?p=…`** — forwards **`api.npmjs.org/downloads/…`** from the [**Vercel serverless**](https://vercel.com/docs/functions) handler in `api/npm-downloads.ts`. Browsers hit your own origin → **no CORS** failures on `*.vercel.app`. In dev, Vite proxies the same path to npm.

Downloads are fetched in batches: **comma-separated bulk URLs for unscoped packages** (4 requests per chunk of ≤100 packages: week/month × point/range). **Scoped `@npm/pkg` names cannot use npm’s bulk API** (“scoped packages are not currently supported in bulk lookups”), so those stay as **individual proxied URLs**, lightly throttled to reduce 429s.

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
└── npm-downloads.ts           # Vercel serverless proxy → api.npmjs.org/downloads (browser CORS)
src/
├── main.tsx                   # bootstrap
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

Downloads use **comma-bulk** requests for **unscoped** packages (few round-trips); **scoped** packages use npm’s single-package URLs (bulk not supported). All download traffic goes through **`/api/npm-downloads`** in production (**Vercel**) and the Vite dev proxy. Reload uses **automatic retries** on **429/503** with backoff + `Retry-After`.

**Note:** `npm run preview` serves only static `./dist`; download proxy routes are **not** available locally unless you run on Vercel or add your own fallback.

If totals still drift because search occasionally omits a package, add those names to **`NPM_PACKAGES_PINNED`** in `src/data/packages.ts` (always merged with discovery).

New publishes can take a short while to appear in npm search (registry indexing lag).

## GitHub org card (Overview)

The **[NPM-Packages-Modules](https://github.com/orgs/NPM-Packages-Modules/repositories)** org uses **umbrella monorepos** (`mern`, `react-native`, `flutter`). Those roots are **excluded** from the “unpublished vs npm name” heuristic. The **`all-packages`** repo is **ignored** entirely (meta umbrella). Only **standalone** org repos are compared to package names on the dashboard (still approximate: slug match only).
