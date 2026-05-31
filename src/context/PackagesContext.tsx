import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  NPM_MAINTAINER_USERNAME,
  NPM_PACKAGES_PINNED,
  PACKAGE_DENYLIST,
  PUB_PACKAGE_NAMES,
  PUB_PACKAGES_PINNED,
} from '../data/packages'
import {
  discoverPublishedPackageNames,
  fetchPackagesDownloadsBatch,
  fetchPackageMeta,
} from '../lib/npm-api'
import { fetchPubPackagesBatch, pubRecordToPackageData } from '../lib/pub-api'
import type { PackageData } from '../types'

interface State {
  packages: PackageData[]
  loading: boolean
  error: string | null
  refresh: () => void
  lastUpdated: Date | null
  /** Increments on each header refresh so GitHub org data can follow the same manual trigger. */
  refreshGeneration: number
}

const Ctx = createContext<State | null>(null)

const META_FETCH_BATCH = 6
const META_BATCH_COOLDOWN_MS = 300

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
    if (i + batchSize < items.length && META_BATCH_COOLDOWN_MS > 0) {
      await new Promise((r) => setTimeout(r, META_BATCH_COOLDOWN_MS))
    }
  }
  return out
}

export function PackagesProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshGeneration, setRefreshGeneration] = useState(0)

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
      const downloadMapPromise = fetchPackagesDownloadsBatch(names).catch(() => new Map())
      const metaResultsPromise = mapInBatches(names, META_FETCH_BATCH, async (name) => {
        try {
          return await fetchPackageMeta(name)
        } catch {
          return null
        }
      })
      const [downloadMap, metas, pubRows] = await Promise.all([
        downloadMapPromise,
        metaResultsPromise,
        fetchPubPackagesBatch(
          [...new Set([...PUB_PACKAGE_NAMES, ...PUB_PACKAGES_PINNED])].sort((a, b) =>
            a.localeCompare(b),
          ),
        ).catch(() => [] as Awaited<ReturnType<typeof fetchPubPackagesBatch>>),
      ])
      const results: PackageData[] = []
      names.forEach((name, index) => {
        const meta = metas[index]
        if (!meta) return
        const d = downloadMap.get(name)
        if (!d) return
        results.push({
          registry: 'npm',
          name,
          meta,
          weekly: d.weekly,
          monthly: d.monthly,
          daily: d.daily,
          monthlyRange: d.monthlyRange,
        })
      })
      for (const row of pubRows) {
        results.push(pubRecordToPackageData(row))
      }
      results.sort((a, b) => a.name.localeCompare(b.name))
      setPackages(results)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const refresh = useCallback(async () => {
    setRefreshGeneration((g) => g + 1)
    await load()
  }, [load])

  return (
    <Ctx.Provider value={{ packages, loading, error, refresh, lastUpdated, refreshGeneration }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePackages(): State {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePackages must be used within PackagesProvider')
  return ctx
}
