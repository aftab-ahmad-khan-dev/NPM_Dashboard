# NPM Packages Dashboard

Standalone monitoring dashboard for npm packages you publish under your npm username. On load, the app discovers packages via the registry search (`maintainer:` / `author:`), then **loads download stats through one POST to your `/api/package-downloads` serverless worker** so the browser stops spamming npm and tripping rate limits (429).

## Stack

- **Vite 6** — fast dev server & bundler
- **React 18** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@tailwindcss/vite`)
- **React Router 6** — nested routes with `<Outlet />`
- **lucide-react** — icons

No standalone backend runtime in the SPA bundle. Calls go to:

- **`GET /api/npm-search?text=&size=&from=`** — forwards **`registry.npmjs.org/-/v1/search`** server-side (**same origin**—npm often omits **`Access-Control-Allow-Origin`** on responses, especially when rate-limited, so the browser falsely reports **CORS**). Retries **`429`** / **`503`** on the worker.
- **`registry.npmjs.org/{package}`** — package **`GET`** metadata (**browser → registry**, still same public API as `npm`; if you hit CORS or 429 here too, mirror the search pattern with another proxy route).
- **`POST /api/package-downloads`** — **`api/package-downloads.ts`** aggregates **`api.npmjs.org/downloads/…`** on the server...
- **`POST /api/pub-packages`** — loads **pub.dev** metadata + **`downloadCount30Days`** for your Flutter/Dart packages (see `PUB_PACKAGE_NAMES` in `src/data/packages.ts`). pub.dev has no public `/my-packages` API, so names come from your Flutter monorepo manifest.

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
├── npm-search.ts                  # GET → registry /-/v1/search (same-origin for browsers)
└── package-downloads.ts           # POST { packages } → server-side npm aggregation + pacing
lib/
├── npmSearchValidate.ts           # shared query sanitization for /api/npm-search
└── npmAggregateDownloads.ts       # shared worker for package-downloads (+ Vite dev middleware)
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

**Note:** `npm run preview` serves only static `./dist`; **`/api/npm-search`** and **`/api/package-downloads` are not available** locally unless you run **`npm run dev`** (Vite middleware) or deploy to Vercel.

If the aggregator times out (**504**) with a very large number of **scoped** packages (each requires four upstream calls), bump **`maxDuration`** in `vercel.json`/`api/package-downloads.ts` toward your plan’s cap or reduce the pinned list scope.

If totals still drift because search occasionally omits a package, add those names to **`NPM_PACKAGES_PINNED`** in `src/data/packages.ts` (always merged with discovery).

New publishes can take a short while to appear in npm search (registry indexing lag).

## Flutter / Dart on pub.dev (no Xcode templates)

Publishing **Dart or Flutter libraries** to [pub.dev](https://pub.dev) never needs Xcode. Copy the workflow from **[`templates/flutter/github-actions-pub-publish.yml`](templates/flutter/github-actions-pub-publish.yml)** into each package repo under `.github/workflows/`, add a **`PUB_TOKEN`** GitHub Actions secret from your pub.dev account, and tags like **`v1.2.3`** aligned with **`pubspec.yaml`**. Details and notes on **cloud iOS builds** (TestFlight/App Store **without Xcode on your laptop**) live in **[`templates/flutter/README.md`](templates/flutter/README.md)**.

## GitHub org card (Overview)

The **[NPM-Packages-Modules](https://github.com/orgs/NPM-Packages-Modules/repositories)** org uses **umbrella monorepos** (`mern`, `react-native`, `flutter`). Those roots are **excluded** from the “unpublished vs npm name” heuristic. The **`all-packages`** repo is **ignored** entirely (meta umbrella). Only **standalone** org repos are compared to package names on the dashboard (still approximate: slug match only).
