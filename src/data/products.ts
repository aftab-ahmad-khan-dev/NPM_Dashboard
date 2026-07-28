const PORTFOLIO = 'https://www.aftabahmadkhan.online'

export type ProductCategory = 'product' | 'open-source' | 'profile'

export type Product = {
  id: string
  name: string
  tagline: string
  description: string
  category: ProductCategory
  badge: string
  liveUrl?: string
  repoUrl?: string
  detailsUrl: string
  image: string
  imageAlt: string
  accent: string
  tags: string[]
  featured?: boolean
  internal?: boolean
}

export const PRODUCT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'product', label: 'Live products' },
  { id: 'open-source', label: 'Open source' },
  { id: 'profile', label: 'About' },
] as const

export const PRODUCTS: Product[] = [
  {
    id: 'npm-dashboard',
    name: 'npm Packages Dashboard',
    tagline: 'Open-source package hub',
    description:
      'Public dashboard for npm packages and modules — TypeScript tooling, AI infra helpers, and developer utilities.',
    category: 'open-source',
    badge: 'Current',
    liveUrl: '/',
    repoUrl: 'https://github.com/aftab-ahmad-khan-dev/NPM_Dashboard',
    detailsUrl: PORTFOLIO,
    image: '/products/npm-dashboard.jpg',
    imageAlt: 'npm Packages Dashboard overview',
    accent: '#CB3837',
    tags: ['npm', 'TypeScript', 'OSS'],
    featured: true,
    internal: true,
  },
  {
    id: 'pubdev',
    name: 'pub.dev packages',
    tagline: 'Flutter / Dart packages on pub.dev',
    description:
      'Open-source Flutter packages — app flow orchestration, localization kits, and tooling published on pub.dev.',
    category: 'open-source',
    badge: 'Open source',
    liveUrl: 'https://pub.dev/packages?q=app_flow_orchestrator+auto_localization_kit',
    detailsUrl: PORTFOLIO,
    image: '/products/pubdev-packages.jpg',
    imageAlt: 'pub.dev packages by Aftab Ahmad Khan',
    accent: '#0175C2',
    tags: ['Flutter', 'Dart', 'pub.dev'],
    featured: true,
  },
  {
    id: 'frameo',
    name: 'Frameo',
    tagline: 'Offline Loom-style screen recorder',
    description:
      'Desktop screen recording for macOS & Windows — local library, compress, and WhatsApp LICENSE upgrades. No Frameo cloud.',
    category: 'product',
    badge: 'Live',
    liveUrl: 'https://frameo-blond.vercel.app/',
    detailsUrl: PORTFOLIO,
    image: '/products/frameo-dashboard.jpg',
    imageAlt: 'Frameo home dashboard',
    accent: '#5B7CFA',
    tags: ['Electron', 'Desktop', 'Offline'],
    featured: true,
  },
  {
    id: 'vorkspro',
    name: 'VorksPro',
    tagline: 'All-in-one operations SaaS',
    description:
      'Projects, CRM, HR, payroll, finance, and role-based dashboards in one workspace — web, desktop, and mobile.',
    category: 'product',
    badge: 'Flagship',
    liveUrl: 'https://www.vorkspro.com/',
    detailsUrl: PORTFOLIO,
    image: '/products/vorkspro-dashboard.jpg',
    imageAlt: 'VorksPro operations platform',
    accent: '#4338CA',
    tags: ['SaaS', 'React', 'Node.js'],
    featured: true,
  },
  {
    id: 'publisher-suite',
    name: 'Publisher Suite',
    tagline: 'Schedule & publish everywhere',
    description:
      'Compose once and auto-publish to LinkedIn, Meta, Reddit, Pinterest, and Threads — plus email campaigns.',
    category: 'product',
    badge: 'Live',
    liveUrl: 'https://publisher-dashboard.vercel.app/',
    detailsUrl: PORTFOLIO,
    image: '/products/publisher-suite-dashboard.jpg',
    imageAlt: 'Publisher Suite overview',
    accent: '#0EA5E9',
    tags: ['Social', 'Dashboard', 'Scheduler'],
    featured: true,
  },
  {
    id: 'wareflow',
    name: 'Wareflow',
    tagline: 'Inventory, contacts, invoices & operations',
    description:
      'One platform for inventory (primary & secondary), contacts, services, expenses, and invoices. Optional barcode / QR scan at checkout — start free, no lock-in.',
    category: 'product',
    badge: 'Live',
    liveUrl: 'https://ware-flow-web.vercel.app/',
    detailsUrl: PORTFOLIO,
    image: '/products/wareflow-dashboard.jpg',
    imageAlt: 'Wareflow landing — inventory and operations platform',
    accent: '#064E3B',
    tags: ['Inventory', 'Invoices', 'Ops'],
    featured: true,
  },
  {
    id: 'code-crafters',
    name: 'Code Crafters',
    tagline: 'Free hands-on MERN roadmap',
    description:
      'Guided MERN learning tracks — JavaScript, React, Node, Express, and MongoDB — with progress tracking.',
    category: 'product',
    badge: 'Live',
    liveUrl: 'https://code-crafters.vercel.app/',
    detailsUrl: PORTFOLIO,
    image: '/products/code-crafters-dashboard.jpg',
    imageAlt: 'Code Crafters roadmap',
    accent: '#7C3AED',
    tags: ['Education', 'MERN', 'Roadmap'],
    featured: true,
  },
  {
    id: 'coded-by-aftab',
    name: '30 Days of JavaScript',
    tagline: 'coded by aftab — interactive JS lessons',
    description:
      'Day-by-day JavaScript practice with a live console, timeline, tips, and format/run tooling — from optional chaining through modern patterns.',
    category: 'product',
    badge: 'Live',
    liveUrl: 'https://coded-by-aftab.vercel.app/',
    detailsUrl: PORTFOLIO,
    image: '/products/coded-by-aftab.jpg',
    imageAlt: '30 Days of JavaScript interactive lesson console',
    accent: '#F7DF1E',
    tags: ['JavaScript', 'Education', 'Practice'],
    featured: true,
  },
  {
    id: 'ai-guardrails',
    name: 'AI Dev Guardrails',
    tagline: 'Rules & skills for AI coding agents',
    description:
      'Installable agent skills for Cursor, Claude, Copilot, and more — SRS, security scans, TDD, and review.',
    category: 'open-source',
    badge: 'Open source',
    liveUrl: 'https://github.com/aftab-ahmad-khan-dev/ai-dev-guardrails',
    repoUrl: 'https://github.com/aftab-ahmad-khan-dev/ai-dev-guardrails',
    detailsUrl: PORTFOLIO,
    image: '/products/ai-guardrails.jpg',
    imageAlt: 'AI Dev Guardrails skills and rules',
    accent: '#F59E0B',
    tags: ['AI', 'Cursor', 'Skills'],
    featured: true,
  },
  {
    id: 'portfolio',
    name: 'Aftab Ahmad Khan',
    tagline: 'Solo full-stack builder',
    description:
      '97+ shipped projects across SaaS, Shopify, AI automation, and mobile. Case studies and hire path.',
    category: 'profile',
    badge: 'Portfolio',
    liveUrl: PORTFOLIO,
    detailsUrl: PORTFOLIO,
    image: 'https://aftabahmadkhan.online/og-image.png',
    imageAlt: 'Aftab Ahmad Khan portfolio',
    accent: '#1E293B',
    tags: ['MERN', 'Shopify', 'AI'],
    featured: true,
  },
]
