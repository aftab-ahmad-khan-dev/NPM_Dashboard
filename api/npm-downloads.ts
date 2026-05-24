import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Only forward api.npmjs.org /downloads paths (CORS-safe for the browser). */
function isAllowedDownloadsSubpath(p: string): boolean {
  if (p.length > 8192 || p.includes('..')) return false
  if (!p.startsWith('point/') && !p.startsWith('range/')) return false
  return /^point\/last-(?:day|week|month)\/.+$/s.test(p) || /^range\/last-(?:day|week|month)\/.+$/s.test(p)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const raw = req.query.p
  const enc = Array.isArray(raw) ? raw[0] : raw
  if (typeof enc !== 'string' || !enc) {
    res.status(400).json({ error: 'missing p' })
    return
  }

  let decoded: string
  try {
    decoded = decodeURIComponent(enc)
  } catch {
    res.status(400).json({ error: 'bad p' })
    return
  }

  if (!isAllowedDownloadsSubpath(decoded)) {
    res.status(400).json({ error: 'invalid path' })
    return
  }

  const upstream = `https://api.npmjs.org/downloads/${decoded}`
  let upstreamRes: Response
  try {
    upstreamRes = await fetch(upstream, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch {
    res.status(502).json({ error: 'upstream fetch failed' })
    return
  }

  const ct = upstreamRes.headers.get('content-type') ?? 'application/json'
  const body = await upstreamRes.text()
  res.status(upstreamRes.status)
  res.setHeader('Content-Type', ct)
  res.send(body)
}
