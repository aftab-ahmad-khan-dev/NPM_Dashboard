import type { NpmRegistryMeta, PackageDownloadsBundle } from '../types'

export type { PackageDownloadsBundle } from '../types'

const REGISTRY = 'https://registry.npmjs.org'

/** Same-origin API — npm’s search endpoint does not reliably send browser CORS (429s mask as “CORS”). */
const NPM_SEARCH_API = '/api/npm-search'

/** Same-origin API — see `api/package-downloads.ts` (runs npm downloads work server-side, one POST). */
export const PACKAGE_DOWNLOADS_API = '/api/package-downloads'

const NPM_FETCH_MAX_ATTEMPTS = 7

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

/** Proxied npm search + registry metadata (downloads use `PACKAGE_DOWNLOADS_API`). */
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

/** Scoped pkgs need 4 npm calls each; keep each POST under Vercel’s 60s limit on Hobby. */
const DOWNLOADS_API_CHUNK = 32

function emptyDownloadsBundle(): PackageDownloadsBundle {
  return { weekly: null, monthly: null, daily: null, monthlyRange: null }
}

function mergeDownloadsChunk(
  names: string[],
  data: Record<string, unknown>,
): Map<string, PackageDownloadsBundle> {
  const out = new Map<string, PackageDownloadsBundle>()
  for (const name of names) {
    const row = data[name]
    if (typeof row !== 'object' || row === null) {
      out.set(name, emptyDownloadsBundle())
      continue
    }
    const bundle = row as PackageDownloadsBundle
    out.set(name, {
      weekly: bundle.weekly ?? null,
      monthly: bundle.monthly ?? null,
      daily: bundle.daily ?? null,
      monthlyRange: bundle.monthlyRange ?? null,
    })
  }
  return out
}

async function fetchPackagesDownloadsChunk(names: string[]): Promise<
  Map<string, PackageDownloadsBundle>
> {
  const res = await fetch(PACKAGE_DOWNLOADS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ packages: names }),
    cache: 'no-store',
  })

  const rawBody = await res.text()

  if (!res.ok) {
    let msg = rawBody.replace(/\s+/g, ' ').trim().slice(0, 500)
    try {
      const parsed = JSON.parse(rawBody) as { error?: unknown; detail?: unknown }
      let e = ''
      if (typeof parsed?.error === 'string' && parsed.error.trim())
        e = parsed.error.trim()
      if (!e.length) throw new Error('no-json-error')
      if (typeof parsed.detail === 'string' && parsed.detail.trim())
        e = `${e} ${parsed.detail.trim()}`
      msg = e
    } catch {
      /* plain text upstream */
    }
    throw new Error(`Downloads API ${res.status}: ${msg || 'no body'}`)
  }

  let data: unknown
  try {
    data = JSON.parse(rawBody) as unknown
  } catch {
    throw new Error('Downloads API: response was not valid JSON')
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('downloads aggregate: unexpected response shape')
  }

  return mergeDownloadsChunk(names, data as Record<string, unknown>)
}

/**
 * Loads download stats via POST /api/package-downloads (chunked so large maintainer lists don’t 504).
 */
export async function fetchPackagesDownloadsBatch(names: string[]): Promise<
  Map<string, PackageDownloadsBundle>
> {
  if (!names.length) return new Map()

  const merged = new Map<string, PackageDownloadsBundle>()
  for (let i = 0; i < names.length; i += DOWNLOADS_API_CHUNK) {
    const chunk = names.slice(i, i + DOWNLOADS_API_CHUNK)
    const part = await fetchPackagesDownloadsChunk(chunk)
    for (const [k, v] of part) merged.set(k, v)
  }
  return merged
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
    const res = await registryFetch(`${NPM_SEARCH_API}?${qs}`)
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
