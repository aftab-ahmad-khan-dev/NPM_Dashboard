import type { VercelRequest, VercelResponse } from '@vercel/node'

const UPSTREAM = 'https://registry.npmjs.org/'

const MAX_FETCH_ATTEMPTS = 8
/** npm search often lists packages minutes before registry GET metadata exists. */
const MAX_NOT_FOUND_ATTEMPTS = 4
const NOT_FOUND_BACKOFF_MS = [2500, 4000, 8000]

export const config = { maxDuration: 30 }

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function retryAfterMs(res: Response): number | null {
  const ra = res.headers.get('Retry-After')
  if (!ra) return null
  const seconds = Number.parseInt(ra, 10)
  if (!Number.isNaN(seconds)) return seconds * 1000
  const when = Date.parse(ra)
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now())
  return null
}

function isLikelyPackageName(name: string): boolean {
  if (!name.length || name.length > 214 || name.includes('..')) return false
  if (name.includes('\\')) return false
  if (name.startsWith('@'))
    return /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i.test(name)
  return /^[a-z0-9][a-z0-9._-]*$/i.test(name)
}

function packageFromQuery(
  raw: Record<string, string | string[] | undefined>,
): string | null {
  const q = raw.package ?? raw.name
  const enc = Array.isArray(q) ? q[0] : q
  if (typeof enc !== 'string' || !enc.trim()) return null
  try {
    const decoded = decodeURIComponent(enc.trim())
    return isLikelyPackageName(decoded) ? decoded : null
  } catch {
    return null
  }
}

async function upstreamMetaOnce(pkg: string, attempt = 0): Promise<Response> {
  const url = UPSTREAM + encodeURIComponent(pkg)
  const upstream = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })

  if (
    upstream.status === 404 &&
    attempt < MAX_NOT_FOUND_ATTEMPTS - 1
  ) {
    await sleep(NOT_FOUND_BACKOFF_MS[attempt] ?? 8000)
    return upstreamMetaOnce(pkg, attempt + 1)
  }

  if (
    (upstream.status === 429 || upstream.status === 503) &&
    attempt < MAX_FETCH_ATTEMPTS - 1
  ) {
    const fromHeader = retryAfterMs(upstream)
    const backoff = Math.min(30_000, 600 * 2 ** attempt + attempt * 200)
    await sleep(Math.max(fromHeader ?? 0, backoff))
    return upstreamMetaOnce(pkg, attempt + 1)
  }

  return upstream
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Use GET ?package=@scope%2Fname' })
      return
    }

    const pkg = packageFromQuery(req.query as Record<string, string | string[] | undefined>)
    if (!pkg) {
      res.status(400).json({ error: 'missing or invalid ?package=' })
      return
    }

    const upstream = await upstreamMetaOnce(pkg)
    if (upstream.status === 404) {
      res.status(200).json({ _missing: true, name: pkg })
      return
    }

    const body = await upstream.text()
    const ct =
      upstream.headers.get('content-type') ?? 'application/json; charset=utf-8'
    res.status(upstream.status)
    res.setHeader('Content-Type', ct)
    res.end(body)
  } catch (err: unknown) {
    console.error('[npm-registry]', err instanceof Error ? err.stack ?? err.message : err)
    if (!res.headersSent) {
      res.status(502).json({ error: 'Upstream registry fetch failed' })
    }
  }
}
