import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Mirrors `lib/npmSearchValidate.ts` inline so Vercel always bundles without `lib/` tracing issues.
 */
function sanitizePairs(pairs: [string, string][]): URLSearchParams | null {
  const map = new Map<string, string>()
  for (const [k, v] of pairs) map.set(k, v)

  const text = (map.get('text') ?? '').trim()
  if (!text.length || text.length > 4096) return null
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) return null

  const qs = new URLSearchParams()
  qs.set('text', text)

  const rawSize = map.get('size')
  if (rawSize !== undefined && rawSize !== '') {
    const n = Number.parseInt(rawSize, 10)
    if (Number.isFinite(n)) qs.set('size', String(Math.min(Math.max(n, 1), 250)))
  }

  const rawFrom = map.get('from')
  if (rawFrom !== undefined && rawFrom !== '') {
    const n = Number.parseInt(rawFrom, 10)
    if (Number.isFinite(n)) qs.set('from', String(Math.min(Math.max(n, 0), 100_000)))
  }

  return qs
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
  return sanitizePairs(pairs)
}

const UPSTREAM_SEARCH = 'https://registry.npmjs.org/-/v1/search'

const MAX_FETCH_ATTEMPTS = 8

/** Registry search can wait on Retry-After; keep within Hobby limit. */
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
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Use GET ?text=maintainer%3A…&size=&from=' })
      return
    }

    const reqQuery =
      typeof req.query === 'object' && req.query !== null
        ? (req.query as Record<string, string | string[] | undefined>)
        : {}
    const qs = qsFromReqQuery(reqQuery)

    if (!qs) {
      res.status(400).json({ error: 'missing or invalid ?text=' })
      return
    }

    const upstream = await upstreamSearchOnce(qs)
    const body = await upstream.text()
    const ct =
      upstream.headers.get('content-type') ?? 'application/json; charset=utf-8'

    res.status(upstream.status)
    res.setHeader('Content-Type', ct)
    res.end(body)
  } catch (err: unknown) {
    console.error('[npm-search]', err instanceof Error ? err.stack ?? err.message : err)
    res.status(502).json({ error: 'npm search proxy failed' })
  }
}
