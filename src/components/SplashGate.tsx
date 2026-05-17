import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePackages } from '../context/PackagesContext'

const MIN_SPLASH_MS = 850
const FADE_MS = 480

/** Full-screen splash on first load; does not reappear when refreshing package data in-app. */
export function SplashGate({ children }: { children: ReactNode }) {
  const { loading } = usePackages()
  const startedAt = useRef(Date.now())
  const dismissScheduledRef = useRef(false)
  const [phase, setPhase] = useState<'on' | 'fade' | 'off'>('on')

  useEffect(() => {
    if (loading) return
    if (dismissScheduledRef.current) return
    dismissScheduledRef.current = true
    const elapsed = Date.now() - startedAt.current
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed)
    const t = window.setTimeout(() => setPhase('fade'), wait)
    return () => {
      window.clearTimeout(t)
      dismissScheduledRef.current = false
    }
  }, [loading])

  useEffect(() => {
    if (phase !== 'fade') return
    const t = window.setTimeout(() => setPhase('off'), FADE_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  return (
    <>
      {children}
      {phase !== 'off' ? (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-zinc-950 px-6 transition-opacity ease-out ${
            phase === 'fade' ? 'opacity-0 duration-[480ms] pointer-events-none' : 'opacity-100 duration-300'
          }`}
          style={{
            background:
              'radial-gradient(1200px 600px at 50% -200px, rgba(203, 56, 55, 0.12), transparent 55%), radial-gradient(900px 500px at 50% 120%, rgba(99, 102, 241, 0.08), transparent 55%), #09090b',
          }}
          aria-hidden={phase === 'fade'}
        >
          <div className='relative flex h-20 w-20 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-xl shadow-black/40'>
            <img src='/npm.svg' alt='' className='h-11 w-11' width={44} height={44} />
          </div>
          <div className='text-center space-y-2 max-w-sm'>
            <p className='text-sm font-semibold tracking-tight text-zinc-100'>npm Packages Dashboard</p>
            <p className='text-xs text-zinc-500'>Loading registry data…</p>
          </div>
          <div className='h-1 w-36 overflow-hidden rounded-full bg-zinc-800'>
            <div className='h-full w-2/5 rounded-full bg-gradient-to-r from-[#CB3837] to-violet-500 animate-pulse' />
          </div>
        </div>
      ) : null}
    </>
  )
}
