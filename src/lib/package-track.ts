import type { NpmRegistryMeta } from '../types'
import {
  FLUTTER_PACKAGE_SLUGS,
  npmPackageBasename,
  REACT_NATIVE_PACKAGE_SLUGS,
} from '../data/package-tracks-manifest'

export type DevTrackId = 'mern' | 'react-native' | 'flutter'

/** Packages in each GitHub monorepo (may not all be on npm). */
export const TRACK_CATALOG_SIZE: Record<DevTrackId, number> = {
  mern: 0,
  'react-native': REACT_NATIVE_PACKAGE_SLUGS.size,
  flutter: FLUTTER_PACKAGE_SLUGS.size,
}

export const TRACK_ORDER: DevTrackId[] = ['mern', 'react-native', 'flutter']

export const TRACK_META: Record<
  DevTrackId,
  { label: string; shortLabel: string; description: string }
> = {
  mern: {
    label: 'MERN & Node',
    shortLabel: 'MERN',
    description: 'Web backends, tooling, and TypeScript libraries.',
  },
  'react-native': {
    label: 'React Native',
    shortLabel: 'RN',
    description: 'Mobile-first modules and cross-platform glue.',
  },
  flutter: {
    label: 'Flutter',
    shortLabel: 'Flutter',
    description: 'Dart / Flutter packages and mobile tooling.',
  },
}

function trackFromMonorepoSlug(packageName: string): DevTrackId | null {
  const base = npmPackageBasename(packageName)
  if (FLUTTER_PACKAGE_SLUGS.has(base) || base.startsWith('flutter-')) return 'flutter'
  if (REACT_NATIVE_PACKAGE_SLUGS.has(base)) return 'react-native'
  return null
}

/**
 * Group packages by stack: monorepo slug lists first (NPM-Packages-Modules), then npm metadata keywords.
 * Defaults to MERN for typical Node libraries. Flutter catalog is mostly pub.dev — often 0 on npm here.
 */
export function inferPackageTrack(pkg: {
  name: string
  meta: NpmRegistryMeta
}): DevTrackId {
  const fromRepo = trackFromMonorepoSlug(pkg.name)
  if (fromRepo) return fromRepo

  const keywords = (pkg.meta.keywords ?? []).map((k) => k.toLowerCase())
  const desc = (pkg.meta.description ?? '').toLowerCase()
  const name = pkg.name.toLowerCase()
  const blob = `${name} ${desc} ${keywords.join(' ')}`

  if (
    /\bflutter\b/.test(blob) ||
    /\bdart\b/.test(blob) ||
    /\bdartlang\b/.test(blob) ||
    /\bpub\.dev\b/.test(blob)
  ) {
    return 'flutter'
  }
  if (
    /\breact native\b/.test(blob) ||
    /\breact-native\b/.test(blob) ||
    /\breactnative\b/.test(blob) ||
    /\bexpo\b/.test(blob) ||
    (/\brn\b/.test(blob) && /\bmobile\b/.test(blob))
  ) {
    return 'react-native'
  }
  return 'mern'
}

export function countPackagesByTrack<T extends { name: string; meta: NpmRegistryMeta }>(
  packages: T[],
): Record<DevTrackId, number> {
  const counts: Record<DevTrackId, number> = {
    mern: 0,
    'react-native': 0,
    flutter: 0,
  }
  for (const p of packages) {
    counts[inferPackageTrack(p)]++
  }
  return counts
}

/** Subtitle for stack cards when npm discovery count is low. */
export function stackPackageCountLabel(track: DevTrackId, npmCount: number): string {
  const catalog = TRACK_CATALOG_SIZE[track]
  if (track === 'flutter' && npmCount === 0 && catalog > 0) {
    return `0 on npm · ${catalog} on pub.dev`
  }
  if (track === 'react-native' && catalog > 0 && npmCount < catalog) {
    return `${npmCount} on npm · ${catalog} in RN monorepo`
  }
  return `${npmCount} package${npmCount !== 1 ? 's' : ''}`
}
