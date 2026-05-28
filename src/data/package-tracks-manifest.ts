/**
 * Package slugs from https://github.com/NPM-Packages-Modules/react-native (PACKAGES.md).
 * npm names are usually `@scope/<slug>` or unscoped `<slug>`.
 */
export const REACT_NATIVE_PACKAGE_SLUGS = new Set([
  'apidocsmith',
  'apiflowx',
  'authmesh',
  'cachepilot',
  'cronpilot',
  'datamorph',
  'deploysense',
  'envsyncer',
  'eventbridgex',
  'logmesh',
  'mongoforge',
  'querygenie',
  'retryflow',
  'routeforge',
  'schemashift',
  'secureflow',
  'servbridge',
  'servqueue',
  'socketmesh',
  'stacktracex',
])

/**
 * Folder slugs from https://github.com/NPM-Packages-Modules/flutter (PACKAGES.md).
 * These publish to pub.dev (Dart), not npm — used so filters/labels stay honest when 0 npm hits.
 */
export const FLUTTER_PACKAGE_SLUGS = new Set([
  'app-flow-orchestrator',
  'auto-localization-kit',
  'auto-state-sync',
  'flutter-api-weaver',
  'flutter-asset-sync',
  'flutter-build-shrinker',
  'flutter-clean-arch-bot',
  'flutter-db-scaffold',
  'flutter-device-lab',
  'flutter-env-forge',
  'flutter-firelink',
  'flutter-icon-smith',
  'flutter-monorepo-chief',
  'flutter-perf-doctor',
  'flutter-pub-cleaner',
  'flutter-release-pilot',
  'flutter-route-genius',
  'flutter-screen-forge',
  'flutter-state-smith',
  'flutter-super-table',
  'flutter-test-factory',
  'flutter-ui-cloner',
  'flutter-widget-map',
  'flutter-zero-setup',
  'motion-builder',
  'responsive-magic-ui',
  'secure-vault-lite',
  'smart-form-x',
  'smart-theme-engine',
  'widget-studio',
])

export function npmPackageBasename(packageName: string): string {
  const slash = packageName.lastIndexOf('/')
  const base = slash >= 0 ? packageName.slice(slash + 1) : packageName
  return base.toLowerCase().replace(/_/g, '-')
}
