const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Watch the monorepo root but let Metro resolve symlinks naturally.
const workspaceRoot = path.resolve(__dirname, '../..')
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot]

// Prefer symlinks over manual nodeModulesPaths/extraNodeModules.
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: true,
}

// Keep WASM as an asset (ok if already present).
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm')
}

// ✅ Treat ESM files correctly so import.meta is valid
for (const ext of ['mjs', 'cjs']) {
  if (!config.resolver.sourceExts.includes(ext)) {
    config.resolver.sourceExts.push(ext)
  }
}

// Use Expo defaults for transforms; don't force alt transformer.
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
}

module.exports = config