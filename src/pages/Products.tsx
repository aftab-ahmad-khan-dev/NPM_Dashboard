import { useMemo, useState } from 'react'
import { ArrowUpRight, ExternalLink, Github, LayoutGrid } from 'lucide-react'
import { useMeta } from '../hooks/useMeta'
import { PRODUCT_FILTERS, PRODUCTS, type Product } from '../data/products'

function ProductCover({ product }: { product: Product }) {
  const [broken, setBroken] = useState(!product.image)
  if (broken) {
    return (
      <div
        className='absolute inset-0 flex items-center justify-center'
        style={{ background: `linear-gradient(135deg, ${product.accent}33, #18181b)` }}
      >
        <span className='text-sm font-semibold text-zinc-200'>{product.name}</span>
      </div>
    )
  }
  return (
    <img
      src={product.image}
      alt={product.imageAlt}
      className='absolute inset-0 h-full w-full object-cover object-top'
      loading='lazy'
      onError={() => setBroken(true)}
    />
  )
}

function ProductCard({ product }: { product: Product }) {
  const primary = product.liveUrl || product.repoUrl || product.detailsUrl
  const isExternal = Boolean(primary && !primary.startsWith('/'))

  return (
    <article className='group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 transition hover:border-zinc-700'>
      <div className='relative aspect-[16/10] overflow-hidden bg-zinc-900'>
        <ProductCover product={product} />
        <span className='absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur'>
          {product.badge}
        </span>
      </div>
      <div className='flex flex-1 flex-col p-4 sm:p-5'>
        <h2 className='text-base font-semibold text-zinc-100'>{product.name}</h2>
        <p className='mt-1 text-sm text-zinc-400'>{product.tagline}</p>
        <p className='mt-3 flex-1 text-sm leading-relaxed text-zinc-500'>{product.description}</p>
        <div className='mt-4 flex flex-wrap gap-1.5'>
          {product.tags.map((tag) => (
            <span
              key={tag}
              className='rounded-md border border-zinc-800 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400'
            >
              {tag}
            </span>
          ))}
        </div>
        <div className='mt-5 flex flex-wrap gap-2'>
          {product.liveUrl ? (
            <a
              href={product.liveUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              className='inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300 ring-1 ring-inset ring-violet-500/25 hover:bg-violet-500/25'
            >
              Open live <ExternalLink className='h-3 w-3' />
            </a>
          ) : null}
          {product.repoUrl ? (
            <a
              href={product.repoUrl}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900'
            >
              <Github className='h-3 w-3' /> GitHub
            </a>
          ) : null}
          <a
            href={product.detailsUrl}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900'
          >
            Portfolio <ArrowUpRight className='h-3 w-3' />
          </a>
        </div>
      </div>
    </article>
  )
}

export function Products() {
  const [filter, setFilter] = useState('all')

  useMeta({
    title: 'Products — npm Packages Dashboard · Frameo · VorksPro · Publisher Suite',
    description:
      'Browse live products and open-source tools from Aftab Ahmad Khan — Frameo, VorksPro, Publisher Suite, Code Crafters, and the npm Packages Dashboard.',
    keywords:
      'aftab ahmad khan products, frameo, vorkspro, publisher suite, npm dashboard, code crafters',
    canonical: 'https://npm-packages-modules.dev/products',
  })

  const filtered = useMemo(() => {
    if (filter === 'all') return PRODUCTS
    return PRODUCTS.filter((p) => p.category === filter)
  }, [filter])

  return (
    <div className='space-y-8'>
      <div className='max-w-2xl'>
        <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-300'>
          <LayoutGrid className='h-3.5 w-3.5' /> Products
        </p>
        <h1 className='mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl'>
          Built products & open source
        </h1>
        <p className='mt-2 text-sm leading-relaxed text-zinc-400'>
          Same catalog as Frameo and VorksPro — live SaaS, desktop tools, and npm packages from one
          builder.
        </p>
      </div>

      <div className='flex flex-wrap gap-2'>
        {PRODUCT_FILTERS.map((f) => (
          <button
            key={f.id}
            type='button'
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f.id
                ? 'bg-violet-500/20 text-violet-200 ring-1 ring-inset ring-violet-500/30'
                : 'border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
