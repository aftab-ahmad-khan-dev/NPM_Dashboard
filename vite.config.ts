import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { aggregatePackageDownloads } from './lib/npmAggregateDownloads'

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

function packageDownloadsApiPlugin(): Plugin {
  return {
    name: 'package-downloads-post-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathOnly = req.url?.split('?')[0]

        if (req.method !== 'POST' || pathOnly !== '/api/package-downloads') {
          next()
          return
        }

        const r = res as ServerResponse
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
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), packageDownloadsApiPlugin()],
})
