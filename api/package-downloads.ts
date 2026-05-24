import type { VercelRequest, VercelResponse } from '@vercel/node'
import { aggregatePackageDownloads } from '../lib/npmAggregateDownloads'

/** Hobby can raise this cap to reduce 504 timeouts when many scoped packages need 4× downloads each. */
export const config = { maxDuration: 60 }

function coerceRequestBody(raw: unknown):
  | { ok: false; status: number; body: { error: string } }
  | { ok: true; parsed: unknown } {
  if (raw === undefined || raw === null) return { ok: true, parsed: {} }

  if (typeof raw === 'string') {
    try {
      const t = raw.trim()
      return { ok: true, parsed: t.length === 0 ? {} : JSON.parse(t) }
    } catch {
      return { ok: false, status: 400, body: { error: 'Invalid JSON body' } }
    }
  }

  if (typeof raw === 'object' && raw !== null && Buffer.isBuffer(raw)) {
    try {
      const t = raw.toString('utf8').trim()
      return { ok: true, parsed: t.length === 0 ? {} : JSON.parse(t) }
    } catch {
      return { ok: false, status: 400, body: { error: 'Invalid JSON body' } }
    }
  }

  return { ok: true, parsed: raw }
}

/** Never leak stack traces — log server-side, return `{ error }` JSON the client can read. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({
        error: 'Method not allowed (use POST with { "packages": string[] })',
      })
      return
    }

    const coerced = coerceRequestBody(req.body as unknown)
    if (!coerced.ok) {
      res.status(coerced.status).json(coerced.body)
      return
    }

    let agg: Awaited<ReturnType<typeof aggregatePackageDownloads>>
    try {
      agg = await aggregatePackageDownloads(coerced.parsed)
    } catch (err: unknown) {
      console.error(
        '[package-downloads]',
        err instanceof Error ? err.stack ?? err.message : err,
      )
      const isDev = process.env.VERCEL_ENV === 'development'
      const detail =
        isDev && err instanceof Error ? { detail: String(err.message).slice(0, 300) } : {}
      res.status(500).json({
        error: 'Failed to aggregate download stats — see Vercel function logs.',
        ...detail,
      })
      return
    }

    res.setHeader('Cache-Control', 'private, no-store')
    res.status(200).json(agg)
  } catch (err: unknown) {
    console.error(
      '[package-downloads-handler]',
      err instanceof Error ? err.stack ?? err.message : err,
    )
    try {
      if (!res.headersSent) res.status(500).json({ error: 'package-downloads failed' })
    } catch {
      /* ignore secondary failure */
    }
  }
}
