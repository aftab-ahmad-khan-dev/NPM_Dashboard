import type { DownloadsPoint, DownloadsRange, NpmRegistryMeta } from '../types'

const REGISTRY = 'https://registry.npmjs.org'
const DOWNLOADS = 'https://api.npmjs.org/downloads'

/** Avoid stale package lists/stats after refresh — npm sends cacheable responses. */
function npmFetch(input: string | URL): Promise<Response> {
  return fetch(input, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })
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
    const res = await npmFetch(`${REGISTRY}/-/v1/search?${qs}`)
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
  const res = await npmFetch(`${REGISTRY}/${encodeURIComponent(name)}`)
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
    const res = await npmFetch(`${DOWNLOADS}/point/${period}/${encodeURIComponent(name)}`)
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
    const res = await npmFetch(`${DOWNLOADS}/range/${period}/${encodeURIComponent(name)}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
