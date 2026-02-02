# Configuration System

Vite's configuration system provides type-safe configuration with support for multiple formats (TypeScript, JavaScript, JSON) and programmatic configuration resolution. It includes helper functions for defining, loading, and resolving configurations.

## Capabilities

### Define Configuration

Type helper for defining Vite configuration with full TypeScript support.

```typescript { .api }
/**
 * Type-safe helper for defining Vite configuration
 * Accepts configuration object or function returning configuration
 * @param config - Configuration object, promise, or function
 * @returns The same config (identity function for type inference)
 */
function defineConfig(config: UserConfig): UserConfig;
function defineConfig(config: Promise<UserConfig>): Promise<UserConfig>;
function defineConfig(config: UserConfigFn): UserConfigFn;
function defineConfig(config: UserConfigExport): UserConfigExport;
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

// Object configuration
export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist'
  }
});

// Function configuration
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      // dev-specific config
      server: { port: 3000 }
    };
  } else {
    return {
      // build-specific config
      build: { minify: 'terser' }
    };
  }
});

// Async configuration
export default defineConfig(async ({ command, mode }) => {
  const data = await loadSomeData();
  return {
    // config using loaded data
    define: { __DATA__: JSON.stringify(data) }
  };
});
```

### Load Configuration from File

Loads and resolves configuration from a file with dependency tracking.

```typescript { .api }
/**
 * Load configuration from a file
 * @param configEnv - Configuration environment context
 * @param configFile - Path to config file (optional, auto-detected if not provided)
 * @param configRoot - Root directory for config resolution
 * @param logLevel - Logging level
 * @param customLogger - Custom logger instance
 * @param configLoader - Loader type ('bundle' | 'runner' | 'native')
 * @returns Promise resolving to loaded config or null if not found
 */
function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot?: string,
  logLevel?: LogLevel,
  customLogger?: Logger,
  configLoader?: 'bundle' | 'runner' | 'native'
): Promise<{
  path: string;
  config: UserConfig;
  dependencies: string[];
} | null>;
```

**Usage Example:**

```typescript
import { loadConfigFromFile } from 'vite';

// Load config with auto-detection
const result = await loadConfigFromFile(
  { command: 'build', mode: 'production' },
  undefined, // auto-detect vite.config.*
  process.cwd()
);

if (result) {
  console.log('Config path:', result.path);
  console.log('Config:', result.config);
  console.log('Dependencies:', result.dependencies);
}

// Load specific config file
const result = await loadConfigFromFile(
  { command: 'serve', mode: 'development' },
  './config/vite.custom.ts',
  process.cwd(),
  'info'
);
```

### Resolve Configuration

Resolves the complete Vite configuration by merging defaults, config file, inline config, and applying plugins.

```typescript { .api }
/**
 * Resolve the full Vite configuration
 * @param inlineConfig - Inline configuration to merge
 * @param command - Command being run ('build' | 'serve')
 * @param defaultMode - Default mode if not specified
 * @param defaultNodeEnv - Default NODE_ENV if not specified
 * @param isPreview - Whether this is preview mode
 * @returns Promise resolving to fully resolved configuration
 */
function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode?: string,
  defaultNodeEnv?: string,
  isPreview?: boolean
): Promise<ResolvedConfig>;
```

**Usage Example:**

```typescript
import { resolveConfig } from 'vite';

// Resolve config for build
const config = await resolveConfig(
  { root: process.cwd() },
  'build',
  'production'
);

console.log('Root:', config.root);
console.log('Build outDir:', config.build.outDir);
console.log('Plugins:', config.plugins.length);

// Resolve with inline overrides
const config = await resolveConfig(
  {
    root: process.cwd(),
    build: {
      minify: false,
      sourcemap: true
    }
  },
  'build'
);
```

### Sort User Plugins

Sorts user plugins according to their enforce order (pre, normal, post).

```typescript { .api }
/**
 * Sort user plugins according to their order
 * @param plugins - Array of plugin options
 * @returns Sorted plugins with pre, normal, and post arrays
 */
function sortUserPlugins(
  plugins: (Plugin | Plugin[])[]
): [Plugin[], Plugin[], Plugin[]];
```

**Usage Example:**

```typescript
import { sortUserPlugins } from 'vite';

const userPlugins = [
  normalPlugin(),
  { ...prePlugin(), enforce: 'pre' },
  { ...postPlugin(), enforce: 'post' }
];

const [pre, normal, post] = sortUserPlugins(userPlugins);

console.log('Pre plugins:', pre.length);
console.log('Normal plugins:', normal.length);
console.log('Post plugins:', post.length);
```

### Merge Configuration

Merges two Vite configurations with proper deep merging of arrays and objects.

