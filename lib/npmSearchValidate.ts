/** Shared validation for npm `/-/v1/search` forwarding (browser → /api/npm-search → registry).
 * Keep validator logic aligned with duplicate in `api/npm-search.ts`. */

export function sanitizeNpmSearchQuery(
  entries: Iterable<[string, string]>,
): URLSearchParams | null {
  const map = new Map<string, string>()
  for (const [k, v] of entries) {
    map.set(k, v)
  }

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
