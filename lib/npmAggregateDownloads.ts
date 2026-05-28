/**
 * Downloads aggregator for Vite dev middleware only.
 * Production Vercel handler inlines the same logic in `api/package-downloads.ts`.
 */
interface DownloadsDay {
  downloads: number
  day: string
}

interface DownloadsPoint {
  downloads: number
  start: string
  end: string
  package: string
}

interface DownloadsRange {
  start: string
  end: string
  package: string
  downloads: DownloadsDay[]
}

export type PackageDownloadsBundle = {
  weekly: DownloadsPoint | null
  monthly: DownloadsPoint | null
  daily: DownloadsRange | null
  monthlyRange: DownloadsRange | null
}

const NPM_DOWNLOADS_BASE = 'https://api.npmjs.org/downloads/'

/** ~6.5 calls/s — stays under npm’s bursts when many scoped packages need 4 calls each (×60s Hobby cap). */
const MIN_GAP_MS = 155

const BULK_CHUNK = 100

const MAX_PACKAGES = 400

function isLikelyPackageName(name: string): boolean {
  if (!name.length || name.length > 214 || name.includes('..')) return false
  if (name.includes('\\')) return false
  if (name.startsWith('@'))
    return /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i.test(name)
  return /^[a-z0-9][a-z0-9._-]*$/i.test(name)
}

const NPM_FETCH_MAX_ATTEMPTS = 12

type BulkPointRow = { downloads: number; package: string; start: string; end: string }
type BulkRangeRow = { downloads: DownloadsDay[]; package: string; start: string; end: string }

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

/** Monotonic pacing between outbound npm.downloads requests */
let lastNpmDownloadsEndMs = 0

async function enforceMinGap(): Promise<void> {
  const gap = MIN_GAP_MS - (Date.now() - lastNpmDownloadsEndMs)
  if (lastNpmDownloadsEndMs > 0 && gap > 0) await sleep(gap)
}

function markNpmDownloadsEnd(): void {
  lastNpmDownloadsEndMs = Date.now()
}

async function npmDownloadsFetch(pathSuffix: string, attempt = 0): Promise<Response> {
  if (attempt === 0) await enforceMinGap()

  let res: Response
  try {
    res = await fetch(NPM_DOWNLOADS_BASE + pathSuffix, {
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip' },
    })
  } catch {
    await sleep(400 + attempt * 350)
    if (attempt < NPM_FETCH_MAX_ATTEMPTS - 1)
      return npmDownloadsFetch(pathSuffix, attempt + 1)
    return new Response('', { status: 502 })
  }

  markNpmDownloadsEnd()

  if (
    (res.status === 429 || res.status === 503 || res.status === 502) &&
    attempt < NPM_FETCH_MAX_ATTEMPTS - 1
  ) {
    const backoff = retryAfterMs(res) ?? Math.min(30_000, 700 * 2 ** attempt + attempt * 200)
    await sleep(backoff)
    return npmDownloadsFetch(pathSuffix, attempt + 1)
  }

  return res
}

function emptyBundle(): PackageDownloadsBundle {
  return {
    weekly: null,
    monthly: null,
    daily: null,
    monthlyRange: null,
  }
}

function partition(names: readonly string[]): { unscoped: string[]; scoped: string[] } {
  const scoped: string[] = []
  const unscoped: string[] = []
  for (const n of names) {
    if (n.startsWith('@')) scoped.push(n)
    else unscoped.push(n)
  }
  return { unscoped, scoped }
}

function isErrorBody(j: unknown): boolean {
  return (
    typeof j === 'object' &&
    j !== null &&
    'error' in j &&
    typeof (j as { error: unknown }).error === 'string'
  )
}

function asPoint(j: unknown): DownloadsPoint | null {
  if (typeof j !== 'object' || j === null || isErrorBody(j)) return null
  const r = j as Partial<DownloadsPoint>
  return typeof r.downloads === 'number' &&
    typeof r.start === 'string' &&
    typeof r.end === 'string' &&
    typeof r.package === 'string'
    ? (r as DownloadsPoint)
    : null
}

function asRange(j: unknown): DownloadsRange | null {
  if (typeof j !== 'object' || j === null || isErrorBody(j)) return null
  const r = j as Partial<DownloadsRange>
  if (
    typeof r.start !== 'string' ||
    typeof r.end !== 'string' ||
    typeof r.package !== 'string' ||
    !Array.isArray(r.downloads)
  )
    return null
  const days = r.downloads as unknown[]
  for (const row of days) {
    if (typeof row !== 'object' || row === null) return null
    const d = row as Partial<DownloadsDay>
    if (typeof d.day !== 'string' || typeof d.downloads !== 'number') return null
  }
  return r as DownloadsRange
}

function asBulkPoints(j: unknown): Record<string, BulkPointRow> | null {
  if (typeof j !== 'object' || j === null || isErrorBody(j)) return null
  const rows = Object.values(j as Record<string, unknown>)
  const out: Record<string, BulkPointRow> = {}
  for (const row of rows) {
    if (typeof row !== 'object' || row === null || isErrorBody(row)) continue
    const r = row as Partial<BulkPointRow>
    if (
      typeof r.downloads === 'number' &&
      typeof r.package === 'string' &&
      typeof r.start === 'string' &&
      typeof r.end === 'string'
    ) {
      out[r.package] = r as BulkPointRow
    }
  }
  return Object.keys(out).length ? out : null
}

