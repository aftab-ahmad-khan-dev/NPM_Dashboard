import type { DownloadsDay, DownloadsPoint, DownloadsRange, NpmRegistryMeta } from '../types'

const REGISTRY = 'https://registry.npmjs.org'

/** Same-origin proxy (see `api/npm-downloads.ts`). `api.npmjs.org` often omits browser CORS. */
export const NPM_DOWNLOADS_PROXY = '/api/npm-downloads'

const NPM_FETCH_MAX_ATTEMPTS = 7

/** npm accepts up to ~128 package names per bulk path; stay under to keep URLs small. */
const DOWNLOADS_BULK_CHUNK = 100

const BETWEEN_BULK_CHUNKS_MS = 220
/** Small gap between each scoped-package download quartet (bulk API does not support @scope pkgs). */
const BETWEEN_SCOPED_PACKAGE_MS = 55

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function retryAfterMs(res: Response): number | null {
  const raw = res.headers.get('Retry-After')
  if (!raw) return null
  const seconds = Number.parseInt(raw, 10)
  if (!Number.isNaN(seconds)) return seconds * 1000
  const when = Date.parse(raw)
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now())
  return null
}

/** Registry + npm search — ok to call directly from browsers (supports CORS). */
async function registryFetch(input: string | URL, attempt = 0): Promise<Response> {
  const res = await fetch(input, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (
    (res.status === 429 || res.status === 503) &&
    attempt < NPM_FETCH_MAX_ATTEMPTS - 1
  ) {
    const fromHeader = retryAfterMs(res)
    const backoff = 700 * 2 ** attempt
    const wait = Math.min(30_000, Math.max(fromHeader ?? 0, backoff))
    await sleep(wait)
    return registryFetch(input, attempt + 1)
  }
  return res
}

/**
 * Proxied downloads API: `GET /api/npm-downloads?p=` + encoded path after `/downloads/` (handled by Vite in dev).
 */
async function downloadsProxied(subpathUnderDownloads: string, attempt = 0): Promise<Response> {
  const url = `${NPM_DOWNLOADS_PROXY}?p=${encodeURIComponent(subpathUnderDownloads)}`
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
  if (
    (res.status === 429 || res.status === 503) &&
    attempt < NPM_FETCH_MAX_ATTEMPTS - 1
  ) {
    const fromHeader = retryAfterMs(res)
    const backoff = 700 * 2 ** attempt
    const wait = Math.min(30_000, Math.max(fromHeader ?? 0, backoff))
    await sleep(wait)
    return downloadsProxied(subpathUnderDownloads, attempt + 1)
  }
  return res
}

export function partitionDownloadsBulk(names: string[]): {
  unscoped: string[]
  scoped: string[]
} {
  const scoped: string[] = []
  const unscoped: string[] = []
  for (const n of names) {
    if (n.startsWith('@')) scoped.push(n)
    else unscoped.push(n)
  }
  return { unscoped, scoped }
}

export type PackageDownloadsBundle = {
  weekly: DownloadsPoint | null
  monthly: DownloadsPoint | null
  daily: DownloadsRange | null
  monthlyRange: DownloadsRange | null
}

function emptyBundle(): PackageDownloadsBundle {
  return {
    weekly: null,
    monthly: null,
    daily: null,
    monthlyRange: null,
  }
}

type BulkPointRow = { downloads: number; package: string; start: string; end: string }
type BulkRangeRow = {
  downloads: DownloadsDay[]
  package: string
  start: string
  end: string
}

async function ingestUnscopedBulk(
  pkgsChunk: string[],
  out: Map<string, PackageDownloadsBundle>,
): Promise<void> {
  const pathWeekPoint = `point/last-week/${pkgsChunk.map((p) => encodeURIComponent(p)).join(',')}`
  const pathMonthPoint = `point/last-month/${pkgsChunk.map((p) => encodeURIComponent(p)).join(',')}`
  const pathWeekRange = `range/last-week/${pkgsChunk.map((p) => encodeURIComponent(p)).join(',')}`
  const pathMonthRange = `range/last-month/${pkgsChunk.map((p) => encodeURIComponent(p)).join(',')}`

  const [rWkPt, rMoPt, rWkRn, rMoRn] = await Promise.all([
    downloadsProxied(pathWeekPoint),
    downloadsProxied(pathMonthPoint),
    downloadsProxied(pathWeekRange),
    downloadsProxied(pathMonthRange),
  ])

  const parsePt = async (res: Response) => {
    if (!res.ok) return null
    const j = (await res.json()) as unknown
    if (
      typeof j !== 'object' ||
      j === null ||
      ('error' in j && typeof (j as { error: unknown }).error === 'string')
    )
      return null
    return j as Record<string, BulkPointRow>
  }

  const parseRn = async (res: Response) => {
    if (!res.ok) return null
    const j = (await res.json()) as unknown
    if (
      typeof j !== 'object' ||
      j === null ||
      ('error' in j && typeof (j as { error: unknown }).error === 'string')
    )
      return null
    return j as Record<string, BulkRangeRow>
  }

  const [bulkWeekPt, bulkMonthPt, bulkWeekRn, bulkMonthRn] = await Promise.all([
    parsePt(rWkPt),
    parsePt(rMoPt),
    parseRn(rWkRn),
    parseRn(rMoRn),
  ])

  for (const name of pkgsChunk) {
    const bag = out.get(name) ?? emptyBundle()
    if (bulkWeekPt?.[name])
      bag.weekly = {
        downloads: bulkWeekPt[name].downloads,
        package: bulkWeekPt[name].package,
        start: bulkWeekPt[name].start,
        end: bulkWeekPt[name].end,
      }
    if (bulkMonthPt?.[name])
      bag.monthly = {
        downloads: bulkMonthPt[name].downloads,
        package: bulkMonthPt[name].package,
        start: bulkMonthPt[name].start,
        end: bulkMonthPt[name].end,
      }
    if (bulkWeekRn?.[name])
      bag.daily = {
        downloads: bulkWeekRn[name].downloads,
        package: bulkWeekRn[name].package,
        start: bulkWeekRn[name].start,
        end: bulkWeekRn[name].end,
      }
    if (bulkMonthRn?.[name])
      bag.monthlyRange = {
        downloads: bulkMonthRn[name].downloads,
        package: bulkMonthRn[name].package,
        start: bulkMonthRn[name].start,
        end: bulkMonthRn[name].end,
      }
    out.set(name, bag)
  }
}

async function fetchScopedOne(name: string): Promise<PackageDownloadsBundle> {
  const bundle = emptyBundle()

  async function jp(sub: string): Promise<unknown | null> {
    const res = await downloadsProxied(sub)
    if (!res.ok) return null
    const j = await res.json()
    if (
      typeof j !== 'object' ||
      j === null ||
      ('error' in j && typeof (j as { error: unknown }).error === 'string')
    )
      return null
    return j
  }

  const wPt = (await jp(
    `point/last-week/${encodeURIComponent(name)}`,
  )) as DownloadsPoint | null
  bundle.weekly = wPt
  await sleep(BETWEEN_SCOPED_PACKAGE_MS)

  const mPt = (await jp(
    `point/last-month/${encodeURIComponent(name)}`,
  )) as DownloadsPoint | null
  bundle.monthly = mPt
  await sleep(BETWEEN_SCOPED_PACKAGE_MS)

  const wRn = (await jp(
    `range/last-week/${encodeURIComponent(name)}`,
  )) as DownloadsRange | null
  bundle.daily = wRn
  await sleep(BETWEEN_SCOPED_PACKAGE_MS)

  const mRn = (await jp(
    `range/last-month/${encodeURIComponent(name)}`,
  )) as DownloadsRange | null
  bundle.monthlyRange = mRn

  return bundle
}

/**
 * Fetches downloads for many packages using npm bulk lookups for unscoped names
 * and individual calls for scoped packages (npm rejects scoped names in comma-bulk URLs).
 */
export async function fetchPackagesDownloadsBatch(names: string[]): Promise<
  Map<string, PackageDownloadsBundle>
> {
  const out = new Map<string, PackageDownloadsBundle>()
  for (const n of names) out.set(n, emptyBundle())

  const { unscoped, scoped } = partitionDownloadsBulk(names)

  for (let i = 0; i < unscoped.length; i += DOWNLOADS_BULK_CHUNK) {
    const slice = unscoped.slice(i, i + DOWNLOADS_BULK_CHUNK)
    if (!slice.length) continue
    await ingestUnscopedBulk(slice, out)
    if (i + DOWNLOADS_BULK_CHUNK < unscoped.length)
      await sleep(BETWEEN_BULK_CHUNKS_MS)
  }

  for (const name of scoped) {
    try {
      out.set(name, await fetchScopedOne(name))
    } catch {
      out.set(name, emptyBundle())
    }
    await sleep(BETWEEN_SCOPED_PACKAGE_MS)
  }

  return out
}

interface NpmSearchResponse {
  objects: Array<{ package: { name: string } }>
  total: number
}

async function collectPackageNamesFromSearch(text: string, into: Set<string>): Promise<void> {
  const pageSize = 250
  let from = 0
  let total = Infinity

  while (from < total) {
    const qs = new URLSearchParams({
      text,
      size: String(pageSize),
      from: String(from),
    })
    const res = await registryFetch(`${REGISTRY}/-/v1/search?${qs}`)
    if (!res.ok) {
      throw new Error(`npm search failed for "${text}": ${res.status}`)
    }
    const data = (await res.json()) as NpmSearchResponse
    total = typeof data.total === 'number' ? data.total : 0
    for (const obj of data.objects ?? []) {
      const name = obj.package?.name
      if (name) into.add(name)
    }
    if (!data.objects?.length) break
    from += data.objects.length
  }
}

/**
 * All packages published under this npm username — resolved from the public registry search API.
 * Runs maintainer + author queries (deduped); call again on refresh for newly published packages.
 * Note: npm’s search index can lag right after a publish (often minutes, sometimes longer).
 */
export async function discoverPublishedPackageNames(username: string): Promise<string[]> {
  const names = new Set<string>()
  await collectPackageNamesFromSearch(`maintainer:${username}`, names)
  await collectPackageNamesFromSearch(`author:${username}`, names)
  return [...names].sort((a, b) => a.localeCompare(b))
}

/** @deprecated Use discoverPublishedPackageNames — kept for clearer naming in older call sites. */
export const fetchPackageNamesByMaintainer = discoverPublishedPackageNames

export async function fetchPackageMeta(name: string): Promise<NpmRegistryMeta> {
  const res = await registryFetch(`${REGISTRY}/${encodeURIComponent(name)}`)
  if (!res.ok) {
    throw new Error(`Registry fetch failed for ${name}: ${res.status}`)
  }
  return res.json()
}

export type DownloadPeriod = 'last-day' | 'last-week' | 'last-month'

export async function fetchDownloads(
  name: string,
  period: DownloadPeriod = 'last-week',
): Promise<DownloadsPoint | null> {
  try {
    const res = await downloadsProxied(`point/${period}/${encodeURIComponent(name)}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/** Day-by-day downloads for a period — used to draw a true daily sparkline. */
export async function fetchDownloadsRange(
  name: string,
  period: DownloadPeriod = 'last-week',
): Promise<DownloadsRange | null> {
  try {
    const res = await downloadsProxied(`range/${period}/${encodeURIComponent(name)}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
