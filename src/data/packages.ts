import { FLUTTER_PACKAGE_SLUGS } from './package-tracks-manifest'

/**
 * Package names are not listed here — every load (including header refresh) queries npm’s
 * public search for `maintainer:` + `author:` on this username and merges results.
 * Change only if your npm username differs. Optional denylist below hides specific names.
 */
export const NPM_MAINTAINER_USERNAME = 'mr-aftab-ahmad-khan'

/** Package names to omit from the dashboard (optional). */
export const PACKAGE_DENYLIST: string[] = []

/**
 * Always merged into discovery results (deduped). Use when npm search intermittently omits packages,
 * which makes weekly/monthly totals jump between refreshes.
 */
export const NPM_PACKAGES_PINNED: string[] = []

/**
 * pub.dev package names for your Flutter monorepo (pub uses underscores).
 * `/my-packages` is login-only — we resolve these from the public API instead.
 * Add names to `PUB_PACKAGES_PINNED` when you publish new Dart packages.
 */
export const PUB_PACKAGE_NAMES: string[] = [...FLUTTER_PACKAGE_SLUGS].map((slug) =>
  slug.replace(/-/g, '_'),
)

/** Extra pub.dev names always merged with `PUB_PACKAGE_NAMES`. */
export const PUB_PACKAGES_PINNED: string[] = []