```typescript { .api }
/**
 * Merge Vite configurations
 * @param defaults - Default configuration
 * @param overrides - Configuration to merge on top
 * @param isRoot - Whether this is the root config merge
 * @returns Merged configuration
 */
function mergeConfig<
  D extends Record<string, any>,
  O extends Record<string, any>
>(
  defaults: D,
  overrides: O,
  isRoot?: boolean
): Record<string, any>;
```

**Usage Example:**

```typescript
import { mergeConfig } from 'vite';

const baseConfig = {
  build: {
    outDir: 'dist',
    minify: true
  },
  plugins: [basePlugin()]
};

const envConfig = {
  build: {
    sourcemap: true
  },
  plugins: [envPlugin()]
};

const merged = mergeConfig(baseConfig, envConfig);
// Result: {
//   build: { outDir: 'dist', minify: true, sourcemap: true },
//   plugins: [basePlugin(), envPlugin()]
// }
```

### Merge Alias

Merges alias configurations.

```typescript { .api }
/**
 * Merge alias configurations
 * @param a - First alias config
 * @param b - Second alias config
 * @returns Merged alias options or undefined if both are undefined
 */
function mergeAlias(
  a?: AliasOptions,
  b?: AliasOptions
): AliasOptions | undefined;
```

**Usage Example:**

```typescript
import { mergeAlias } from 'vite';

const baseAlias = [
  { find: '@', replacement: '/src' }
];

const envAlias = {
  '~': '/node_modules'
};

const merged = mergeAlias(baseAlias, envAlias);
// Result: [
//   { find: '@', replacement: '/src' },
//   { find: '~', replacement: '/node_modules' }
// ]
```

### Load Environment Variables

Loads environment variables from .env files based on mode.

```typescript { .api }
/**
 * Load environment variables from .env files
 * @param mode - Current mode (development, production, etc.)
 * @param envDir - Directory containing .env files
 * @param prefixes - Prefixes for variables to include (default: 'VITE_')
 * @returns Object with loaded environment variables
 */
function loadEnv(
  mode: string,
  envDir: string,
  prefixes?: string | string[]
): Record<string, string>;
```

**Usage Example:**

```typescript
import { loadEnv } from 'vite';

// Load environment variables for production
const env = loadEnv('production', process.cwd(), 'VITE_');

console.log(env.VITE_API_URL);
console.log(env.VITE_APP_TITLE);

// Load with multiple prefixes
const env = loadEnv('development', './config', ['VITE_', 'APP_']);
```

### Resolve Environment Prefix

Resolves the environment variable prefix configuration.

```typescript { .api }
/**
 * Resolve environment variable prefix from config
 * @param config - User or resolved config containing envPrefix
 * @returns Normalized array of prefixes
 */
function resolveEnvPrefix(
  config: UserConfig | ResolvedConfig
): string[];
```

## Types

