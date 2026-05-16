export interface NpmRegistryMeta {
  name: string
  description?: string
  'dist-tags': { latest: string; [tag: string]: string }
  versions: Record<string, NpmVersionMeta>
  time: { created: string; modified: string; [version: string]: string }
  homepage?: string
  repository?: { type?: string; url?: string }
  bugs?: { url?: string }
  license?: string
  keywords?: string[]
  maintainers?: { name: string; email?: string }[]
  author?: { name: string; email?: string } | string
  readme?: string
}

export interface NpmVersionMeta {
  name: string
  version: string
  description?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  dist?: {
    tarball?: string
    unpackedSize?: number
    shasum?: string
  }
}

export interface DownloadsPoint {
  downloads: number
  start: string
  end: string
  package: string
}

export interface DownloadsDay {
  downloads: number
  day: string // YYYY-MM-DD
}

export interface DownloadsRange {
  start: string
  end: string
  package: string
  downloads: DownloadsDay[]
}

export interface PackageData {
  name: string
  meta: NpmRegistryMeta
  weekly: DownloadsPoint | null
  monthly: DownloadsPoint | null
  daily: DownloadsRange | null
}
