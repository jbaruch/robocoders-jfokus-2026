# Multi-Environment System

Vite 7+ introduces a multi-environment architecture where each environment (client, SSR, custom) has its own module graph, plugin pipeline, and configuration. This enables better separation of concerns and more flexible build configurations.

## Capabilities

### Development Environment

Base class for development environments with module graph and plugin container.

```typescript { .api }
class DevEnvironment extends BaseEnvironment {
  /** Environment mode (always 'dev') */
  mode: 'dev';

  /** Environment-specific module graph */
  moduleGraph: EnvironmentModuleGraph;

  /** Plugin container for this environment */
  pluginContainer: EnvironmentPluginContainer<DevEnvironment>;

  /** Hot module reload channel */
  hot: NormalizedHotChannel;

  /** Dependency optimizer */
  depsOptimizer?: DepsOptimizer;

  /**
   * Transform a URL into transformed code
   * @param url - Module URL to transform
   * @param options - Transform options
   * @returns Promise resolving to transform result
   */
  transformRequest(
    url: string,
    options?: TransformOptions
  ): Promise<TransformResult | null>;

  /**
   * Warm up a URL (pre-transform and cache)
   * @param url - Module URL to warm up
   * @param options - Transform options
   */
  warmupRequest(url: string, options?: TransformOptions): Promise<void>;
}
```

**Usage Example:**

```typescript
// Access environments from dev server
const server = await createServer();
const clientEnv = server.environments.client;
const ssrEnv = server.environments.ssr;

// Transform module in specific environment
const result = await clientEnv.transformRequest('/src/App.tsx');

// Pre-warm modules
await clientEnv.warmupRequest('/src/utils/helpers.ts');

// Send HMR update to specific environment
clientEnv.hot.send({ type: 'full-reload' });
```

### Build Environment

Environment class for production builds.

```typescript { .api }
class BuildEnvironment extends BaseEnvironment {
  /** Environment mode (always 'build') */
  mode: 'build';

  /** Build-specific configuration */
  config: ResolvedConfig & ResolvedBuildEnvironmentOptions;
}
```

**Usage Example:**

```typescript
// Access during build
const builder = await createBuilder();
const clientEnv = builder.environments.client;
const ssrEnv = builder.environments.ssr;

// Build specific environment
await builder.build(clientEnv);
```

### Create Runnable Dev Environment

Creates a development environment that can execute modules using a ModuleRunner.

```typescript { .api }
/**
 * Create a runnable development environment
 * @param name - Environment name
 * @param config - Resolved configuration
 * @param context - Environment context with runner options
 * @returns RunnableDevEnvironment instance
 */
function createRunnableDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context?: RunnableDevEnvironmentContext
): RunnableDevEnvironment;

interface RunnableDevEnvironmentContext extends DevEnvironmentContext {
  /** Custom runner factory */
  runner?: (
    environment: RunnableDevEnvironment,
    options?: ServerModuleRunnerOptions
  ) => ModuleRunner;

  /** Module runner options */
  runnerOptions?: ServerModuleRunnerOptions;

  /** Enable hot module reload */
  hot?: boolean;
}
```

**Usage Example:**

```typescript
import { createRunnableDevEnvironment } from 'vite';

const config = await resolveConfig({ root: process.cwd() }, 'serve');

const runnableEnv = createRunnableDevEnvironment('ssr', config, {
  hot: true,
  runnerOptions: {
    hmr: true
  }
});

// Execute modules in this environment
const module = await runnableEnv.runner.import('/src/entry-server.ts');
```

### Check Runnable Environment

Type guard to check if an environment is runnable.

```typescript { .api }
/**
 * Check if environment is runnable
 * @param environment - Environment to check
 * @returns true if environment is RunnableDevEnvironment
 */
function isRunnableDevEnvironment(
  environment: DevEnvironment
): environment is RunnableDevEnvironment;
```

**Usage Example:**

```typescript
import { isRunnableDevEnvironment } from 'vite';

const server = await createServer();
const ssrEnv = server.environments.ssr;

if (isRunnableDevEnvironment(ssrEnv)) {
  // Can execute modules
  const module = await ssrEnv.runner.import('/src/app.ts');
}
```

### Create Fetchable Dev Environment

Creates a development environment with module fetching capabilities.

