import type { VercelRequest, VercelResponse } from '@vercel/node'
import { aggregatePubPackages } from '../lib/pubPackagesFetch'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST with { "packages": string[] }' })
      return
    }

    const coerced = coerceRequestBody(req.body as unknown)
    if (!coerced.ok) {
      res.status(coerced.status).json(coerced.body)
      return
    }

    const agg = await aggregatePubPackages(coerced.parsed)
    res.setHeader('Cache-Control', 'private, max-age=120')
    res.status(200).json(agg)
  } catch (err: unknown) {
    console.error('[pub-packages]', err instanceof Error ? err.stack ?? err.message : err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to load pub.dev packages' })
    }
  }
}
