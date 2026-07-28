import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useMeta } from '../hooks/useMeta'
import {
  BANK_ACCOUNTS,
  WHATSAPP_DISPLAY,
  whatsappUrlForPlan,
} from '../data/billing'

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    blurb: 'Browse packages, downloads, and stack metrics publicly.',
    features: [
      'Full public package dashboard',
      'Downloads & metadata views',
      'No signup required',
    ],
    cta: 'Use free',
    href: '/',
    external: false,
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$19.99',
    period: '/mo',
    blurb: 'Priority support and custom package / tooling help.',
    features: [
      'Everything in Free',
      'WhatsApp priority support',
      'Custom npm package guidance',
      'Bank-transfer activation',
    ],
    cta: 'WhatsApp Growth',
    href: whatsappUrlForPlan('Growth'),
    external: true,
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$39.99',
    period: '/mo',
    blurb: 'Dedicated builds, private tooling, and faster turnaround.',
    features: [
      'Everything in Growth',
      'Custom package / module builds',
      'Private tooling & reviews',
      'Faster activation support',
    ],
    cta: 'WhatsApp Pro',
    href: whatsappUrlForPlan('Pro'),
    external: true,
    highlight: false,
  },
] as const

function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='currentColor' aria-hidden>
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  )
}

export function Pricing() {
  const [copied, setCopied] = useState('')

  useMeta({
    title: 'Pricing — npm Packages Dashboard · Bank transfer + WhatsApp',
    description: `Free to start. Growth $19.99 and Pro $39.99 via JazzCash, UBL, NayaPay, or Meezan — send receipt on WhatsApp ${WHATSAPP_DISPLAY}.`,
    keywords: 'npm dashboard pricing, bank transfer, jazzcash, ubl, nayapay, meezan, whatsapp',
    canonical: 'https://npm-packages-modules.dev/pricing',
  })

  function copyText(id: string, value: string) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(id)
      window.setTimeout(() => setCopied(''), 1600)
    })
  }

  return (
    <div className='space-y-12'>
      <div className='mx-auto max-w-2xl text-center'>
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-violet-300'>Pricing</p>
        <h1 className='mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl'>
          Free to browse. Paid for priority builds.
        </h1>
        <p className='mt-3 text-sm leading-relaxed text-zinc-400'>
          Same payment flow as Frameo, VorksPro, and Publisher Suite — bank transfer, then WhatsApp{' '}
          {WHATSAPP_DISPLAY} with your receipt.
        </p>
      </div>

      <div className='grid gap-5 lg:grid-cols-3'>
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              tier.highlight
                ? 'border-violet-500/40 bg-violet-500/5'
                : 'border-zinc-800 bg-zinc-950/60'
            }`}
          >
            {tier.highlight ? (
              <span className='absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white'>
                Most popular
              </span>
            ) : null}
            <h2 className='text-lg font-semibold text-zinc-100'>{tier.name}</h2>
            <p className='mt-1 text-sm text-zinc-400'>{tier.blurb}</p>
            <p className='mt-4 text-3xl font-bold text-zinc-50'>
              {tier.price}
              {tier.period ? (
                <span className='text-base font-medium text-zinc-500'>{tier.period}</span>
              ) : null}
            </p>
            <ul className='mt-5 flex-1 space-y-2.5'>
              {tier.features.map((f) => (
                <li key={f} className='flex items-start gap-2 text-sm text-zinc-300'>
                  <Check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-400' />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              {...(tier.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tier.highlight
                  ? 'bg-[#25D366] text-white hover:brightness-105'
                  : 'border border-zinc-700 text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              {tier.external ? <WhatsAppIcon /> : null}
              {tier.cta}
            </a>
          </div>
        ))}
      </div>

      <section id='pay' className='space-y-6'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-xl font-semibold text-zinc-100 sm:text-2xl'>Pay by bank transfer</h2>
          <p className='mt-2 text-sm text-zinc-400'>
            Transfer, then send your receipt on WhatsApp {WHATSAPP_DISPLAY}. No card required.
          </p>
          <a
            href={whatsappUrlForPlan('Growth')}
            target='_blank'
            rel='noreferrer'
            className='mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(37,211,102,0.35)] hover:brightness-105'
          >
            <WhatsAppIcon /> WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>

        <div className='mx-auto grid max-w-4xl gap-3 sm:grid-cols-2'>
          {BANK_ACCOUNTS.map((acct) => (
            <div
              key={acct.id}
              className='rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4'
            >
              <p className='text-sm font-semibold text-zinc-100'>{acct.label}</p>
              <p className='mt-1 text-xs text-zinc-500'>Name: {acct.name}</p>
              <p className='text-xs text-zinc-500'>
                {acct.iban ? 'Account' : 'Number'}: {acct.number}
              </p>
              {acct.iban ? (
                <p className='break-all text-[11px] text-zinc-500'>IBAN: {acct.iban}</p>
              ) : null}
              {acct.branch ? (
                <p className='text-[11px] text-zinc-500'>Branch: {acct.branch}</p>
              ) : null}
              <div className='mt-3 flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => copyText(acct.id, acct.number)}
                  className='inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-900'
                >
                  <Copy className='h-3 w-3' /> {copied === acct.id ? 'Copied' : 'Copy number'}
                </button>
                {acct.iban ? (
                  <button
                    type='button'
                    onClick={() => copyText(`${acct.id}-iban`, acct.iban!)}
                    className='inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-900'
                  >
                    <Copy className='h-3 w-3' />{' '}
                    {copied === `${acct.id}-iban` ? 'Copied' : 'Copy IBAN'}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
