import { Link } from 'react-router-dom'
import { ArrowUpRight, Calendar, Download } from 'lucide-react'
import { monthlyDownloadsFromPackage, weeklyDownloadsFromPackage } from '../lib/downloads-stats'
import { formatNumber, timeAgo } from '../lib/format'
import { inferPackageTrack, TRACK_META, type DevTrackId } from '../lib/package-track'
import type { PackageData } from '../types'

const TRACK_BADGE: Record<DevTrackId, string> = {
  mern: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  'react-native': 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
  flutter: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/25',
}

interface Props {
  pkg: PackageData
}

export function PackageCard({ pkg }: Props) {
  const isPub = pkg.registry === 'pub'
  const latest = pkg.meta['dist-tags']?.latest ?? '0.0.0'
  const modified = pkg.meta.time?.modified
  const keywords = pkg.meta.keywords ?? []
  const track = inferPackageTrack(pkg)
  const dl = isPub ? monthlyDownloadsFromPackage(pkg) : weeklyDownloadsFromPackage(pkg)
  const dlLabel = isPub ? '/30d' : '/wk'

  const cardInner = (
    <>
      <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
      <div className="flex items-start justify-between gap-3 mb-2 pr-6">
        <h3 className="font-medium text-zinc-100 truncate">{pkg.name}</h3>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 font-mono ring-1 ring-inset ring-violet-500/20">
          v{latest}
        </span>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ring-1 ring-inset ${TRACK_BADGE[track]}`}
          title={TRACK_META[track].description}
        >
          {TRACK_META[track].shortLabel}
        </span>
        {isPub && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-200 ring-1 ring-inset ring-cyan-500/30">
            pub.dev
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 line-clamp-2 mb-4 min-h-[2.5rem]">
        {pkg.meta.description ?? 'No description available'}
      </p>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {keywords.slice(0, 3).map((k) => (
            <span
              key={k}
              className="text-[10px] px-1.5 py-0.5 bg-zinc-800/70 rounded text-zinc-400"
            >
              {k}
            </span>
          ))}
          {keywords.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 text-zinc-500">
              +{keywords.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-3 border-t border-zinc-800/60">
        <span className="flex items-center gap-1">
          <Download className="w-3.5 h-3.5" />
          <span className="tabular-nums">{formatNumber(dl)}</span>
          <span className="text-zinc-600">{dlLabel}</span>
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {timeAgo(modified)}
        </span>
      </div>
    </>
  )

  const className =
    'group relative block bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 hover:border-violet-500/40 hover:bg-zinc-900/80 transition-all'

  if (isPub) {
    return (
      <a
        href={`https://pub.dev/packages/${encodeURIComponent(pkg.name)}`}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {cardInner}
      </a>
    )
  }

  return (
    <Link to={`/packages/${encodeURIComponent(pkg.name)}`} className={className}>
      {cardInner}
    </Link>
  )
}
