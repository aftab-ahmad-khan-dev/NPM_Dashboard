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

/**
 * Loads download stats for all packages via a single POST to our API (bulk + paced scoped lookups on the server).
 */
export async function fetchPackagesDownloadsBatch(names: string[]): Promise<
  Map<string, PackageDownloadsBundle>
> {
  const res = await fetch(PACKAGE_DOWNLOADS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ packages: names }),
    cache: 'no-store',
  })

  if (!res.ok)
    throw new Error(`downloads aggregate failed: ${res.status} ${await res.text()}`)

  const data = (await res.json()) as unknown
  if (typeof data !== 'object' || data === null) {
    throw new Error('downloads aggregate: unexpected response shape')
  }

  const out = new Map<string, PackageDownloadsBundle>()
  for (const name of names) {
    const row = (data as Record<string, unknown>)[name]
    if (typeof row !== 'object' || row === null) {
      out.set(name, { weekly: null, monthly: null, daily: null, monthlyRange: null })
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
