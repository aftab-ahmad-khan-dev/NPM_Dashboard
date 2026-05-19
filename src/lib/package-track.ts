import type { NpmRegistryMeta } from '../types'

export type DevTrackId = 'mern' | 'react-native' | 'flutter'

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

/** Best-effort grouping from npm metadata (keywords, description, name). Defaults to MERN for typical Node libraries. */
export function inferPackageTrack(pkg: {
  name: string
  meta: NpmRegistryMeta
}): DevTrackId {
  const keywords = (pkg.meta.keywords ?? []).map((k) => k.toLowerCase())
  const desc = (pkg.meta.description ?? '').toLowerCase()
  const name = pkg.name.toLowerCase()
  const blob = `${name} ${desc} ${keywords.join(' ')}`

  if (
    /\bflutter\b/.test(blob) ||
    /\bdart\b/.test(blob) ||
    /\bdartlang\b/.test(blob)
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
