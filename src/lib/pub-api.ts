import type { PackageData } from '../types'
import { fetchWithTimeout } from './fetch-timeout'

export const PUB_PACKAGES_API = '/api/pub-packages'

/** ~30 days → 7-day estimate when pub.dev only exposes downloadCount30Days. */
const PUB_WEEKLY_FROM_30D = 7 / 30

export type PubPackageRecord = {
  name: string
  description?: string
  latestVersion: string
  published?: string
  license?: string
  homepage?: string
  repositoryUrl?: string
  topics?: string[]
  likeCount: number
  downloadCount30Days: number | null
  grantedPoints: number | null
  maxPoints: number | null
}

export async function fetchPubPackagesBatch(names: string[]): Promise<PubPackageRecord[]> {
  if (!names.length) return []

  const res = await fetchWithTimeout(
    PUB_PACKAGES_API,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ packages: names }),
      cache: 'no-store',
    },
    90_000,
  )

  const rawBody = await res.text()
  if (!res.ok) {
    let msg = rawBody.replace(/\s+/g, ' ').trim().slice(0, 400)
    try {
      const parsed = JSON.parse(rawBody) as { error?: string }
      if (parsed.error) msg = parsed.error
    } catch {
      /* ignore */
    }
    throw new Error(`pub.dev API ${res.status}: ${msg || 'no body'}`)
  }

  const data = JSON.parse(rawBody) as Record<string, PubPackageRecord>
  return names.map((n) => data[n]).filter((r): r is PubPackageRecord => Boolean(r))
}

/** Map pub.dev API row → dashboard PackageData (Flutter track). */
export function pubRecordToPackageData(row: PubPackageRecord): PackageData {
  const monthlyDl = row.downloadCount30Days ?? 0
  const weeklyEst = monthlyDl > 0 ? Math.round(monthlyDl * PUB_WEEKLY_FROM_30D) : 0
  const now = new Date().toISOString()
  const published = row.published ?? now

  return {
    registry: 'pub',
    name: row.name,
    meta: {
      name: row.name,
      description: row.description,
      license: row.license,
      homepage: row.homepage,
      repository: row.repositoryUrl ? { url: row.repositoryUrl } : undefined,
      keywords: row.topics,
      'dist-tags': { latest: row.latestVersion },
      versions: {
        [row.latestVersion]: {
          name: row.name,
          version: row.latestVersion,
          description: row.description,
        },
      },
      time: { created: published, modified: published },
    },
    weekly:
      weeklyEst > 0
        ? {
            downloads: weeklyEst,
            package: row.name,
            start: '',
            end: '',
          }
        : null,
    monthly:
      monthlyDl > 0
        ? {
            downloads: monthlyDl,
            package: row.name,
            start: '',
            end: '',
          }
        : null,
    daily: null,
    monthlyRange: null,
    pub: {
      likeCount: row.likeCount,
      grantedPoints: row.grantedPoints,
      maxPoints: row.maxPoints,
      downloadCount30Days: row.downloadCount30Days,
    },
  }
}
