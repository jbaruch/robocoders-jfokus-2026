# Dependency Pre-bundling

Vite's dependency pre-bundling system uses esbuild to convert CommonJS and UMD dependencies to ESM, reduce the number of HTTP requests, and optimize dependency loading. Pre-bundling happens automatically on dev server startup and can be configured to include or exclude specific dependencies.

## Capabilities

### Optimize Dependencies

Manually trigger dependency optimization for the current configuration.

```typescript { .api }
import { optimizeDeps } from 'vite';

/**
 * Pre-bundle dependencies
 * @param config - Inline configuration
 * @returns Promise that resolves when optimization is complete
 */
function optimizeDeps(config: InlineConfig): Promise<void>;
```

**Usage Example:**

```typescript
import { optimizeDeps } from 'vite';

// Optimize dependencies programmatically
await optimizeDeps({
  root: process.cwd(),
  optimizeDeps: {
    include: ['lodash', 'axios'],
    force: true
  }
});
```

### Dependency Optimization Configuration

Configure which dependencies to optimize and how to optimize them.

```typescript { .api }
/**
 * Dependency optimization configuration
 */
interface DepOptimizationConfig {
  /**
   * Force optimize listed dependencies
   * Must be resolvable import paths (not globs)
   */
  include?: string[];

  /**
   * Exclude dependencies from optimization
   * Must be resolvable import paths (not globs)
   */
  exclude?: string[];

  /**
   * Forces ESM interop when importing these dependencies
   * Some legacy packages advertise themselves as ESM but use require internally
   * @experimental
   */
  needsInterop?: string[];

  /**
   * Options to pass to esbuild during optimization
   * Some options are omitted as they would not be compatible with Vite
   * - external is omitted, use optimizeDeps.exclude instead
   * - plugins are merged with Vite's dep plugin
   */
  esbuildOptions?: Omit<
    EsbuildBuildOptions,
    | 'bundle'
    | 'entryPoints'
    | 'external'
    | 'write'
    | 'watch'
    | 'outdir'
    | 'outfile'
    | 'outbase'
    | 'outExtension'
    | 'metafile'
  >;

  /**
   * List of file extensions to treat as entry points during scanning
   * @default ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx']
   */
  extensions?: string[];

  /**
   * Disable dependency optimization
   * @default false
   */
  disabled?: boolean | 'build' | 'dev';

  /**
   * Force dependency optimization regardless of cache
   * @default false
   */
  force?: boolean;

  /**
   * Entries to use for dependency scanning
   * By default, all HTML files in the project root are scanned
   */
  entries?: string | string[];

  /**
   * Whether to hold the dependency optimization process until all static imports are crawled
   * @default true
   */
  holdUntilCrawlEnd?: boolean;
}

/**
 * Full dependency optimization options (extends config)
 */
interface DepOptimizationOptions extends DepOptimizationConfig {
  /**
   * Enable dependency optimization
   * @default true in dev, false in build
   */
  disabled?: boolean | 'build' | 'dev';
}
```

**Configuration Example:**

```typescript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    // Always optimize these dependencies
    include: [
      'react',
      'react-dom',
      'lodash-es'
    ],

    // Never optimize these
    exclude: [
      'my-local-package'
    ],

    // Force ESM interop for problematic packages
    needsInterop: [
      'legacy-package'
    ],

    // Configure esbuild
    esbuildOptions: {
      target: 'es2020',
      define: {
        'process.env.NODE_ENV': '"development"'
      },
      plugins: [
        // Custom esbuild plugins
      ]
    },

    // Custom entry points for scanning
    entries: [
      './src/main.ts',
      './src/worker.ts'
    ],

    // Force re-optimization
    force: false,

    // Disable optimization in certain modes
    disabled: false
  }
});
```

### Optimization Metadata

Access metadata about optimized dependencies.

