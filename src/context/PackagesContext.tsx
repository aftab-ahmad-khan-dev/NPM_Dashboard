import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NPM_MAINTAINER_USERNAME, NPM_PACKAGES_PINNED, PACKAGE_DENYLIST } from '../data/packages'
import {
  discoverPublishedPackageNames,
  fetchDownloads,
  fetchDownloadsRange,
  fetchPackageMeta,
} from '../lib/npm-api'
import type { PackageData } from '../types'

interface State {
  packages: PackageData[]
  loading: boolean
  error: string | null
  refresh: () => void
  lastUpdated: Date | null
}

const Ctx = createContext<State | null>(null)

const PACKAGE_FETCH_BATCH = 3
const PACKAGE_RETRY_DELAY_MS = 800
const BATCH_COOLDOWN_MS = 400

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize)
    const part = await Promise.all(chunk.map((item) => fn(item)))
    out.push(...part)
    if (i + batchSize < items.length && BATCH_COOLDOWN_MS > 0) {
      await new Promise((r) => setTimeout(r, BATCH_COOLDOWN_MS))
    }
  }
  return out
}

async function loadPackageData(name: string): Promise<PackageData | null> {
  const fetchOnce = async (): Promise<PackageData> => {
    /* Sequential calls — parallel fan-out was hammering registry + downloads APIs (429). */
    const meta = await fetchPackageMeta(name)
    const weekly = await fetchDownloads(name, 'last-week')
    const monthly = await fetchDownloads(name, 'last-month')
    const daily = await fetchDownloadsRange(name, 'last-week')
    const monthlyRange = await fetchDownloadsRange(name, 'last-month')
    return { name, meta, weekly, monthly, daily, monthlyRange }
  }
  try {
    return await fetchOnce()
  } catch {
    await new Promise((r) => setTimeout(r, PACKAGE_RETRY_DELAY_MS))
    try {
      return await fetchOnce()
    } catch {
      return null
    }
  }
}

export function PackagesProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let names = await discoverPublishedPackageNames(NPM_MAINTAINER_USERNAME)
      if (NPM_PACKAGES_PINNED.length) {
        const merged = new Set(names)
        for (const n of NPM_PACKAGES_PINNED) merged.add(n)
        names = [...merged].sort((a, b) => a.localeCompare(b))
      }
      if (PACKAGE_DENYLIST.length) {
        const deny = new Set(PACKAGE_DENYLIST)
        names = names.filter((n) => !deny.has(n))
      }
      const results = await mapInBatches(names, PACKAGE_FETCH_BATCH, loadPackageData)
      const filtered = results.filter((r): r is PackageData => r !== null)
      setPackages(filtered)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Ctx.Provider value={{ packages, loading, error, refresh: load, lastUpdated }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePackages(): State {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePackages must be used within PackagesProvider')
  return ctx
}