```typescript { .api }
/**
 * Create a fetchable development environment
 * @param name - Environment name
 * @param config - Resolved configuration
 * @param context - Environment context with fetch options
 * @returns FetchableDevEnvironment instance
 */
function createFetchableDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context?: FetchableDevEnvironmentContext
): FetchableDevEnvironment;
```

### Check Fetchable Environment

Type guard to check if an environment is fetchable.

```typescript { .api }
/**
 * Check if environment is fetchable
 * @param environment - Environment to check
 * @returns true if environment is FetchableDevEnvironment
 */
function isFetchableDevEnvironment(
  environment: DevEnvironment
): environment is FetchableDevEnvironment;
```

### Environment Module Graph

Tracks module dependencies and HMR state per environment.

```typescript { .api }
class EnvironmentModuleGraph {
  /** Environment name this graph belongs to */
  environment: string;

  /**
   * Get module by URL
   * @param url - Module URL
   * @returns Module node or undefined
   */
  getModuleByUrl(url: string): EnvironmentModuleNode | undefined;

  /**
   * Get module by ID
   * @param id - Module ID
   * @returns Module node or undefined
   */
  getModuleById(id: string): EnvironmentModuleNode | undefined;

  /**
   * Ensure module entry exists
   * @param url - Module URL
   * @returns Module node
   */
  ensureEntryFromUrl(url: string): EnvironmentModuleNode;

  /**
   * Invalidate module
   * @param module - Module to invalidate
   */
  invalidateModule(module: EnvironmentModuleNode): void;

  /**
   * Update module information
   * @param module - Module to update
   */
  updateModuleInfo(module: EnvironmentModuleNode): void;
}
```

**Usage Example:**

```typescript
const server = await createServer();
const clientGraph = server.environments.client.moduleGraph;

// Get module
const mod = clientGraph.getModuleById('/src/App.tsx');

if (mod) {
  console.log('Importers:', mod.importers);
  console.log('Imported modules:', mod.importedModules);

  // Invalidate module
  clientGraph.invalidateModule(mod);
}
```

### Environment Module Node

Represents a single module in the environment module graph.

```typescript { .api }
class EnvironmentModuleNode {
  /** Module URL */
  url: string;

  /** Resolved module ID */
  id: string | null;

  /** File path on disk */
  file: string | null;

  /** Module type */
  type: 'js' | 'css' | 'asset';

  /** Modules that import this module */
  importers: Set<EnvironmentModuleNode>;

  /** Client-side importers for HMR */
  clientImportedModules: Set<EnvironmentModuleNode>;

  /** Modules imported by this module */
  importedModules: Set<EnvironmentModuleNode>;

  /** Accepted HMR dependencies */
  acceptedHmrDeps: Set<EnvironmentModuleNode>;

  /** Accepted HMR exports */
  acceptedHmrExports: Set<string> | null;

  /** Whether module accepts itself */
  isSelfAccepting?: boolean;

  /** Last HMR timestamp */
  lastHMRTimestamp: number;

  /** Last invalidation timestamp */
  lastInvalidationTimestamp: number;

  /** Transform result */
  transformResult: TransformResult | null;
}
```

### Per-Environment State

Creates state that is maintained separately per environment.

```typescript { .api }
/**
 * Create per-environment state management
 * @param initial - Initialization function that receives environment
 * @returns Function that takes PluginContext and returns state
 */
function perEnvironmentState<State>(
  initial: (environment: Environment) => State
): (context: PluginContext) => State;
```

**Usage Example:**

```typescript
import { perEnvironmentState } from 'vite';

const getCache = perEnvironmentState((environment) => {
  return new Map<string, any>();
});

const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  transform(code, id) {
    // Get environment-specific cache by passing plugin context
    const cache = getCache(this);

    if (cache.has(id)) {
      return cache.get(id);
    }

    const result = transformCode(code);
    cache.set(id, result);
    return result;
  }
});
```

### Environment Configuration

Environment-specific configuration options.

```typescript { .api }
interface EnvironmentOptions {
  /** Consumer type for this environment */
  consumer?: 'client' | 'server';

  /** Development options */
  dev?: DevEnvironmentOptions;

  /** Build options */
  build?: BuildEnvironmentOptions;

  /** Module resolution options */
  resolve?: EnvironmentResolveOptions;

  /** Dependency optimization options */
  optimizeDeps?: DepOptimizationOptions;

  /** Node compatibility options */
  nodeCompatible?: boolean;

  /** WebAssembly support */
  webCompatible?: boolean;
}
```

