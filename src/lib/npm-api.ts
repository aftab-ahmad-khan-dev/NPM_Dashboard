import type { DownloadsPoint, DownloadsRange, NpmRegistryMeta } from '../types'

const REGISTRY = 'https://registry.npmjs.org'
const DOWNLOADS = 'https://api.npmjs.org/downloads'

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
