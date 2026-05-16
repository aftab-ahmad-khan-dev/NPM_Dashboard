import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
  value: string
  accent?: 'violet' | 'indigo' | 'cyan' | 'emerald' | 'amber'
  hint?: string
}

const accents: Record<NonNullable<Props['accent']>, string> = {
  violet: 'text-violet-400 bg-violet-500/10 ring-violet-500/20',
  indigo: 'text-indigo-400 bg-indigo-500/10 ring-indigo-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 ring-cyan-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
  amber: 'text-amber-400 bg-amber-500/10 ring-amber-500/20',
}

export function StatCard({ icon: Icon, label, value, accent = 'violet', hint }: Props) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4 sm:p-5 hover:bg-zinc-900/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">{label}</span>
        <span className={`p-1.5 rounded-lg ring-1 ring-inset ${accents[accent]}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="text-xl sm:text-2xl font-semibold text-zinc-50 tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-zinc-500 mt-1">{hint}</div>}
    </div>
  )
}