```typescript { .api }
/**
 * Metadata about optimized dependencies
 */
interface DepOptimizationMetadata {
  /**
   * Hash of the dependency optimization config
   */
  hash: string;

  /**
   * Browser hash for the optimization
   */
  browserHash: string;

  /**
   * Map of optimized dependency info
   */
  optimized: Record<string, OptimizedDepInfo>;

  /**
   * Map of chunks created during optimization
   */
  chunks: Record<string, OptimizedDepInfo>;

  /**
   * Map of discovered dependencies
   */
  discovered: Record<string, OptimizedDepInfo>;

  /**
   * Map of dependencies with errors
   */
  depInfoList: OptimizedDepInfo[];
}

/**
 * Information about a single optimized dependency
 */
interface OptimizedDepInfo {
  /** Unique identifier for this dependency */
  id: string;

  /** File path to the optimized bundle */
  file: string;

  /** Original source location */
  src?: string;

  /** Whether this is a CommonJS dependency needing interop */
  needsInterop?: boolean;

  /** Browser hash for this specific dependency */
  browserHash?: string;

  /** File hash of the source */
  fileHash?: string;

  /** Whether this dependency was processed */
  processing?: Promise<void>;

  /** Exports data for the dependency */
  exportsData?: Promise<ExportsData>;
}

/**
 * Exports data for a module
 */
interface ExportsData {
  /** Whether the module uses ES module syntax */
  hasModuleSyntax: boolean;

  /** Exported names from the module */
  exports: readonly string[];

  /** Whether the module requires JSX loader */
  jsxLoader?: boolean;
}
```

### SSR Dependency Optimization

Configure dependency optimization specifically for SSR builds.

```typescript { .api }
/**
 * SSR-specific dependency optimization configuration
 */
interface SsrDepOptimizationConfig {
  /**
   * Enable SSR dependency optimization
   * @default false
   */
  enabled?: boolean;

  /**
   * Force optimize these dependencies for SSR
   */
  include?: string[];

  /**
   * Exclude dependencies from SSR optimization
   */
  exclude?: string[];

  /**
   * esbuild options for SSR optimization
   */
  esbuildOptions?: Omit<
    EsbuildBuildOptions,
    'bundle' | 'entryPoints' | 'external' | 'write' | 'watch'
  >;
}
```

**SSR Configuration Example:**

```typescript
// vite.config.js
export default defineConfig({
  ssr: {
    optimizeDeps: {
      enabled: true,
      include: [
        'express',
        'compression'
      ],
      exclude: [
        'native-module'
      ]
    }
  }
});
```

### Dependency Discovery

Vite automatically discovers dependencies during development.

**How Discovery Works:**

1. Server starts and scans entry points (HTML files by default)
2. Static imports are crawled to find dependencies
3. Dependencies not in `node_modules/.vite` are queued for optimization
4. esbuild bundles the dependencies
5. Optimized dependencies are served with cache headers

**Manual Discovery:**

```typescript
// In a plugin
{
  name: 'discover-deps',
  configResolved(config) {
    // Access optimizer
    const optimizer = server.environments.client._optimizer;

    // Register a missing import for optimization
    if (optimizer) {
      optimizer.registerMissingImport(id, resolved);
    }
  }
}
```

### Force Re-optimization

Force Vite to re-bundle dependencies, bypassing the cache.

**Command Line:**

```bash
# Force re-optimization
vite --force

# Or with optimize command
vite optimize --force
```

**Programmatically:**

```typescript
import { createServer } from 'vite';

const server = await createServer({
  optimizeDeps: {
    force: true
  }
});
```

**When to Force:**

- Dependency versions changed without updating lock file
- Cache is corrupted
- Testing optimization changes
- After updating Vite version

### Common Optimization Patterns

**Optimizing Monorepo Dependencies:**

```typescript
export default defineConfig({
  optimizeDeps: {
    // Include workspace packages
    include: [
      '@my-org/shared-utils',
      '@my-org/ui-components'
    ]
  }
});
```

