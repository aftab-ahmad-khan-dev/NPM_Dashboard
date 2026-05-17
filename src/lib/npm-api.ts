import type { DownloadsPoint, DownloadsRange, NpmRegistryMeta } from '../types'

const REGISTRY = 'https://registry.npmjs.org'
const DOWNLOADS = 'https://api.npmjs.org/downloads'

interface NpmSearchResponse {
  objects: Array<{ package: { name: string } }>
  total: number
}

/** Lists published package names where `username` is a maintainer (npm search API). */
export async function fetchPackageNamesByMaintainer(username: string): Promise<string[]> {
  const pageSize = 250
  const names = new Set<string>()
  let from = 0
  let total = Infinity

  while (from < total) {
    const qs = new URLSearchParams({
      text: `maintainer:${username}`,
      size: String(pageSize),
      from: String(from),
    })
    const res = await fetch(`${REGISTRY}/-/v1/search?${qs}`)
    if (!res.ok) {
      throw new Error(`npm search failed for maintainer ${username}: ${res.status}`)
    }
    const data = (await res.json()) as NpmSearchResponse
    total = typeof data.total === 'number' ? data.total : 0
    for (const obj of data.objects ?? []) {
      const name = obj.package?.name
      if (name) names.add(name)
    }
    if (!data.objects?.length) break
    from += data.objects.length
  }

  return [...names].sort((a, b) => a.localeCompare(b))
}

export async function fetchPackageMeta(name: string): Promise<NpmRegistryMeta> {
  const res = await fetch(`${REGISTRY}/${encodeURIComponent(name)}`)
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
    const res = await fetch(`${DOWNLOADS}/point/${period}/${encodeURIComponent(name)}`)
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
    const res = await fetch(`${DOWNLOADS}/range/${period}/${encodeURIComponent(name)}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
