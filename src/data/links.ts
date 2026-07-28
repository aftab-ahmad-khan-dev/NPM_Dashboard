/** Professional + social links (aligned with portfolio / Frameo). */

export const PORTFOLIO = 'https://www.aftabahmadkhan.online/'
export const EMAIL = 'aftabahmadkhan.dev@gmail.com'
export const GITHUB_ORG = 'https://github.com/NPM-Packages-Modules'

export type SocialLink = {
  id: string
  label: string
  href: string
  handle?: string
  /** simple-icons slug when available */
  brand?: string
  brandColor?: string
  forceWhite?: boolean
}

export const SOCIALS: SocialLink[] = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    href: PORTFOLIO,
    handle: 'aftabahmadkhan.online',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/aftab-ahmad-khan-dev',
    handle: '@aftab-ahmad-khan-dev',
    brand: 'github',
    forceWhite: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aftab-ahmad-khan-193240333/',
    handle: 'aftab-ahmad-khan',
    brand: 'linkedin',
    brandColor: '0A66C2',
  },
  {
    id: 'npm',
    label: 'npm',
    href: 'https://www.npmjs.com/~mr-aftab-ahmad-khan',
    handle: '~mr-aftab-ahmad-khan',
    brand: 'npm',
    brandColor: 'CB3837',
  },
  {
    id: 'pubdev',
    label: 'pub.dev',
    href: 'https://pub.dev/packages?q=app_flow_orchestrator+auto_localization_kit',
    handle: 'Flutter packages',
    brand: 'dart',
    brandColor: '0175C2',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/aftab_khan_dev/',
    handle: '@aftab_khan_dev',
    brand: 'instagram',
    brandColor: 'E4405F',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=100051148587185',
    handle: 'Aftab Ahmad Khan',
    brand: 'facebook',
    brandColor: '1877F2',
  },
  {
    id: 'threads',
    label: 'Threads',
    href: 'https://www.threads.com/@aftab_khan_dev',
    handle: '@aftab_khan_dev',
    brand: 'threads',
    forceWhite: true,
  },
  {
    id: 'email',
    label: 'Email',
    href: `mailto:${EMAIL}`,
    handle: EMAIL,
  },
]

export const PRO_LINKS = [
  { id: 'org', label: 'GitHub org', href: GITHUB_ORG },
  { id: 'products', label: 'Products', href: '/products', internal: true },
  { id: 'pricing', label: 'Pricing', href: '/pricing', internal: true },
  { id: 'about', label: 'About me', href: '/about', internal: true },
] as const
