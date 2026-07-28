import { SOCIALS } from '../data/links'
import { WHATSAPP_DISPLAY, whatsappSupportUrl } from '../data/billing'
import { WhatsAppIcon } from './WhatsAppFab'

export function SiteFooter() {
  return (
    <footer className='mt-auto border-t border-zinc-900 bg-zinc-950/80 px-4 py-10 sm:px-6 lg:px-8'>
      <div className='mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:justify-between'>
        <div className='max-w-sm'>
          <p className='text-sm font-semibold text-zinc-100'>npm Packages Dashboard</p>
          <p className='mt-2 text-sm leading-relaxed text-zinc-500'>
            Open-source hub by Aftab Ahmad Khan — npm, pub.dev, and live package metrics.
          </p>
          <a
            href={whatsappSupportUrl()}
            target='_blank'
            rel='noreferrer'
            className='mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300'
          >
            <WhatsAppIcon size={16} /> WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500'>
            Socials &amp; links
          </p>
          <div className='mt-3 flex flex-wrap gap-2'>
            {SOCIALS.map((s) => {
              const external = !s.href.startsWith('mailto:')
              return (
                <a
                  key={s.id}
                  href={s.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className='inline-flex items-center rounded-full border border-zinc-800 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:border-violet-500/40 hover:text-zinc-200'
                >
                  {s.label}
                </a>
              )
            })}
          </div>
        </div>
      </div>
      <p className='mx-auto mt-8 max-w-6xl text-xs text-zinc-600'>
        © {new Date().getFullYear()} Aftab Ahmad Khan · Public npm &amp; pub.dev data
      </p>
    </footer>
  )
}
