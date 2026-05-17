import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Calendar,
  Crown,
  Download,
  GitBranch,
  HardDrive,
  Minus,
  Package,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { usePackages } from "../context/PackagesContext";
import { Skeleton } from "../components/Skeleton";
import { formatBytes, formatNumber, timeAgo } from "../lib/format";
import { useMeta } from "../hooks/useMeta";
import type { PackageData } from "../types";

const ACCENT_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-indigo-500 to-violet-500",
  "from-cyan-400 to-sky-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-blue-400 to-indigo-500",
  "from-lime-400 to-emerald-500",
];

export function Overview() {
  const { packages, loading, lastUpdated } = usePackages();
  const pkgCount = packages.length;

  useMeta({
    title:
      "npm Packages Dashboard — Live Overview · Aftab Ahmad Khan TypeScript Open-Source Tools",
    description:
      pkgCount > 0
        ? `Live overview of ${pkgCount} open-source npm packages by Aftab Ahmad Khan — total downloads, version count, top packages, recent releases, and license distribution. Updated in real time from registry.npmjs.org.`
        : "Live overview of open-source npm packages by Aftab Ahmad Khan — total downloads, version count, top packages, recent releases, and license distribution. Updated in real time from registry.npmjs.org.",
    keywords:
      "npm packages dashboard, live npm stats, open source typescript, aftab ahmad khan, mr-aftab-ahmad-khan, monodrift, picsmith, mcp-bootstrap, fileflux, chainsentry, envrunes, llmtoken, promptver, weekly downloads",
    canonical: "https://npm-packages-modules.dev/",
  });

  if (loading && packages.length === 0) {
    return <LoadingState />;
  }

  const weeklyTotal = packages.reduce(
    (acc, p) => acc + (p.weekly?.downloads ?? 0),
    0,
  );
  const monthlyTotal = packages.reduce(
    (acc, p) => acc + (p.monthly?.downloads ?? 0),
    0,
  );
  const totalVersions = packages.reduce(
    (acc, p) => acc + Object.keys(p.meta.versions ?? {}).length,
    0,
  );
  const totalSize = packages.reduce((acc, p) => {
    const latest = p.meta["dist-tags"]?.latest;
    const size = latest ? (p.meta.versions?.[latest]?.dist?.unpackedSize ?? 0) : 0;
    return acc + size;
  }, 0);

  const sortedByModified = [...packages].sort(
    (a, b) =>
      new Date(b.meta.time?.modified ?? 0).getTime() -
      new Date(a.meta.time?.modified ?? 0).getTime(),
  );
  const topByDownloads = [...packages].sort(
    (a, b) => (b.weekly?.downloads ?? 0) - (a.weekly?.downloads ?? 0),
  );
  const featured = topByDownloads[0];

  const licenseCounts = packages.reduce<Record<string, number>>((acc, p) => {
    const lic = p.meta.license ?? "Unspecified";
    acc[lic] = (acc[lic] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className='space-y-6 sm:space-y-8'>
      <HeroBanner
        count={packages.length}
        weekly={weeklyTotal}
        monthly={monthlyTotal}
        lastUpdated={lastUpdated}
      />

      <StatGrid
        weekly={weeklyTotal}
        monthly={monthlyTotal}
        versions={totalVersions}
        totalSize={totalSize}
        topByDownloads={topByDownloads}
        recent={sortedByModified[0]}
        packages={packages}
      />

      {featured && <FeaturedCard pkg={featured} />}

      <div className='grid lg:grid-cols-5 gap-4 sm:gap-6'>
        <TopDownloadsChart packages={topByDownloads.slice(0, 6)} />
        <RecentActivity packages={sortedByModified.slice(0, 6)} />
      </div>

      <LicenseSection licenses={licenseCounts} total={packages.length} />
    </div>
  );
}

/* ---------- Hero banner ---------- */

function HeroBanner({
  count,
  weekly,
  monthly,
  lastUpdated,
}: {
  count: number;
  weekly: number;
  monthly: number;
  lastUpdated: Date | null;
}) {
  return (
    <section className='relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-950 p-6 sm:p-8 lg:p-10 animate-fade-up delay-0'>
      <div className='absolute inset-0 grid-bg' />
      <div className='absolute -top-24 -right-16 w-72 h-72 rounded-full bg-violet-600/15 blur-3xl' />
      <div className='absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl' />

      <div className='relative grid lg:grid-cols-3 gap-6 items-end'>
        <div className='lg:col-span-2 min-w-0'>
          <div className='inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5'>
            <span className='relative flex h-1.5 w-1.5'>
              <span className='absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping' />
              <span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400' />
            </span>
            <span className='text-[11px] tracking-wide text-emerald-300'>
              LIVE · synced {timeAgo(lastUpdated)}
            </span>
          </div>

          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]'>
            <span className='bg-gradient-to-br from-zinc-50 via-zinc-200 to-zinc-500 bg-clip-text text-transparent'>
              {count} packages
            </span>
            <br className='hidden sm:block' />
            <span className='bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent'>
              shipping daily.
            </span>
          </h1>

          <p className='text-sm sm:text-base text-zinc-400 mt-4 max-w-xl leading-relaxed'>
            Live, unified view of every package you publish to npm downloads,
            versions, health and recency in one place.
          </p>

          <div className='flex flex-wrap gap-2 mt-5 sm:mt-6'>
            <Link
              to='/packages'
              className='group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors'
            >
              Browse packages
              <ArrowUpRight className='w-4 h-4 group-hover:rotate-45 transition-transform' />
            </Link>
            <a
              href='https://www.npmjs.com/~mr-aftab-ahmad-khan'
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm hover:bg-zinc-900 transition-colors'
            >
              npm profile
            </a>
            <Link
              to='/about'
              className='inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm hover:bg-zinc-900 hover:border-zinc-700 transition-colors'
            >
              My profile
            </Link>
          </div>
        </div>

        <div className='relative lg:justify-self-end'>
          <div className='relative bg-zinc-900/60 backdrop-blur-md border border-zinc-800/70 rounded-2xl p-5 sm:p-6 min-w-[220px]'>
            <div className='text-[11px] uppercase tracking-wider text-zinc-500 mb-1'>
              Weekly downloads
            </div>
            <div className='text-3xl sm:text-4xl font-bold tabular-nums bg-gradient-to-br from-violet-300 to-cyan-300 bg-clip-text text-transparent'>
              {formatNumber(weekly)}
            </div>
            <div className='mt-2 flex items-center gap-1.5 text-xs text-zinc-500'>
              <TrendingUp className='w-3.5 h-3.5 text-emerald-400' />
              <span className='tabular-nums'>{formatNumber(monthly)}</span> over 30
              days
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stat tiles ---------- */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface DayBucket {
  day: string; // YYYY-MM-DD
  downloads: number;
}

/** Aggregate per-day downloads across every package. Returns buckets oldest → newest. */
function aggregateDailyDownloads(packages: PackageData[]): DayBucket[] {
  const totals = new Map<string, number>();
  for (const p of packages) {
    for (const d of p.daily?.downloads ?? []) {
      totals.set(d.day, (totals.get(d.day) ?? 0) + d.downloads);
    }
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, downloads]) => ({ day, downloads }));
}

function formatShortDate(yyyyMmDd: string): string {
  const d = new Date(yyyyMmDd + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function StatGrid({
  weekly,
  monthly,
  versions,
  totalSize,
  topByDownloads,
  recent,
  packages,
}: {
  weekly: number;
  monthly: number;
  versions: number;
  totalSize: number;
  topByDownloads: PackageData[];
  recent: PackageData | undefined;
  packages: PackageData[];
}) {
  const pkgCount = topByDownloads.length || 1;

  /* ----- Daily download buckets (powers the interactive sparklines) ----- */
  const dailyBuckets = aggregateDailyDownloads(packages);
  const peakDay = dailyBuckets.reduce<DayBucket | null>(
    (acc, b) => (acc == null || b.downloads > acc.downloads ? b : acc),
    null,
  );
  const todayBucket = dailyBuckets[dailyBuckets.length - 1];
  const avgDailyWeek = dailyBuckets.length
    ? dailyBuckets.reduce((s, b) => s + b.downloads, 0) / dailyBuckets.length
    : 0;
  const todayDeltaPct =
    todayBucket && avgDailyWeek > 0
      ? ((todayBucket.downloads - avgDailyWeek) / avgDailyWeek) * 100
      : 0;

  /* ----- Weekly downloads (totals & leader) ----- */
  const topWeekly = topByDownloads[0];
  const topWeeklyValue = topWeekly?.weekly?.downloads ?? 0;
  const weeklyShare = weekly > 0 ? (topWeeklyValue / weekly) * 100 : 0;
  const baselineWeekly = monthly / 4;
  const weeklyDeltaPct =
    baselineWeekly > 0 ? ((weekly - baselineWeekly) / baselineWeekly) * 100 : 0;

  /* ----- Versions ----- */
  const versionsByPkg = topByDownloads.map((p) => ({
    name: p.name,
    count: Object.keys(p.meta.versions ?? {}).length,
  }));
  const mostVersioned = [...versionsByPkg].sort((a, b) => b.count - a.count)[0];
  const avgVersions = versions / pkgCount;
  const versionPoints = versionsByPkg.map((v) => v.count);

  /* ----- Total size ----- */
  const sizesByPkg = topByDownloads.map((p) => {
    const latest = p.meta["dist-tags"]?.latest;
    const size = latest ? (p.meta.versions?.[latest]?.dist?.unpackedSize ?? 0) : 0;
    return { name: p.name, size };
  });
  const largest = [...sizesByPkg].sort((a, b) => b.size - a.size)[0];
  const avgSize = totalSize / pkgCount;
  const sizePoints = sizesByPkg.map((s) => s.size);

  /* ----- Activity ----- */
  const now = Date.now();
  const releasesIn7d = topByDownloads.filter((p) => {
    const t = new Date(p.meta.time?.modified ?? 0).getTime();
    return now - t < 7 * MS_PER_DAY;
  }).length;
  const releasesIn30d = topByDownloads.filter((p) => {
    const t = new Date(p.meta.time?.modified ?? 0).getTime();
    return now - t < 30 * MS_PER_DAY;
  }).length;
  // recent param is still threaded through for backwards-compat sub-label
  void recent;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
      <StatTile
        icon={Download}
        label='Weekly downloads'
        value={formatNumber(weekly)}
        sub={`${formatNumber(monthly)} over 30 days`}
        accent='violet'
        delay={1}
        delta={
          baselineWeekly > 0
            ? {
                value: `${weeklyDeltaPct >= 0 ? "+" : ""}${weeklyDeltaPct.toFixed(0)}%`,
                direction:
                  weeklyDeltaPct > 5 ? "up" : weeklyDeltaPct < -5 ? "down" : "flat",
                tooltip: "vs 4-week average",
              }
            : undefined
        }
        sparkline={
          dailyBuckets.length > 0 ? (
            <DailySparkline days={dailyBuckets} accent='violet' />
          ) : null
        }
        footer={
          topWeekly && topWeeklyValue > 0 ? (
            <LeaderRow
              label='Top'
              name={topWeekly.name}
              detail={`${formatNumber(topWeeklyValue)} · ${weeklyShare.toFixed(0)}%`}
              href={`/packages/${encodeURIComponent(topWeekly.name)}`}
            />
          ) : (
            <FooterMuted text='No downloads recorded this week yet.' />
          )
        }
      />

      <StatTile
        icon={GitBranch}
        label='Versions'
        value={versions.toLocaleString()}
        sub={`across ${pkgCount} packages`}
        accent='cyan'
        delay={2}
        delta={{
          value: `${avgVersions.toFixed(1)} avg`,
          direction: "flat",
          tooltip: "avg versions per package",
        }}
        sparkline={<Sparkline points={versionPoints} accent='cyan' />}
        footer={
          mostVersioned && mostVersioned.count > 0 ? (
            <LeaderRow
              label='Most released'
              name={mostVersioned.name}
              detail={`${mostVersioned.count} versions`}
              href={`/packages/${encodeURIComponent(mostVersioned.name)}`}
            />
          ) : null
        }
      />

      <StatTile
        icon={HardDrive}
        label='Total install size'
        value={formatBytes(totalSize)}
        sub={`avg ${formatBytes(avgSize)} per package`}
        accent='emerald'
        delay={3}
        delta={{
          value: `${pkgCount} pkgs`,
          direction: "flat",
          tooltip: "unpacked, latest versions",
        }}
        sparkline={<Sparkline points={sizePoints} accent='emerald' />}
        footer={
          largest && largest.size > 0 ? (
            <LeaderRow
              label='Largest'
              name={largest.name}
              detail={formatBytes(largest.size)}
              href={`/packages/${encodeURIComponent(largest.name)}`}
            />
          ) : null
        }
      />

      <StatTile
        icon={Activity}
        label='Daily activity'
        value={formatNumber(todayBucket?.downloads ?? 0)}
        sub={
          todayBucket
            ? `today · ${formatShortDate(todayBucket.day)}`
            : "no data yet"
        }
        accent='sky'
        delay={4}
        delta={
          todayBucket && avgDailyWeek > 0
            ? {
                value: `${todayDeltaPct >= 0 ? "+" : ""}${todayDeltaPct.toFixed(0)}%`,
                direction:
                  todayDeltaPct > 5 ? "up" : todayDeltaPct < -5 ? "down" : "flat",
                tooltip: "today vs 7-day avg",
              }
            : {
                value: `${releasesIn7d} releases / 7d`,
                direction: releasesIn7d > 0 ? "up" : "flat",
                tooltip: "packages updated this week",
              }
        }
        sparkline={
          dailyBuckets.length > 0 ? (
            <DailySparkline days={dailyBuckets} accent='sky' highlightLast />
          ) : null
        }
        footer={
          peakDay && peakDay.downloads > 0 ? (
            <LeaderRow
              label='Peak'
              name={formatShortDate(peakDay.day)}
              detail={`${formatNumber(peakDay.downloads)} DLs`}
              href='/packages'
            />
          ) : (
            <LeaderRow
              label='Cadence'
              name={`${releasesIn30d} of ${pkgCount} updated`}
              detail='30d'
              href='/packages'
            />
          )
        }
      />
    </div>
  );
}

type AccentKey = "violet" | "cyan" | "emerald" | "amber" | "sky";

const ACCENTS: Record<
  AccentKey,
  {
    ring: string;
    icon: string;
    glow: string;
    bar: string;
    barFrom: string;
    barTo: string;
  }
> = {
  violet: {
    ring: "ring-violet-500/20",
    icon: "text-violet-300 bg-violet-500/10",
    glow: "before:from-violet-500/20",
    bar: "from-violet-500 to-fuchsia-500",
    barFrom: "from-violet-500/30",
    barTo: "to-violet-300/90",
  },
  cyan: {
    ring: "ring-cyan-500/20",
    icon: "text-cyan-300 bg-cyan-500/10",
    glow: "before:from-cyan-500/20",
    bar: "from-cyan-400 to-sky-500",
    barFrom: "from-cyan-500/30",
    barTo: "to-cyan-300/90",
  },
  emerald: {
    ring: "ring-emerald-500/20",
    icon: "text-emerald-300 bg-emerald-500/10",
    glow: "before:from-emerald-500/20",
    bar: "from-emerald-400 to-teal-500",
    barFrom: "from-emerald-500/30",
    barTo: "to-emerald-300/90",
  },
  amber: {
    ring: "ring-amber-500/20",
    icon: "text-amber-300 bg-amber-500/10",
    glow: "before:from-amber-500/20",
    bar: "from-amber-400 to-orange-500",
    barFrom: "from-amber-500/30",
    barTo: "to-amber-300/90",
  },
  sky: {
    ring: "ring-sky-500/20",
    icon: "text-sky-300 bg-sky-500/10",
    glow: "before:from-sky-500/20",
    bar: "from-sky-400 to-indigo-500",
    barFrom: "from-sky-500/30",
    barTo: "to-sky-300/90",
  },
};

interface Delta {
  value: string;
  direction: "up" | "down" | "flat";
  tooltip?: string;
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  delay,
  delta,
  sparkline,
  footer,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  sub?: string;
  accent: AccentKey;
  delay: number;
  delta?: Delta;
  sparkline?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm p-4 sm:p-5 hover:bg-zinc-900/80 hover:-translate-y-0.5 transition-all duration-300 animate-fade-up delay-${delay} flex flex-col`}
    >
      <div
        className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${a.glow} before:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl`}
      />
      <div className='relative flex flex-col flex-1 gap-3'>
        {/* header */}
        <div className='flex items-start justify-between gap-2'>
          <span className='text-[10px] uppercase tracking-wider text-zinc-500'>
            {label}
          </span>
          <div className='flex items-center gap-1.5'>
            {delta && <DeltaChip delta={delta} />}
            <span
              className={`p-1.5 rounded-lg ring-1 ring-inset ${a.ring} ${a.icon}`}
            >
              <Icon className='w-3.5 h-3.5' />
            </span>
          </div>
        </div>

        {/* value */}
        <div>
          <div className='text-2xl sm:text-3xl font-bold text-zinc-50 tabular-nums leading-none'>
            {value}
          </div>
          {sub && (
            <div className='text-[11px] text-zinc-500 mt-1.5 truncate' title={sub}>
              {sub}
            </div>
          )}
        </div>

        {/* sparkline */}
        {sparkline && <div className='mt-auto'>{sparkline}</div>}

        {/* footer with leader */}
        {footer && <div className='pt-2 border-t border-zinc-800/70'>{footer}</div>}
      </div>
    </div>
  );
}

