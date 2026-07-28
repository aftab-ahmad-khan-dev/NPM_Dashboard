import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Boxes,
  Download,
  Globe,
  LayoutDashboard,
  Mail,
  Package,
  Sparkles,
} from 'lucide-react'
import { useMeta } from '../hooks/useMeta'
import { BrandIcon } from '../components/BrandIcon'
import { usePackages } from '../context/PackagesContext'
import { formatNumber } from '../lib/format'
import { weeklyDownloadsFromPackage } from '../lib/downloads-stats'
import { PORTFOLIO, PRO_LINKS, SOCIALS } from '../data/links'
import { SiteFooter } from '../components/SiteFooter'
import { WhatsAppFab } from '../components/WhatsAppFab'

export function Home() {
  const { packages, loading } = usePackages()
  const pkgCount = packages.length
  const weeklyTotal = packages.reduce((acc, p) => acc + weeklyDownloadsFromPackage(p), 0)

  useMeta({
    title:
      'npm Packages Dashboard — Open-Source Hub by Aftab Ahmad Khan · MERN · React Native · Flutter',
    description:
      pkgCount > 0
        ? `Live hub for ${pkgCount} open-source npm & pub.dev packages by Aftab Ahmad Khan — downloads, versions, and stack metrics. Enter the overview to explore TypeScript tooling and Flutter packages.`
        : 'Live hub for open-source npm & pub.dev packages by Aftab Ahmad Khan — downloads, versions, and stack metrics. Enter the overview to explore TypeScript tooling and Flutter packages.',
    keywords:
      'npm packages dashboard, aftab ahmad khan, open source, typescript, flutter, pub.dev, monodrift, picsmith, mcp-bootstrap',
    canonical: 'https://npm-packages-modules.dev/',
  })

  return (
    <div className='relative min-h-screen overflow-hidden'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(1100px 560px at 18% -10%, rgba(203, 56, 55, 0.16), transparent 55%), radial-gradient(900px 500px at 92% 8%, rgba(139, 92, 246, 0.14), transparent 50%), radial-gradient(700px 420px at 50% 110%, rgba(99, 102, 241, 0.10), transparent 55%)',
        }}
      />
      <div className='pointer-events-none absolute inset-0 grid-bg opacity-70' />

      <header className='relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8'>
        <div className='flex items-center gap-3'>
          <span className='flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-lg shadow-[#CB3837]/15'>
            <img src='/npm.svg' alt='' width={24} height={24} className='h-6 w-6' />
          </span>
          <div className='leading-tight'>
            <p className='text-sm font-semibold text-zinc-100'>NPM Hub</p>
            <p className='text-[10px] uppercase tracking-[0.14em] text-zinc-500'>
              MERN · RN · Flutter
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
          <a
            href={PORTFOLIO}
            target='_blank'
            rel='noreferrer'
            className='hidden items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 sm:inline-flex'
          >
            <Globe className='h-3.5 w-3.5' /> Portfolio
          </a>
          <Link
            to='/overview'
            className='inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3.5 py-1.5 text-xs font-semibold text-violet-200 ring-1 ring-inset ring-violet-500/30 transition hover:bg-violet-500/25'
          >
            Overview <ArrowRight className='h-3.5 w-3.5' />
          </Link>
        </div>
      </header>

      <main className='relative z-10 mx-auto flex max-w-6xl flex-col px-5 pb-16 pt-8 sm:px-8 sm:pt-14 lg:pt-20'>
        <div className='mx-auto max-w-3xl text-center'>
          <p className='animate-fade-up anim-stagger-0 inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/90 backdrop-blur'>
            <Sparkles className='h-3.5 w-3.5 text-[#CB3837]' />
            Open-source package hub
          </p>

          <h1 className='animate-fade-up anim-stagger-1 mt-6 font-semibold tracking-tight text-zinc-50'>
            <span className='block text-3xl sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]'>
              npm &amp; pub.dev packages
            </span>
            <span className='mt-2 block bg-gradient-to-r from-[#CB3837] via-violet-400 to-indigo-300 bg-clip-text text-3xl text-transparent sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]'>
              live in one dashboard
            </span>
          </h1>

          <p className='animate-fade-up anim-stagger-2 mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base'>
            Built by{' '}
            <a
              href={PORTFOLIO}
              target='_blank'
              rel='noreferrer'
              className='font-medium text-zinc-200 underline decoration-violet-500/40 underline-offset-4 transition hover:text-white'
            >
              Aftab Ahmad Khan
            </a>{' '}
            — senior full-stack engineer shipping TypeScript tooling, AI infra helpers, and Flutter
            packages. Track downloads, releases, and stack metrics without leaving this hub.
          </p>

          <div className='animate-fade-up anim-stagger-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Link
              to='/overview'
              className='group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#CB3837] to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(203,56,55,0.28)] transition hover:brightness-110 sm:w-auto'
            >
              <LayoutDashboard className='h-4 w-4' />
              Overview
              <ArrowRight className='h-4 w-4 transition group-hover:translate-x-0.5' />
            </Link>
            <Link
              to='/packages'
              className='inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-950/50 px-7 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur transition hover:border-zinc-600 hover:bg-zinc-900/80 sm:w-auto'
            >
              <Package className='h-4 w-4' />
              Browse packages
            </Link>
          </div>

          <div className='animate-fade-up anim-stagger-4 mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3'>
            {[
              {
                icon: Boxes,
                label: 'Packages',
                value: loading && !pkgCount ? '…' : formatNumber(pkgCount || 0),
              },
              {
                icon: Download,
                label: 'Weekly DL',
                value: loading && !weeklyTotal ? '…' : formatNumber(weeklyTotal),
              },
              {
                icon: Sparkles,
                label: 'Stacks',
                value: '3',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className='rounded-2xl border border-zinc-800/80 bg-zinc-950/50 px-3 py-3 backdrop-blur'
              >
                <stat.icon className='mx-auto h-3.5 w-3.5 text-violet-300/80' />
                <p className='mt-2 text-lg font-semibold tabular-nums text-zinc-100 sm:text-xl'>
                  {stat.value}
                </p>
                <p className='text-[10px] font-medium uppercase tracking-wider text-zinc-500'>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className='animate-fade-up anim-stagger-5 mx-auto mt-14 w-full max-w-4xl'>
          <p className='text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500'>
            Socials &amp; professional links
          </p>
          <div className='mt-4 flex flex-wrap items-center justify-center gap-2'>
            {SOCIALS.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target={s.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={s.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                className='group inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:text-zinc-100'
              >
                {s.id === 'email' || s.id === 'portfolio' ? (
                  s.id === 'email' ? (
                    <Mail className='h-3.5 w-3.5 text-zinc-400' />
                  ) : (
                    <Globe className='h-3.5 w-3.5 text-violet-300' />
                  )
                ) : s.brand ? (
                  <BrandIcon
                    slug={s.brand}
                    color={s.brandColor}
                    forceWhite={s.forceWhite}
                    size={14}
                    alt={s.label}
                  />
                ) : (
                  <Globe className='h-3.5 w-3.5 text-zinc-400' />
                )}
                <span>{s.label}</span>
                {s.handle ? (
                  <span className='hidden text-zinc-600 group-hover:text-zinc-500 sm:inline'>
                    {s.handle}
                  </span>
                ) : null}
              </a>
            ))}
          </div>

          <div className='mt-5 flex flex-wrap items-center justify-center gap-2'>
            {PRO_LINKS.map((link) =>
              'internal' in link && link.internal ? (
                <Link
                  key={link.id}
                  to={link.href}
                  className='rounded-lg border border-zinc-800/80 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200'
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.id}
                  href={link.href}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-lg border border-zinc-800/80 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200'
                >
                  {link.label}
                </a>
              ),
            )}
          </div>
        </section>

        <p className='animate-fade-up anim-stagger-6 mt-12 text-center text-[11px] text-zinc-600'>
          Public npm &amp; pub.dev data · no private credentials · Multan, Pakistan
        </p>
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  )
}
