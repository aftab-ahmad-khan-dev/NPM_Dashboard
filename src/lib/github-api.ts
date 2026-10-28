export interface OrgRepo {
  name: string
  html_url: string
  stargazers_count: number
  fork: boolean
  archived: boolean
}

/** Public repos for an org (paginated). Unauthenticated: GitHub rate limits apply. */
export async function fetchOrgPublicRepos(org: string): Promise<OrgRepo[]> {
  const out: OrgRepo[] = []
  let page = 1
  for (;;) {
    const qs = new URLSearchParams({
      per_page: '100',
      page: String(page),
      type: 'public',
      sort: 'pushed',
    })
    const res = await fetch(`https://api.github.com/orgs/${encodeURIComponent(org)}/repos?${qs}`, {
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status} for org ${org}`)
    }
    const data = (await res.json()) as unknown
    if (!Array.isArray(data) || data.length === 0) break
    for (const raw of data) {
      const r = raw as Record<string, unknown>
      out.push({
        name: String(r.name ?? ''),
        html_url: String(r.html_url ?? `https://github.com/${org}/${r.name}`),
        stargazers_count: Number(r.stargazers_count ?? 0),
        fork: Boolean(r.fork),
        archived: Boolean(r.archived),
      })
    }
    if (data.length < 100) break
    page += 1
  }
  return out
}

/** Lowercased npm identifiers: full name + unscoped basename for `@scope/pkg`. */
export function publishedNameLookup(packages: { name: string }[]): Set<string> {
  const s = new Set<string>()
  for (const p of packages) {
    const n = p.name.toLowerCase()
    s.add(n)
    const i = n.lastIndexOf('/')
    if (i >= 0) s.add(n.slice(i + 1))
  }
  return s
}

/** Repos that are not forks/archived and whose name does not match any published package slug. */
export function unpublishedPublicRepos(repos: OrgRepo[], published: Set<string>): OrgRepo[] {
  return repos.filter((r) => {
    if (r.fork || r.archived) return false
    const slug = r.name.toLowerCase().replace(/_/g, '-')
    return !published.has(slug)
  })
}
