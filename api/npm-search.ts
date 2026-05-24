import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sanitizeNpmSearchQuery } from '../lib/npmSearchValidate'

const UPSTREAM_SEARCH = 'https://registry.npmjs.org/-/v1/search'

const MAX_FETCH_ATTEMPTS = 8

/** Registry search can wait on Retry-After; keep within Hobby limit. */
export const config = { maxDuration: 30 }

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function retryAfterMs(res: Response): number | null {
  const raw = res.headers.get('Retry-After')
  if (!raw) return null
  const seconds = Number.parseInt(raw, 10)
  if (!Number.isNaN(seconds)) return seconds * 1000
  const when = Date.parse(raw)
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now())
  return null
}

function qsFromReqQuery(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams | null {
  const pairs: [string, string][] = []
  const push = (k: string, v: string | string[] | undefined) => {
    if (v === undefined) return
    pairs.push([k, Array.isArray(v) ? v[0] ?? '' : v])
  }
  push('text', raw.text)
  push('size', raw.size)
  push('from', raw.from)
  return sanitizeNpmSearchQuery(pairs)
}

async function upstreamSearchOnce(qs: URLSearchParams, attempt = 0): Promise<Response> {
  const url = `${UPSTREAM_SEARCH}?${qs.toString()}`
  const upstream = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })

  if (
    (upstream.status === 429 || upstream.status === 503) &&
    attempt < MAX_FETCH_ATTEMPTS - 1
  ) {
    const fromHeader = retryAfterMs(upstream)
    const backoff = Math.min(30_000, 600 * 2 ** attempt + attempt * 200)
    await sleep(Math.max(fromHeader ?? 0, backoff))
    return upstreamSearchOnce(qs, attempt + 1)
  }

  return upstream
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Use GET ?text=maintainer%3A…&size=&from=' })
    return
  }

  const qs = qsFromReqQuery(req.query as Record<string, string | string[] | undefined>)
  if (!qs) {
    res.status(400).json({ error: 'missing or invalid ?text=' })
    return
  }

  try {
    const upstream = await upstreamSearchOnce(qs)
    const body = await upstream.text()
    res.status(upstream.status)
    const ct =
      upstream.headers.get('content-type') ?? 'application/json; charset=utf-8'
    res.setHeader('Content-Type', ct)
    res.send(body)
  } catch (err: unknown) {
    console.error('[npm-search]', err instanceof Error ? err.stack ?? err.message : err)
    res.status(502).json({ error: 'Upstream registry search failed' })
  }
}
