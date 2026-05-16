import { useMemo, useState } from 'react'
import { ArrowDownAZ, Calendar, Download, Search, SortAsc } from 'lucide-react'
import { usePackages } from '../context/PackagesContext'
import { PackageCard } from '../components/PackageCard'
import { Skeleton } from '../components/Skeleton'
import { useMeta } from '../hooks/useMeta'

type SortKey = 'name' | 'downloads' | 'updated'

export function Packages() {
  const { packages, loading } = usePackages()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('downloads')

  useMeta({
    title:
      'All npm Packages — Search & Browse · Aftab Ahmad Khan TypeScript Open-Source Modules',
    description:
      'Browse all 11 open-source npm packages by Aftab Ahmad Khan: TypeScript developer tools, AI / LLM infrastructure, monorepo utilities, supply-chain security, image optimization, file uploads, env loading, prompt versioning, and more. Search by name, description, or keyword.',
    keywords:
      'npm packages list, open source typescript packages, node.js modules, developer tools, aftab ahmad khan packages, monodrift, picsmith, mcp-bootstrap, fileflux, chainsentry, envrunes, llmtoken, promptver, reconnecting-stream, cost-limiter, mongoose-advanced-plugin',
    canonical: 'https://npm-packages-modules.dev/packages',
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    let list = !q
      ? [...packages]
      : packages.filter((p) => {
          const haystack = [
            p.name,
            p.meta.description ?? '',
            ...(p.meta.keywords ?? []),
          ]
            .join(' ')
            .toLowerCase()
          return haystack.includes(q)
        })

    list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'downloads')
        return (b.weekly?.downloads ?? 0) - (a.weekly?.downloads ?? 0)
      // updated
      const ta = new Date(a.meta.time?.modified ?? 0).getTime()
      const tb = new Date(b.meta.time?.modified ?? 0).getTime()
      return tb - ta
    })
    return list
  }, [packages, search, sort])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-50 tracking-tight">
          Packages
        </h1>
        <p className="text-sm text-zinc-400 mt-1.5">
          {packages.length} packages on npm registry
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, description, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/60 focus:bg-zinc-900 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="inline-flex bg-zinc-900/70 border border-zinc-800 rounded-xl p-1 self-stretch sm:self-auto">
          <SortBtn current={sort} value="downloads" onClick={setSort} icon={<Download className="w-3.5 h-3.5" />}>
            Downloads
          </SortBtn>
          <SortBtn current={sort} value="updated" onClick={setSort} icon={<Calendar className="w-3.5 h-3.5" />}>
            Updated
          </SortBtn>
          <SortBtn current={sort} value="name" onClick={setSort} icon={<ArrowDownAZ className="w-3.5 h-3.5" />}>
            Name
          </SortBtn>
        </div>
      </div>

      {loading && packages.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-2xl">
          <SortAsc className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
          No packages match &ldquo;{search}&rdquo;
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PackageCard key={p.name} pkg={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function SortBtn({
  current,
  value,
  onClick,
  icon,
  children,
}: {
  current: SortKey
  value: SortKey
  onClick: (v: SortKey) => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  const active = current === value
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors flex-1 sm:flex-none justify-center ${
        active
          ? 'bg-violet-500/15 text-violet-300'
          : 'text-zinc-400 hover:text-zinc-100'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  )
}
