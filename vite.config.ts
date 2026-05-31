import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { aggregatePackageDownloads } from './lib/npmAggregateDownloads'
import { aggregatePubPackages } from './lib/pubPackagesFetch'
import { sanitizeNpmSearchQuery } from './lib/npmSearchValidate'

function collectBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (d) =>
      chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(typeof d === 'string' ? d : new Uint8Array(d))),
    )
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function devDashboardApiPlugin(): Plugin {
  return {
    name: 'dashboard-dev-api-proxies',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? ''
        const pathOnly = rawUrl.split('?')[0]
        const r = res as ServerResponse

        if (req.method === 'GET' && pathOnly === '/api/npm-search') {
          const url = new URL(rawUrl, 'http://vite.localhost')
          const qp = sanitizeNpmSearchQuery(Array.from(url.searchParams.entries()))
          if (!qp) {
            r.statusCode = 400
            r.setHeader('Content-Type', 'application/json; charset=utf-8')
            r.end(JSON.stringify({ error: 'missing or invalid ?text=' }))
            return
          }
          try {
            const upstream = await fetch(
              `https://registry.npmjs.org/-/v1/search?${qp}`,
              {
                headers: { Accept: 'application/json' },
              },
            )
            const body = await upstream.text()
            const ct =
              upstream.headers.get('content-type') ?? 'application/json; charset=utf-8'
            r.statusCode = upstream.status
            r.setHeader('Content-Type', ct)
            r.end(body)
          } catch {
            r.statusCode = 502
            r.setHeader('Content-Type', 'application/json; charset=utf-8')
            r.end(JSON.stringify({ error: 'Upstream registry search failed' }))
          }
          return
        }

        if (req.method === 'POST' && pathOnly === '/api/package-downloads') {
          try {
            const raw = await collectBody(req)
            let body: unknown = {}
            if (raw.trim().length) {
              try {
                body = JSON.parse(raw) as unknown
              } catch {
                r.statusCode = 400
                r.setHeader('Content-Type', 'application/json; charset=utf-8')
                r.end(JSON.stringify({ error: 'Invalid JSON body' }))
                return
              }
            }
            const agg = await aggregatePackageDownloads(body)
            r.statusCode = 200
            r.setHeader('Content-Type', 'application/json; charset=utf-8')
            r.end(JSON.stringify(agg))
          } catch {
            r.statusCode = 500
            r.setHeader('Content-Type', 'application/json; charset=utf-8')
            r.end(JSON.stringify({ error: 'Failed to aggregate download stats' }))
          }
          return
        }

        if (req.method === 'POST' && pathOnly === '/api/pub-packages') {
          try {
            const raw = await collectBody(req)
            let body: unknown = {}
            if (raw.trim().length) {
              try {
                body = JSON.parse(raw) as unknown
              } catch {
                r.statusCode = 400
                r.setHeader('Content-Type', 'application/json; charset=utf-8')
                r.end(JSON.stringify({ error: 'Invalid JSON body' }))
                return
              }
            }
            const agg = await aggregatePubPackages(body)
            r.statusCode = 200
            r.setHeader('Content-Type', 'application/json; charset=utf-8')
            r.end(JSON.stringify(agg))
          } catch {
            r.statusCode = 500
            r.setHeader('Content-Type', 'application/json; charset=utf-8')
            r.end(JSON.stringify({ error: 'Failed to load pub.dev packages' }))
          }
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devDashboardApiPlugin()],
})
