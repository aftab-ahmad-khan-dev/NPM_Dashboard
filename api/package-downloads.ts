import type { VercelRequest, VercelResponse } from '@vercel/node'
import { aggregatePackageDownloads } from '../src/lib/npmAggregateDownloads'

/** Hobby can raise this cap to reduce 504 timeouts when many scoped packages need 4× downloads each. */
export const config = { maxDuration: 60 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed (use POST with { "packages": string[] })' })
    return
  }

  try {
    const agg = await aggregatePackageDownloads(req.body ?? {})
    res.setHeader('Cache-Control', 'private, no-store')
    res.status(200).json(agg)
  } catch {
    res.status(500).json({ error: 'Failed to aggregate download stats' })
  }
}
