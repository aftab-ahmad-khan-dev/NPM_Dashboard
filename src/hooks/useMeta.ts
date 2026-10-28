import { useEffect } from 'react'

interface MetaOptions {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
}

const DEFAULT_TITLE =
  'Aftab Ahmad Khan — Senior MERN, React Native & Flutter Developer · npm Author'
const DEFAULT_DESCRIPTION =
  'Aftab Ahmad Khan — Senior Full-Stack Engineer (7+ yrs, 75+ projects). MERN platforms, React Native & Flutter apps, AI-enhanced products and open-source npm packages.'

function setMeta(name: string, value: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function useMeta({ title, description, keywords, canonical }: MetaOptions) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, 'property')
      setMeta('twitter:description', description)
    }
    if (keywords) setMeta('keywords', keywords)
    if (title) {
      setMeta('og:title', title, 'property')
      setMeta('twitter:title', title)
    }
    if (canonical) {
      setLink('canonical', canonical)
      setMeta('og:url', canonical, 'property')
      setMeta('twitter:url', canonical)
    }
    return () => {
      document.title = prevTitle || DEFAULT_TITLE
      setMeta('description', DEFAULT_DESCRIPTION)
    }
  }, [title, description, keywords, canonical])
}
