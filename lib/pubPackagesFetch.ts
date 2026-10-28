/**
 * Fetches pub.dev package metadata + score (30-day downloads). Used by Vite dev + Vercel API.
 * pub.dev has no public “my-packages” API — pass explicit package names (see src/data/packages.ts).
 */

const PUB_API = 'https://pub.dev/api/packages/'

const MAX_PACKAGES = 120
const CONCURRENCY = 5
const BETWEEN_BATCH_MS = 120

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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function isLikelyPubName(name: string): boolean {
  return /^[a-z][a-z0-9_]*$/i.test(name) && name.length <= 64
}

export function sanitizePubPackageList(body: unknown): string[] {
  const raw =
    typeof body === 'object' &&
    body !== null &&
    'packages' in body &&
    Array.isArray((body as { packages: unknown }).packages)
      ? ((body as { packages: unknown[] }).packages as unknown[])
      : null
  if (!raw) return []

  const seen = new Set<string>()
  const out: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string') continue
    const n = item.trim().toLowerCase()
    if (!n.length || !isLikelyPubName(n)) continue
    if (seen.has(n)) continue
    seen.add(n)
    out.push(n)
    if (out.length >= MAX_PACKAGES) break
  }
  return out
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchOne(name: string): Promise<PubPackageRecord | null> {
  const enc = encodeURIComponent(name)
  const [metaRaw, scoreRaw] = await Promise.all([
    fetchJson(`${PUB_API}${enc}`),
    fetchJson(`${PUB_API}${enc}/score`),
  ])

  if (typeof metaRaw !== 'object' || metaRaw === null) return null
  const meta = metaRaw as {
    latest?: {
      version?: string
      published?: string
      pubspec?: {
        description?: string
        version?: string
        homepage?: string
        repository?: string
        license?: string
        topics?: string[]
      }
    }
  }

  const ps = meta.latest?.pubspec
  const latestVersion = ps?.version ?? meta.latest?.version ?? '0.0.0'

  let likeCount = 0
  let downloadCount30Days: number | null = null
  let grantedPoints: number | null = null
  let maxPoints: number | null = null

  if (typeof scoreRaw === 'object' && scoreRaw !== null) {
    const sc = scoreRaw as Record<string, unknown>
    if (typeof sc.likeCount === 'number') likeCount = sc.likeCount
    if (typeof sc.downloadCount30Days === 'number') downloadCount30Days = sc.downloadCount30Days
    if (typeof sc.grantedPoints === 'number') grantedPoints = sc.grantedPoints
    if (typeof sc.maxPoints === 'number') maxPoints = sc.maxPoints
  }

  let repositoryUrl: string | undefined
  const repo = ps?.repository
  if (typeof repo === 'string' && repo.startsWith('http')) repositoryUrl = repo

  return {
    name,
    description: ps?.description,
    latestVersion,
    published: meta.latest?.published,
    license: ps?.license,
    homepage: ps?.homepage,
    repositoryUrl,
    topics: Array.isArray(ps?.topics) ? ps.topics : undefined,
    likeCount,
    downloadCount30Days,
    grantedPoints,
    maxPoints,
  }
}

export async function aggregatePubPackages(body: unknown): Promise<Record<string, PubPackageRecord>> {
  const names = sanitizePubPackageList(body)
  const out: Record<string, PubPackageRecord> = {}

  for (let i = 0; i < names.length; i += CONCURRENCY) {
    const batch = names.slice(i, i + CONCURRENCY)
    const rows = await Promise.all(batch.map((n) => fetchOne(n)))
    for (let j = 0; j < batch.length; j++) {
      const row = rows[j]
      if (row) out[batch[j]] = row
    }
    if (i + CONCURRENCY < names.length) await sleep(BETWEEN_BATCH_MS)
  }

  return out
}
