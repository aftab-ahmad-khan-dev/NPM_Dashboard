/** Abort fetch if the server never responds (prevents infinite splash). */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  ms = 60_000,
): Promise<Response> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(input, { ...init, signal: ctrl.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(ms / 1000)}s`)
    }
    throw err
  } finally {
    window.clearTimeout(timer)
  }
}