function DeltaChip({ delta }: { delta: Delta }) {
  const colors =
    delta.direction === "up"
      ? "text-emerald-300 bg-emerald-500/10 ring-emerald-500/20"
      : delta.direction === "down"
        ? "text-rose-300 bg-rose-500/10 ring-rose-500/20"
        : "text-zinc-400 bg-zinc-500/10 ring-zinc-500/20";
  const Icon =
    delta.direction === "up"
      ? ArrowUp
      : delta.direction === "down"
        ? ArrowDown
        : Minus;
  return (
    <span
      title={delta.tooltip}
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ring-1 ring-inset text-[10px] font-medium tabular-nums ${colors}`}
    >
      <Icon className='w-2.5 h-2.5' />
      {delta.value}
    </span>
  );
}

function LeaderRow({
  label,
  name,
  detail,
  href,
}: {
  label: string;
  name: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className='group/lr flex items-center justify-between gap-2 text-[11px] hover:text-zinc-100 transition-colors'
    >
      <div className='min-w-0 flex items-center gap-1.5'>
        <span className='text-zinc-500 shrink-0'>{label}</span>
        <span className='text-zinc-200 font-medium truncate group-hover/lr:underline underline-offset-2 decoration-zinc-600'>
          {name}
        </span>
      </div>
      <span className='text-zinc-400 tabular-nums shrink-0'>{detail}</span>
    </Link>
  );
}

function FooterMuted({ text }: { text: string }) {
  return <div className='text-[11px] text-zinc-500 italic'>{text}</div>;
}

function Sparkline({
  points,
  accent = "violet",
}: {
  points: number[];
  accent?: AccentKey;
}) {
  const max = Math.max(...points, 0.001);
  const a = ACCENTS[accent];
  return (
    <div className='flex items-end gap-0.5 h-8' aria-hidden>
      {points.map((p, i) => {
        const pct = (p / max) * 100;
        if (pct < 0.5) {
          return (
            <div
              key={i}
              className='flex-1 h-px self-end bg-zinc-800/80 rounded-sm'
            />
          );
        }
        return (
          <div
            key={i}
            className={`flex-1 bg-gradient-to-t ${a.barFrom} via-transparent ${a.barTo} rounded-sm`}
            style={{ height: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}

/**
 * Interactive per-day sparkline. Each bar is hoverable and reveals a tooltip
 * with the date and that day's download count. Today's bar is optionally
 * highlighted with a ring.
 */
function DailySparkline({
  days,
  accent = "violet",
  highlightLast = false,
}: {
  days: DayBucket[];
  accent?: AccentKey;
  highlightLast?: boolean;
}) {
  const max = Math.max(...days.map((d) => d.downloads), 0.001);
  const a = ACCENTS[accent];
  return (
    <div className='flex items-end gap-1 h-10'>
      {days.map((d, i) => {
        const pct = (d.downloads / max) * 100;
        const isLast = i === days.length - 1;
        const dayLabel = new Date(d.day + "T00:00:00Z").toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        });
        return (
          <div
            key={d.day}
            className='group/bar relative flex-1 h-full flex items-end cursor-default'
          >
            {/* invisible hover surface for empty days */}
            <div className='absolute inset-0' />
            {pct < 0.5 ? (
              <div className='w-full h-px bg-zinc-800/80 rounded-sm' />
            ) : (
              <div
                className={`w-full bg-gradient-to-t ${a.barFrom} via-transparent ${a.barTo} rounded-[3px] transition-all duration-300 group-hover/bar:brightness-150 ${
                  highlightLast && isLast
                    ? `ring-1 ring-inset ${a.ring} shadow-lg`
                    : ""
                }`}
                style={{ height: `${Math.max(6, pct)}%` }}
              />
            )}

            {/* tooltip */}
            <div className='pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 rounded-md bg-zinc-950/95 border border-zinc-800 shadow-xl whitespace-nowrap text-center opacity-0 scale-95 group-hover/bar:opacity-100 group-hover/bar:scale-100 transition-all duration-150 z-20'>
              <div className='text-[11px] font-semibold text-zinc-100 tabular-nums'>
                {d.downloads.toLocaleString()}
              </div>
              <div className='text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5'>
                {dayLabel} · {formatShortDate(d.day)}
              </div>
              {/* arrow */}
              <div className='absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-800 rotate-45 -mt-1' />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Featured card ---------- */

function FeaturedCard({ pkg }: { pkg: PackageData }) {
  const latest = pkg.meta["dist-tags"]?.latest ?? "0.0.0";
  return (
    <Link
      to={`/packages/${encodeURIComponent(pkg.name)}`}
      className='group relative block overflow-hidden rounded-3xl gradient-border bg-zinc-900/50 backdrop-blur-sm p-5 sm:p-6 lg:p-8 hover:bg-zinc-900/80 transition-colors animate-fade-up delay-5'
    >
      <div className='absolute -top-20 -right-10 w-72 h-72 rounded-full bg-violet-600/15 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity' />
      <div className='relative grid sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 items-center'>
        <div className='flex items-center gap-3 sm:flex-col sm:items-start'>
          <div className='relative'>
            <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 grid place-items-center shadow-lg shadow-violet-500/30'>
              <Crown className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
            </div>
          </div>
          <div className='sm:hidden text-[10px] uppercase tracking-wider text-violet-300'>
            Top package
          </div>
        </div>

        <div className='min-w-0'>
          <div className='hidden sm:flex items-center gap-2 mb-1'>
            <Sparkles className='w-3.5 h-3.5 text-violet-300' />
            <span className='text-[10px] uppercase tracking-wider text-violet-300'>
              Top package
            </span>
          </div>
          <h2 className='text-xl sm:text-2xl font-bold text-zinc-50 truncate'>
            {pkg.name}
          </h2>
          <p className='text-sm text-zinc-400 line-clamp-2 mt-1'>
            {pkg.meta.description ?? "No description"}
          </p>
          <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500'>
            <span className='font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20'>
              v{latest}
            </span>
            <span className='flex items-center gap-1'>
              <Download className='w-3.5 h-3.5' />
              <span className='tabular-nums'>
                {formatNumber(pkg.weekly?.downloads)}
              </span>{" "}
              /wk
            </span>
            <span className='flex items-center gap-1'>
              <Calendar className='w-3.5 h-3.5' />
              {timeAgo(pkg.meta.time?.modified)}
            </span>
          </div>
        </div>

        <div className='hidden sm:flex items-center gap-1 text-sm text-zinc-400 group-hover:text-violet-300 transition-colors shrink-0'>
          View details
          <ArrowUpRight className='w-4 h-4 group-hover:rotate-45 transition-transform' />
        </div>
      </div>
    </Link>
  );
}

/* ---------- Top downloads chart ---------- */

function TopDownloadsChart({ packages }: { packages: PackageData[] }) {
  const max = packages[0]?.weekly?.downloads ?? 1;
  return (
    <div className='lg:col-span-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm p-5 sm:p-6 animate-fade-up delay-6'>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <div className='p-1.5 rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20'>
            <TrendingUp className='w-3.5 h-3.5' />
          </div>
          <h2 className='text-sm font-semibold text-zinc-100'>
            Top by weekly downloads
          </h2>
        </div>
        <Link to='/packages' className='text-xs text-zinc-500 hover:text-zinc-200'>
          All →
        </Link>
      </div>

      <ul className='space-y-3'>
        {packages.map((p, idx) => {
          const value = p.weekly?.downloads ?? 0;
          const pct = (value / max) * 100;
          const gradient = ACCENT_GRADIENTS[idx % ACCENT_GRADIENTS.length];
          return (
            <li key={p.name}>
              <Link
                to={`/packages/${encodeURIComponent(p.name)}`}
                className='block group/row'
              >
                <div className='flex items-center justify-between mb-1.5'>
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <span className='text-[10px] font-mono text-zinc-500 w-4 tabular-nums'>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className='text-sm text-zinc-200 truncate group-hover/row:text-white'>
                      {p.name}
                    </span>
                  </div>
                  <span className='text-xs font-mono text-zinc-400 tabular-nums shrink-0'>
                    {formatNumber(value)}
                  </span>
                </div>
                <div className='h-1.5 ml-6 rounded-full bg-zinc-800/80 overflow-hidden'>
                  <div
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 origin-left`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Activity timeline ---------- */

function RecentActivity({ packages }: { packages: PackageData[] }) {
  return (
    <div className='lg:col-span-2 rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm p-5 sm:p-6 animate-fade-up delay-7'>
      <div className='flex items-center gap-2 mb-5'>
        <div className='p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20'>
          <Activity className='w-3.5 h-3.5' />
        </div>
        <h2 className='text-sm font-semibold text-zinc-100'>Recent activity</h2>
      </div>

      <ol className='relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-gradient-to-b before:from-zinc-700 before:via-zinc-800 before:to-transparent'>
        {packages.map((p) => (
          <li key={p.name} className='relative pl-7'>
            <span className='absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-zinc-900 ring-2 ring-emerald-500/40 grid place-items-center'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
            </span>
            <Link
              to={`/packages/${encodeURIComponent(p.name)}`}
              className='block group/r'
            >
              <div className='flex items-center justify-between gap-2'>
                <span className='text-sm text-zinc-200 truncate group-hover/r:text-white'>
                  {p.name}
                </span>
                <span className='text-[11px] text-zinc-500 shrink-0 tabular-nums'>
                  {timeAgo(p.meta.time?.modified)}
                </span>
              </div>
              <span className='text-[11px] text-zinc-500 font-mono'>
                v{p.meta["dist-tags"]?.latest}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- License section ---------- */

function LicenseSection({
  licenses,
  total,
}: {
  licenses: Record<string, number>;
  total: number;
}) {
  const entries = Object.entries(licenses).sort((a, b) => b[1] - a[1]);
  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm p-5 sm:p-6 animate-fade-up delay-7'>
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <div className='p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/20'>
            <Scale className='w-3.5 h-3.5' />
          </div>
          <h2 className='text-sm font-semibold text-zinc-100'>
            License distribution
          </h2>
        </div>
        <span className='text-xs text-zinc-500'>{total} total</span>
      </div>

      <div className='space-y-3'>
        {entries.map(([lic, count], idx) => {
          const pct = (count / total) * 100;
          const gradient = ACCENT_GRADIENTS[idx % ACCENT_GRADIENTS.length];
          return (
            <div key={lic}>
              <div className='flex items-center justify-between mb-1.5'>
                <span className='text-sm text-zinc-200'>{lic}</span>
                <span className='text-xs text-zinc-500 tabular-nums'>
                  {count} ({pct.toFixed(0)}%)
                </span>
              </div>
              <div className='h-1.5 rounded-full bg-zinc-800/80 overflow-hidden'>
                <div
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Loading skeleton ---------- */

function LoadingState() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-48 sm:h-56 rounded-3xl' />
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-28 sm:h-32' />
        ))}
      </div>
      <Skeleton className='h-32 sm:h-40 rounded-3xl' />
      <div className='grid lg:grid-cols-5 gap-4 sm:gap-6'>
        <Skeleton className='lg:col-span-3 h-80' />
        <Skeleton className='lg:col-span-2 h-80' />
      </div>
    </div>
  );
}
