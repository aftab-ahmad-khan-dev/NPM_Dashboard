import type { DownloadsDay, DownloadsPoint, DownloadsRange, PackageDownloadsBundle } from '../types'

/** Sum day rows from npm `range/*` responses (canonical when present). */
export function sumDailyRows(days: DownloadsDay[] | undefined): number {
  if (!days?.length) return 0
  let total = 0
  for (const d of days) {
    if (typeof d.downloads === 'number' && Number.isFinite(d.downloads)) total += d.downloads
  }
  return total
}

function pointDownloads(point: DownloadsPoint | null | undefined): number {
  const n = point?.downloads
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

/** Last 7 days — prefer summed daily range (matches sparklines), else npm point total. */
export function weeklyDownloadsFromBundle(bundle: PackageDownloadsBundle): number {
  const fromRange = sumDailyRows(bundle.daily?.downloads)
  if (fromRange > 0) return fromRange
  return pointDownloads(bundle.weekly)
}

/** Last 30 days — prefer summed daily range, else npm point total. */
export function monthlyDownloadsFromBundle(bundle: PackageDownloadsBundle): number {
  const fromRange = sumDailyRows(bundle.monthlyRange?.downloads)
  if (fromRange > 0) return fromRange
  return pointDownloads(bundle.monthly)
}

export function weeklyDownloadsFromPackage(pkg: {
  weekly: DownloadsPoint | null
  monthly: DownloadsPoint | null
  daily: DownloadsRange | null
  monthlyRange: DownloadsRange | null
}): number {
  return weeklyDownloadsFromBundle({
    weekly: pkg.weekly,
    monthly: pkg.monthly,
    daily: pkg.daily,
    monthlyRange: pkg.monthlyRange,
  })
}

export function monthlyDownloadsFromPackage(pkg: {
  weekly: DownloadsPoint | null
  monthly: DownloadsPoint | null
  daily: DownloadsRange | null
  monthlyRange: DownloadsRange | null
}): number {
  return monthlyDownloadsFromBundle({
    weekly: pkg.weekly,
    monthly: pkg.monthly,
    daily: pkg.daily,
    monthlyRange: pkg.monthlyRange,
  })
}
