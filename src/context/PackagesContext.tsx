import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PACKAGES } from '../data/packages'
import { fetchDownloads, fetchDownloadsRange, fetchPackageMeta } from '../lib/npm-api'
import type { PackageData } from '../types'

interface State {
  packages: PackageData[]
  loading: boolean
  error: string | null
  refresh: () => void
  lastUpdated: Date | null
}

const Ctx = createContext<State | null>(null)

export function PackagesProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(
        PACKAGES.map(async (name) => {
          try {
            const [meta, weekly, monthly, daily] = await Promise.all([
              fetchPackageMeta(name),
              fetchDownloads(name, 'last-week'),
              fetchDownloads(name, 'last-month'),
              fetchDownloadsRange(name, 'last-week'),
            ])
            return { name, meta, weekly, monthly, daily } satisfies PackageData
          } catch {
            return null
          }
        }),
      )
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
