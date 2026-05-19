/** Org scanned for repos that may not yet match a published npm package name. */
export const GITHUB_ORG_UNPUBLISHED_SCAN = 'NPM-Packages-Modules'

/**
 * Top-level org repos that hold many packages in subfolders (not one npm package per repo).
 * See https://github.com/orgs/NPM-Packages-Modules/repositories — mern, react-native, flutter.
 */
export const GITHUB_ORG_MONOREPO_ROOTS = [
  'mern',
  'react-native',
  'flutter',
] as const

/** Dropped entirely from org stats (duplicate umbrella / meta repo). */
export const GITHUB_ORG_REPOS_IGNORELIST = ['all-packages'] as const

const MONOREPO_SLUG_SET = new Set(
  GITHUB_ORG_MONOREPO_ROOTS.map((s) => s.toLowerCase()),
)

const IGNORE_SLUG_SET = new Set(
  GITHUB_ORG_REPOS_IGNORELIST.map((s) => s.toLowerCase()),
)

function repoSlug(repoName: string): string {
  return repoName.toLowerCase().replace(/_/g, '-')
}

/** Whether this repo slug is an umbrella monorepo (excluded from “unpublished vs npm name” checks). */
export function isGithubOrgMonorepoRoot(repoName: string): boolean {
  return MONOREPO_SLUG_SET.has(repoSlug(repoName))
}

/** Whether this org repo is omitted from dashboard GitHub counts entirely. */
export function isGithubOrgRepoIgnored(repoName: string): boolean {
  return IGNORE_SLUG_SET.has(repoSlug(repoName))
}