```typescript { .api }
interface UserConfig {
  /** Project root directory */
  root?: string;

  /** Base public path */
  base?: string;

  /** Public directory path */
  publicDir?: string | false;

  /** Cache directory */
  cacheDir?: string;

  /** Mode */
  mode?: string;

  /** Global constant replacements */
  define?: Record<string, any>;

  /** Plugins */
  plugins?: PluginOption[];

  /** Path resolution options */
  resolve?: ResolveOptions;

  /** CSS options */
  css?: CSSOptions;

  /** JSON loading options */
  json?: JsonOptions;

  /** esbuild transform options */
  esbuild?: ESBuildOptions | false;

  /** Static asset handling */
  assetsInclude?: string | RegExp | (string | RegExp)[];

  /** Log level */
  logLevel?: LogLevel;

  /** Custom logger */
  customLogger?: Logger;

  /** Clear screen when logging */
  clearScreen?: boolean;

  /** Environment files directory */
  envDir?: string;

  /** Environment variable prefix */
  envPrefix?: string | string[];

  /** App type */
  appType?: AppType;

  /** Dev server options */
  server?: ServerOptions;

  /** Build options */
  build?: BuildOptions;

  /** Preview server options */
  preview?: PreviewOptions;

  /** Dependency optimization options */
  optimizeDeps?: DepOptimizationOptions;

  /** SSR options */
  ssr?: SSROptions;

  /** Worker options */
  worker?: WorkerOptions;

  /** HTML options */
  html?: HTMLOptions;

  /** Environment options */
  environments?: Record<string, EnvironmentOptions>;

  /** Experimental options */
  experimental?: ExperimentalOptions;

  /** Legacy options */
  legacy?: LegacyOptions;

  /** Future options for deprecation warnings */
  future?: FutureOptions;
}

interface ResolvedConfig {
  /** Resolved project root */
  root: string;

  /** Resolved base path */
  base: string;

  /** Raw CLI options */
  rawBase: string;

  /** Resolved public directory */
  publicDir: string;

  /** Resolved cache directory */
  cacheDir: string;

  /** Command being run */
  command: 'build' | 'serve';

  /** Current mode */
  mode: string;

  /** Whether this is SSR build */
  isWorker: boolean;

  /** Whether running in production */
  isProduction: boolean;

  /** Environment variables */
  env: Record<string, any>;

  /** Resolved path resolution options */
  resolve: ResolvedResolveOptions;

  /** Resolved plugins */
  plugins: readonly Plugin[];

  /** Resolved server options */
  server: ResolvedServerOptions;

  /** Resolved build options */
  build: ResolvedBuildOptions;

  /** Resolved preview options */
  preview: ResolvedPreviewOptions;

  /** Resolved dev environment options */
  dev: ResolvedDevEnvironmentOptions;

  /** Resolved SSR options */
  ssr: ResolvedSSROptions;

  /** Assets include function */
  assetsInclude: (file: string) => boolean;

  /** Logger instance */
  logger: Logger;

  /** Resolved environments */
  environments: Record<string, ResolvedEnvironmentOptions>;

  /** App type */
  appType: AppType;

  /** Resolved experimental options */
  experimental: ExperimentalOptions;

  /** Plugin hook utilities */
  getSortedPlugins: (hookName: string) => Plugin[];
  getSortedPluginHooks: <K extends keyof Plugin>(hookName: K) => NonNullable<Plugin[K]>[];
}

type UserConfigExport =
  | UserConfig
  | Promise<UserConfig>
  | UserConfigFn;

type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>;

interface ConfigEnv {
  /** Command being run */
  command: 'build' | 'serve';

  /** Current mode */
  mode: string;

  /** Whether this is SSR build */
  isSsrBuild?: boolean;

  /** Whether this is preview mode */
  isPreview?: boolean;
}

type InlineConfig = UserConfig & {
  /** Path to config file */
  configFile?: string | false;

  /** Environment directory override */
  envFile?: false;
};

interface ResolveOptions {
  /** Main fields for package.json */
  mainFields?: string[];

  /** Browser field support */
  browserField?: boolean;

  /** Export conditions */
  conditions?: string[];

  /** File extensions to try */
  extensions?: string[];

  /** Dedupe packages */
  dedupe?: string[];

  /** Preserve symlinks */
  preserveSymlinks?: boolean;

  /** Path aliases */
  alias?: AliasOptions;

  /** External conditions */
  externalConditions?: string[];

  /** No external packages */
  noExternal?: string | RegExp | (string | RegExp)[] | boolean;

  /** External packages */
  external?: string | RegExp | (string | RegExp)[];

  /** Builtin modules */
  builtins?: (string | RegExp)[];
}

type AliasOptions = readonly Alias[] | { [find: string]: string };

interface Alias {
  find: string | RegExp;
  replacement: string;
  customResolver?: ResolverFunction | ResolverObject;
}

type LogLevel = 'info' | 'warn' | 'error' | 'silent';

type AppType = 'spa' | 'mpa' | 'custom';

interface ExperimentalOptions {
  /** Restore extension for import.meta.glob */
  importGlobRestoreExtension?: boolean;

  /** Custom render built asset URL */
  renderBuiltUrl?: RenderBuiltAssetUrl;

  /** Enable HMR partial accept */
  hmrPartialAccept?: boolean;
}

interface LegacyOptions {
  /** Skip WebSocket token check */
  skipWebSocketTokenCheck?: boolean;
}

interface FutureOptions {
  /** Remove plugin hook handleHotUpdate */
  removePluginHookHandleHotUpdate?: 'warn' | 'error';

  /** Remove plugin hook SSR argument */
  removePluginHookSsrArgument?: 'warn' | 'error';

  /** Remove server.moduleGraph */
  removeServerModuleGraph?: 'warn' | 'error';

  /** Remove server.hot */
  removeServerHot?: 'warn' | 'error';

  /** Remove server.transformRequest */
  removeServerTransformRequest?: 'warn' | 'error';

  /** Remove server.warmupRequest */
  removeServerWarmupRequest?: 'warn' | 'error';

  /** Remove server.ssrLoadModule */
  removeSsrLoadModule?: 'warn' | 'error';
}

interface WorkerOptions {
  /** Worker format */
  format?: 'es' | 'iife';

  /** Worker plugins */
  plugins?: PluginOption[];

  /** Worker rollup options */
  rollupOptions?: RollupOptions;
}

interface HTMLOptions {
  /** CSP nonce placeholder */
  cspNonce?: string;
}

type RenderBuiltAssetUrl = (
  filename: string,
  type: {
    type: 'public' | 'asset';
    hostId: string;
    hostType: 'js' | 'css' | 'html';
    ssr: boolean;
  }
) => string | { relative?: boolean; runtime?: string };
```