**Usage Example:**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  environments: {
    client: {
      consumer: 'client',
      build: {
        outDir: 'dist/client',
        sourcemap: true
      }
    },
    ssr: {
      consumer: 'server',
      build: {
        outDir: 'dist/server',
        ssr: true
      },
      dev: {
        optimizeDeps: {
          include: ['react', 'react-dom']
        }
      }
    },
    edge: {
      consumer: 'server',
      resolve: {
        conditions: ['edge', 'worker']
      }
    }
  }
});
```

## Types

```typescript { .api }
interface Environment {
  /** Environment name */
  name: string;

  /** Environment mode */
  mode: 'dev' | 'build';

  /** Environment configuration */
  config: ResolvedConfig & ResolvedEnvironmentOptions;

  /** Environment-specific logger */
  logger: Logger;

  /** Environment plugins */
  plugins: readonly Plugin[];
}

interface DevEnvironmentContext {
  /** Enable hot module reload */
  hot: boolean;

  /** Hot channel or WebSocket server */
  transport?: HotChannel | WebSocketServer;

  /** Environment options override */
  options?: EnvironmentOptions;

  /** Remote runner options */
  remoteRunner?: {
    inlineSourceMap?: boolean;
  };

  /** Dependency optimizer */
  depsOptimizer?: DepsOptimizer;
}

interface RunnableDevEnvironment extends DevEnvironment {
  /** Module runner for executing code */
  runner: ModuleRunner;
}

interface FetchableDevEnvironment extends DevEnvironment {
  /**
   * Fetch and transform a module
   * @param id - Module ID
   * @param importer - Importer module ID
   * @param options - Fetch options
   * @returns Promise resolving to fetch result
   */
  fetchModule(
    id: string,
    importer?: string,
    options?: FetchModuleOptions
  ): Promise<FetchResult>;
}

interface ResolvedEnvironmentOptions {
  /** Consumer type */
  consumer: 'client' | 'server';

  /** Resolved dev options */
  dev: ResolvedDevEnvironmentOptions;

  /** Resolved build options */
  build: ResolvedBuildEnvironmentOptions;

  /** Resolved resolve options */
  resolve: EnvironmentResolveOptions;

  /** Node compatibility */
  nodeCompatible: boolean;

  /** Web compatibility */
  webCompatible: boolean;
}

interface DevEnvironmentOptions {
  /** Files to pre-transform (glob patterns) */
  warmup?: string[];

  /** Pre-transform known direct imports */
  preTransformRequests?: boolean;

  /** Enable sourcemaps */
  sourcemap?: boolean | { js?: boolean; css?: boolean };

  /** Sourcemap ignore list predicate */
  sourcemapIgnoreList?: false | ((sourcePath: string, sourcemapPath: string) => boolean);

  /** Create environment factory */
  createEnvironment?: (name: string, config: ResolvedConfig) => Promise<DevEnvironment> | DevEnvironment;

  /** Whether to recover from errors */
  recoverable?: boolean;

  /** Use module runner transform */
  moduleRunnerTransform?: boolean;
}

interface EnvironmentResolveOptions {
  /** Main fields for package.json */
  mainFields?: string[];

  /** Export conditions */
  conditions?: string[];

  /** External conditions */
  externalConditions?: string[];

  /** File extensions to try */
  extensions?: string[];

  /** Dedupe packages */
  dedupe?: string[];

  /** External packages */
  external?: string | RegExp | (string | RegExp)[];

  /** No external packages */
  noExternal?: string | RegExp | (string | RegExp)[] | boolean;

  /** Builtin modules */
  builtins?: (string | RegExp)[];
}

interface TransformResult {
  /** Transformed code */
  code: string;

  /** Source map */
  map: SourceMap | null;

  /** esbuild warnings */
  warnings?: { text: string }[];

  /** Module dependencies */
  deps?: string[];

  /** Dynamic dependencies */
  dynamicDeps?: string[];
}

interface TransformOptions {
  /** Transform for SSR */
  ssr?: boolean;

  /** HTML transformation */
  html?: boolean;
}

interface FetchModuleOptions {
  /** Whether module is already cached */
  cached?: boolean;

  /** Include inline source map in response */
  inlineSourceMap?: boolean;

  /** Start offset for transformed code */
  startOffset?: number;
}

interface FetchResult {
  /** Transformed code */
  code: string;

  /** External module info */
  externalize?: string;

  /** Module type */
  type?: 'module' | 'commonjs' | 'builtin' | 'network';
}
```