**Deep Imports:**

```typescript
export default defineConfig({
  optimizeDeps: {
    // Optimize specific deep imports
    include: [
      'lodash-es/debounce',
      'date-fns/format',
      'rxjs/operators'
    ]
  }
});
```

**Problematic CommonJS Packages:**

```typescript
export default defineConfig({
  optimizeDeps: {
    // Include CJS packages that cause issues
    include: [
      'cjs-package > esm-dep',
      'problematic-package'
    ],

    // Force ESM interop
    needsInterop: [
      'fake-esm-package'
    ]
  }
});
```

**Large Dependencies:**

```typescript
export default defineConfig({
  optimizeDeps: {
    // Exclude very large dependencies that don't need bundling
    exclude: [
      'large-package'
    ],

    // Increase esbuild timeout for large deps
    esbuildOptions: {
      // Custom loader plugins, etc.
    }
  }
});
```

## Types

### Esbuild Build Options

```typescript { .api }
/**
 * Esbuild build options (subset used by Vite)
 * See https://esbuild.github.io/api/ for full documentation
 */
interface EsbuildBuildOptions {
  /** Platform to target */
  platform?: 'browser' | 'node' | 'neutral';

  /** Output format */
  format?: 'iife' | 'cjs' | 'esm';

  /** Target JavaScript version */
  target?: string | string[];

  /** Define constants */
  define?: Record<string, string>;

  /** Configure minification */
  minify?: boolean;
  minifyWhitespace?: boolean;
  minifyIdentifiers?: boolean;
  minifySyntax?: boolean;

  /** Configure source maps */
  sourcemap?: boolean | 'inline' | 'external' | 'both';

  /** JSX configuration */
  jsx?: 'transform' | 'preserve' | 'automatic';
  jsxFactory?: string;
  jsxFragment?: string;
  jsxImportSource?: string;

  /** Configure loaders */
  loader?: Record<string, Loader>;

  /** Resolve extensions */
  resolveExtensions?: string[];

  /** Main fields for resolution */
  mainFields?: string[];

  /** Conditions for exports field */
  conditions?: string[];

  /** External packages */
  external?: string[];

  /** esbuild plugins */
  plugins?: EsbuildPlugin[];

  /** Other options */
  charset?: 'ascii' | 'utf8';
  treeShaking?: boolean;
  legalComments?: 'none' | 'inline' | 'eof' | 'linked' | 'external';
  banner?: Record<string, string>;
  footer?: Record<string, string>;
}

/**
 * Esbuild loader type
 */
type Loader =
  | 'js'
  | 'jsx'
  | 'ts'
  | 'tsx'
  | 'json'
  | 'text'
  | 'base64'
  | 'dataurl'
  | 'file'
  | 'binary';
```

### Optimizer Interface

```typescript { .api }
/**
 * Dependency optimizer instance (internal)
 */
interface DepsOptimizer {
  /** Initialize optimizer */
  init(): Promise<void>;

  /** Current optimization metadata */
  metadata: DepOptimizationMetadata;

  /** Scan processing promise */
  scanProcessing?: Promise<void>;

  /**
   * Register a missing import for optimization
   * @param id - Import identifier
   * @param resolved - Resolved path
   * @returns Optimized dependency info
   */
  registerMissingImport(
    id: string,
    resolved: string
  ): OptimizedDepInfo;

  /** Run optimization */
  run(): void;

  /** Check if ID is an optimized dependency file */
  isOptimizedDepFile(id: string): boolean;

  /** Check if URL is an optimized dependency */
  isOptimizedDepUrl(url: string): boolean;

  /** Get optimized dependency ID */
  getOptimizedDepId(depInfo: OptimizedDepInfo): string;

  /** Close optimizer */
  close(): Promise<void>;

  /** Optimizer options */
  options: DepOptimizationOptions;
}
```
