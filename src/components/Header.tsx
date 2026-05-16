import { Menu, RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { usePackages } from '../context/PackagesContext'
import { timeAgo } from '../lib/format'

interface Props {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/packages': 'Packages',
  '/about': 'About Me',
}

export function Header({ onMenuClick }: Props) {
  const { refresh, lastUpdated, loading } = usePackages()
  const location = useLocation()
  const title =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith('/packages/')
      ? decodeURIComponent(location.pathname.replace('/packages/', ''))
      : 'Dashboard')

  return (
    <header className="h-16 sticky top-0 z-30 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-base font-medium text-zinc-300 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Updated {timeAgo(lastUpdated)}
          </span>
        )}
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 disabled:opacity-40 transition-colors"
          aria-label="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  )
}