function asBulkRanges(j: unknown): Record<string, BulkRangeRow> | null {
  if (typeof j !== 'object' || j === null || isErrorBody(j)) return null
  const rows = Object.values(j as Record<string, unknown>)
  const out: Record<string, BulkRangeRow> = {}
  for (const row of rows) {
    if (typeof row !== 'object' || row === null || isErrorBody(row)) continue
    const r = row as Partial<BulkRangeRow>
    if (
      typeof r.package === 'string' &&
      typeof r.start === 'string' &&
      typeof r.end === 'string' &&
      Array.isArray(r.downloads)
    ) {
      const days = r.downloads as unknown[]
      let ok = true
      for (const day of days) {
        if (typeof day !== 'object' || day === null) {
          ok = false
          break
        }
        const d = day as Partial<DownloadsDay>
        if (typeof d.day !== 'string' || typeof d.downloads !== 'number') {
          ok = false
          break
        }
      }
      if (ok) out[r.package] = r as BulkRangeRow
    }
  }
  return Object.keys(out).length ? out : null
}

async function jsonOrNull(res: Response): Promise<unknown | null> {
  if (!res.ok) return null
  try {
    return await res.json()
  } catch {
    return null
  }
}

function sanitizeIncomingPackageList(body: unknown): string[] {
  const raw =
    typeof body === 'object' &&
    body !== null &&
    'packages' in body &&
    Array.isArray((body as { packages: unknown }).packages)
      ? ((body as { packages: unknown[] }).packages as unknown[])
      : null
  const out: string[] = []
  if (!raw) return out

  const seen = new Set<string>()
  for (const item of raw) {
    if (typeof item !== 'string') continue
    const n = item.trim()
    if (!n.length || !isLikelyPackageName(n)) continue
    if (seen.has(n)) continue
    seen.add(n)
    out.push(n)
    if (out.length >= MAX_PACKAGES) break
  }

  return out
}

async function ingestUnscopedBulk(pkgsChunk: readonly string[], out: Record<string, PackageDownloadsBundle>) {
  const list = [...pkgsChunk].map((p) => encodeURIComponent(p)).join(',')
  const pathWeekPt = `point/last-week/${list}`
  const pathMonthPt = `point/last-month/${list}`
  const pathWeekRn = `range/last-week/${list}`
  const pathMonthRn = `range/last-month/${list}`

  const rWkPt = await npmDownloadsFetch(pathWeekPt)
  const jpWkPt = await jsonOrNull(rWkPt)
  const bpWk = jpWkPt ? asBulkPoints(jpWkPt) : null

  const rMoPt = await npmDownloadsFetch(pathMonthPt)
  const jpMoPt = await jsonOrNull(rMoPt)
  const bpMo = jpMoPt ? asBulkPoints(jpMoPt) : null

  const rWkRn = await npmDownloadsFetch(pathWeekRn)
  const jpWkRn = await jsonOrNull(rWkRn)
  const brWk = jpWkRn ? asBulkRanges(jpWkRn) : null

  const rMoRn = await npmDownloadsFetch(pathMonthRn)
  const jpMoRn = await jsonOrNull(rMoRn)
  const brMo = jpMoRn ? asBulkRanges(jpMoRn) : null

  for (const name of pkgsChunk) {
    const bag = out[name]
    if (!bag) continue
    const wpt = bpWk?.[name]
    const mpt = bpMo?.[name]
    const wrn = brWk?.[name]
    const mrn = brMo?.[name]
    if (wpt)
      bag.weekly = {
        downloads: wpt.downloads,
        package: wpt.package,
        start: wpt.start,
        end: wpt.end,
      }
    if (mpt)
      bag.monthly = {
        downloads: mpt.downloads,
        package: mpt.package,
        start: mpt.start,
        end: mpt.end,
      }
    if (wrn)
      bag.daily = {
        downloads: wrn.downloads,
        package: wrn.package,
        start: wrn.start,
        end: wrn.end,
      }
    if (mrn)
      bag.monthlyRange = {
        downloads: mrn.downloads,
        package: mrn.package,
        start: mrn.start,
        end: mrn.end,
      }
  }
}

async function fetchScopedOne(name: string): Promise<PackageDownloadsBundle> {
  const enc = encodeURIComponent(name)
  const bundle = emptyBundle()

  const wPtRaw = await jsonOrNull(await npmDownloadsFetch(`point/last-week/${enc}`))
  bundle.weekly = asPoint(wPtRaw)

  const mPtRaw = await jsonOrNull(await npmDownloadsFetch(`point/last-month/${enc}`))
  bundle.monthly = asPoint(mPtRaw)

  const wRnRaw = await jsonOrNull(await npmDownloadsFetch(`range/last-week/${enc}`))
  bundle.daily = asRange(wRnRaw)

  const mRnRaw = await jsonOrNull(await npmDownloadsFetch(`range/last-month/${enc}`))
  bundle.monthlyRange = asRange(mRnRaw)

  return bundle
}

/**
 * One worker entry (used by Vercel + Vite middleware). Validates input; returns keyed JSON object.
 */
export async function aggregatePackageDownloads(body: unknown): Promise<
  Record<string, PackageDownloadsBundle>
> {
  lastNpmDownloadsEndMs = 0
  const names = sanitizeIncomingPackageList(body)
  const out: Record<string, PackageDownloadsBundle> = {}
  for (const n of names) out[n] = emptyBundle()

  if (!names.length) return out

  const { unscoped, scoped } = partition(names)

  for (let i = 0; i < unscoped.length; i += BULK_CHUNK) {
    const slice = unscoped.slice(i, i + BULK_CHUNK)
    await ingestUnscopedBulk(slice, out)
  }

  for (const name of scoped) {
    try {
      out[name] = await fetchScopedOne(name)
    } catch {
      out[name] = emptyBundle()
    }
  }

  return out
}
