const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add workspace packages to watchFolders
const workspaceRoot = path.resolve(__dirname, "../..");
config.watchFolders = [
  ...config.watchFolders || [],
  workspaceRoot,
];

// Handle symlinked packages
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Add WASM as an asset extension
config.resolver.assetExts.push("wasm");

// Support ESM modules (.mjs) and enable package exports
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];
config.resolver.unstable_enablePackageExports = true;

// Ensure proper resolution of workspace packages
config.resolver.extraNodeModules = {
  "@vlcn.io-community/crsqlite-wasm": path.resolve(workspaceRoot, "packages/crsqlite-wasm"),
  "@vlcn.io-community/rx-tbl": path.resolve(workspaceRoot, "packages/rx-tbl"),
  "@vlcn.io-community/xplat-api": path.resolve(workspaceRoot, "packages/xplat-api"),
};

// Transform import.meta.url to work with Metro
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("metro-react-native-babel-transformer"),
  // Transform the workspace packages
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;