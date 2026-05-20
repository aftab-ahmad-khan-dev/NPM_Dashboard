import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Github,
  HardDrive,
  Hash,
  Package as PackageIcon,
  Scale,
  Tag,
  User,
} from 'lucide-react'
import { usePackages } from '../context/PackagesContext'
import { Skeleton } from '../components/Skeleton'
import { useMeta } from '../hooks/useMeta'
import {
  cleanRepoUrl,
  formatBytes,
  formatDate,
  formatNumber,
  timeAgo,
} from '../lib/format'

export function PackageDetail() {
  const { name } = useParams<{ name: string }>()
  const { packages, loading, lastUpdated } = usePackages()
  const pkg = packages.find((p) => p.name === name)
  const [copied, setCopied] = useState(false)

  useMeta({
    title: pkg
      ? `${pkg.name}@${pkg.meta['dist-tags']?.latest ?? ''} — ${pkg.meta.description ?? 'npm package'} · Aftab Ahmad Khan`
      : `${name} · npm Packages Dashboard`,
    description: pkg
      ? `${pkg.meta.description ?? pkg.name + ' npm package'} — open-source TypeScript module by Aftab Ahmad Khan (mr-aftab-ahmad-khan). Latest version v${pkg.meta['dist-tags']?.latest ?? '0.0.0'}, MIT licensed, ${formatNumber(pkg.weekly?.downloads)} weekly downloads.`
      : `Live npm package details and download stats for ${name}.`,
    keywords: pkg
      ? `${pkg.name}, npm package, ${(pkg.meta.keywords ?? []).join(', ')}, aftab ahmad khan, typescript, open source, ${pkg.meta.license ?? 'MIT'}`
      : `${name}, npm package`,
    canonical: `https://npm-packages-modules.dev/packages/${encodeURIComponent(name ?? '')}`,
  })

  if (loading && !pkg) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!pkg) {
    if (lastUpdated === null) {
      return (
        <div className='text-center py-16'>
          <p className='text-zinc-400'>
            Data is not loaded yet. Use <span className='font-medium text-zinc-200'>Refresh</span> in the header
            to fetch packages, then open this page again.
          </p>
          <Link to='/packages' className='text-violet-400 hover:text-violet-300 mt-4 inline-block text-sm'>
            ← Back to packages
          </Link>
        </div>
      )
    }
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400">Package <span className="font-mono">{name}</span> not found</p>
        <Link to="/packages" className="text-violet-400 hover:text-violet-300 mt-4 inline-block text-sm">
          ← Back to packages
        </Link>
      </div>
    )
  }

  const latest = pkg.meta['dist-tags']?.latest
  const latestMeta = latest ? pkg.meta.versions?.[latest] : undefined
  const versions = Object.keys(pkg.meta.versions ?? {})
  const repoUrl = cleanRepoUrl(pkg.meta.repository?.url)
  const homepage = pkg.meta.homepage
  const installCmd = `npm install ${pkg.name}`
  const author = typeof pkg.meta.author === 'string' ? pkg.meta.author : pkg.meta.author?.name
  const depCount = latestMeta?.dependencies ? Object.keys(latestMeta.dependencies).length : 0

  function copyInstall() {
    navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <Link
        to="/packages"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to packages
      </Link>

      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shrink-0 shadow-lg shadow-violet-500/20">
            <PackageIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-50 break-all">
                {pkg.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 font-mono ring-1 ring-inset ring-violet-500/20">
                v{latest}
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {pkg.meta.description ?? 'No description available.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`https://www.npmjs.com/package/${pkg.name}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            npmjs.com
          </a>
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300"
            >
              <Github className="w-3.5 h-3.5" />
              Repository
            </a>
          )}
          {homepage && homepage !== repoUrl && (
            <a
              href={homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300"
            >
              <FileText className="w-3.5 h-3.5" />
              Homepage
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MiniStat
          icon={Download}
          label="Weekly"
          value={formatNumber(pkg.weekly?.downloads)}
        />
        <MiniStat
          icon={Download}
          label="Monthly"
          value={formatNumber(pkg.monthly?.downloads)}
        />
        <MiniStat icon={Tag} label="Versions" value={versions.length.toString()} />
        <MiniStat
          icon={HardDrive}
          label="Unpacked"
          value={formatBytes(latestMeta?.dist?.unpackedSize)}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-medium text-zinc-200 mb-4">Install</h2>
          <div className="relative bg-black/40 border border-zinc-800 rounded-lg px-3 py-2.5 font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto">
            <code>{installCmd}</code>
            <button
              onClick={copyInstall}
              className="absolute top-2 right-2 p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors"
              aria-label="Copy install command"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-medium text-zinc-200 mb-4">Info</h2>
          <dl className="space-y-2.5 text-sm">
            <Row icon={Scale} label="License" value={pkg.meta.license ?? '—'} />
            <Row icon={User} label="Author" value={author ?? '—'} />
            <Row
              icon={Calendar}
              label="Created"
              value={formatDate(pkg.meta.time?.created)}
            />
            <Row
              icon={Calendar}
              label="Modified"
              value={formatDate(pkg.meta.time?.modified)}
            />
            <Row icon={Hash} label="Dependencies" value={depCount.toString()} />
          </dl>
        </div>
      </div>

      {pkg.meta.keywords && pkg.meta.keywords.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-medium text-zinc-200 mb-4">Keywords</h2>
          <div className="flex flex-wrap gap-1.5">
            {pkg.meta.keywords.map((k) => (
              <span
                key={k}
                className="text-xs px-2.5 py-1 bg-zinc-800/70 rounded-md text-zinc-300"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-medium text-zinc-200 mb-4">
          Version history
          <span className="ml-2 text-xs text-zinc-500 font-normal">
            ({versions.length} total)
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {versions
            .slice()
            .reverse()
            .map((v) => {
              const isLatest = v === latest
              return (
                <div
                  key={v}
                  className={`rounded-lg p-2.5 border ${
                    isLatest
                      ? 'border-violet-500/30 bg-violet-500/5'
                      : 'border-zinc-800/60 bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-zinc-100">{v}</span>
                    {isLatest && (
                      <span className="text-[9px] uppercase tracking-wider text-violet-300">
                        latest
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {timeAgo(pkg.meta.time?.[v])}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PackageIcon
  label: string
  value: string
}) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] uppercase tracking-wider mb-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-lg sm:text-xl font-semibold text-zinc-50 tabular-nums">{value}</div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PackageIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-zinc-100 text-right truncate">{value}</span>
    </div>
  )
}
