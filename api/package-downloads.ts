import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Self-contained downloads aggregator (no imports outside this file).
 * Vercel serverless fails to load `../lib/*` at runtime (FUNCTION_INVOCATION_FAILED).
 * Keep logic aligned with `lib/npmAggregateDownloads.ts` (used by Vite dev middleware).
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

type PackageDownloadsBundle = {
  weekly: DownloadsPoint | null
  monthly: DownloadsPoint | null
  daily: DownloadsRange | null
  monthlyRange: DownloadsRange | null
}

const NPM_DOWNLOADS_BASE = 'https://api.npmjs.org/downloads/'
const MIN_GAP_MS = 155
const BULK_CHUNK = 100
const MAX_PACKAGES = 400
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
  return { weekly: null, monthly: null, daily: null, monthlyRange: null }
}

function isLikelyPackageName(name: string): boolean {
  if (!name.length || name.length > 214 || name.includes('..')) return false
  if (name.includes('\\')) return false
  if (name.startsWith('@'))
    return /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i.test(name)
  return /^[a-z0-9][a-z0-9._-]*$/i.test(name)
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
  for (const row of r.downloads as unknown[]) {
    if (typeof row !== 'object' || row === null) return null
    const d = row as Partial<DownloadsDay>
    if (typeof d.day !== 'string' || typeof d.downloads !== 'number') return null
  }
  return r as DownloadsRange
}

function asBulkPoints(j: unknown): Record<string, BulkPointRow> | null {
  if (typeof j !== 'object' || j === null || isErrorBody(j)) return null
  const top = j as Record<string, unknown>
  // One unscoped package: { downloads, package, start, end } — not { name: {…} }
  if (
    typeof top.package === 'string' &&
    typeof top.downloads === 'number' &&
    typeof top.start === 'string' &&
    typeof top.end === 'string'
  ) {
    return { [top.package]: top as BulkPointRow }
  }
  const out: Record<string, BulkPointRow> = {}
  for (const row of Object.values(top)) {
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
  const top = j as Record<string, unknown>
  if (
    typeof top.package === 'string' &&
    typeof top.start === 'string' &&
    typeof top.end === 'string' &&
    Array.isArray(top.downloads)
  ) {
    const days = top.downloads as unknown[]
    for (const day of days) {
      if (typeof day !== 'object' || day === null) return null
      const d = day as Partial<DownloadsDay>
      if (typeof d.day !== 'string' || typeof d.downloads !== 'number') return null
    }
    return { [top.package]: top as BulkRangeRow }
  }
  const out: Record<string, BulkRangeRow> = {}
  for (const row of Object.values(top)) {
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

async function ingestUnscopedBulk(
  pkgsChunk: readonly string[],
  out: Record<string, PackageDownloadsBundle>,
): Promise<void> {
  const list = [...pkgsChunk].map((p) => encodeURIComponent(p)).join(',')

  const bpWk = asBulkPoints(
    (await jsonOrNull(await npmDownloadsFetch(`point/last-week/${list}`))) ?? null,
  )
  const bpMo = asBulkPoints(
    (await jsonOrNull(await npmDownloadsFetch(`point/last-month/${list}`))) ?? null,
  )
  const brWk = asBulkRanges(
    (await jsonOrNull(await npmDownloadsFetch(`range/last-week/${list}`))) ?? null,
  )
  const brMo = asBulkRanges(
    (await jsonOrNull(await npmDownloadsFetch(`range/last-month/${list}`))) ?? null,
  )

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
  bundle.weekly = asPoint(
    await jsonOrNull(await npmDownloadsFetch(`point/last-week/${enc}`)),
  )
  bundle.monthly = asPoint(
    await jsonOrNull(await npmDownloadsFetch(`point/last-month/${enc}`)),
  )
  bundle.daily = asRange(
    await jsonOrNull(await npmDownloadsFetch(`range/last-week/${enc}`)),
  )
  bundle.monthlyRange = asRange(
    await jsonOrNull(await npmDownloadsFetch(`range/last-month/${enc}`)),
  )
  return bundle
}

async function aggregatePackageDownloads(
  body: unknown,
): Promise<Record<string, PackageDownloadsBundle>> {
  lastNpmDownloadsEndMs = 0
  const names = sanitizeIncomingPackageList(body)
  const out: Record<string, PackageDownloadsBundle> = {}
  for (const n of names) out[n] = emptyBundle()
  if (!names.length) return out

  const { unscoped, scoped } = partition(names)
  for (let i = 0; i < unscoped.length; i += BULK_CHUNK) {
    await ingestUnscopedBulk(unscoped.slice(i, i + BULK_CHUNK), out)
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

/** ~1s/pkg sequential; full maintainer list can be 80–150+ scoped names. */
export const config = { maxDuration: 300 }

function coerceRequestBody(raw: unknown):
  | { ok: false; status: number; body: { error: string } }
  | { ok: true; parsed: unknown } {
  if (raw === undefined || raw === null) return { ok: true, parsed: {} }
  if (typeof raw === 'string') {
    try {
      const t = raw.trim()
      return { ok: true, parsed: t.length === 0 ? {} : JSON.parse(t) }
    } catch {
      return { ok: false, status: 400, body: { error: 'Invalid JSON body' } }
    }
  }
  if (typeof raw === 'object' && raw !== null && Buffer.isBuffer(raw)) {
    try {
      const t = raw.toString('utf8').trim()
      return { ok: true, parsed: t.length === 0 ? {} : JSON.parse(t) }
    } catch {
      return { ok: false, status: 400, body: { error: 'Invalid JSON body' } }
    }
  }
  return { ok: true, parsed: raw }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({
        error: 'Method not allowed (use POST with { "packages": string[] })',
      })
      return
    }

    const coerced = coerceRequestBody(req.body as unknown)
    if (!coerced.ok) {
      res.status(coerced.status).json(coerced.body)
      return
    }

    const agg = await aggregatePackageDownloads(coerced.parsed)
    res.setHeader('Cache-Control', 'private, no-store')
    res.status(200).json(agg)
  } catch (err: unknown) {
    console.error(
      '[package-downloads]',
      err instanceof Error ? err.stack ?? err.message : err,
    )
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to aggregate download stats' })
    }
  }
}
