# Production Build

Vite's build system bundles applications for production using Rollup. It supports multiple output formats, code splitting, asset optimization, and library mode for creating distributable packages.

## Capabilities

### Build for Production

Bundles the application for production deployment.

```typescript { .api }
/**
 * Build the project for production
 * @param inlineConfig - Configuration object to merge with config file
 * @returns Promise resolving to Rollup build output
 */
function build(
  inlineConfig?: InlineConfig
): Promise<RollupOutput | RollupOutput[] | RollupWatcher>;
```

**Usage Example:**

```typescript
import { build } from 'vite';

// Basic build
await build();

// Build with custom configuration
await build({
  root: process.cwd(),
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true
  }
});

// Build for SSR
await build({
  build: {
    ssr: 'src/entry-server.ts',
    outDir: 'dist/server'
  }
});
```

### Create Builder

Creates a builder instance for programmatic builds with more control over the build process.

```typescript { .api }
/**
 * Create a builder instance for programmatic builds
 * @param inlineConfig - Configuration object
 * @param isBuild - Whether this is a build or scan
 * @returns Promise resolving to ViteBuilder instance
 */
function createBuilder(
  inlineConfig?: InlineConfig,
  isBuild?: boolean
): Promise<ViteBuilder>;
```

**Usage Example:**

```typescript
import { createBuilder } from 'vite';

const builder = await createBuilder({
  build: {
    outDir: 'dist'
  }
});

// Build specific environment
const clientEnv = builder.environments.client;
await builder.build(clientEnv);

// Clean up
await builder.close();
```

### Library Mode

Builds projects as distributable libraries with multiple output formats.

```typescript { .api }
interface LibraryOptions {
  /** Path of library entry */
  entry: string | string[] | { [entryAlias: string]: string };

  /** Global variable name (required for UMD/IIFE) */
  name?: string;

  /** Output bundle formats */
  formats?: LibraryFormats[];

  /** Output file name (string or function) */
  fileName?: string | ((format: ModuleFormat, entryName: string) => string);

  /** CSS file name */
  cssFileName?: string;
}

type LibraryFormats = 'es' | 'cjs' | 'umd' | 'iife' | 'system';
```

**Usage Example:**

```typescript
import { build } from 'vite';

// Build library with multiple formats
await build({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `my-lib.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies
      external: ['vue', 'react'],
      output: {
        globals: {
          vue: 'Vue',
          react: 'React'
        }
      }
    }
  }
});
```

### Build Manifest

Generates a manifest file mapping original file names to their hashed versions.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Emit manifest.json mapping hash-less filenames to hashed versions
   * @default false
   */
  manifest?: boolean | string;
}

interface Manifest {
  [file: string]: ManifestChunk;
}

interface ManifestChunk {
  /** Output file path with hash */
  file: string;

  /** Source file path (for entry chunks) */
  src?: string;

  /** Is entry chunk */
  isEntry?: boolean;

  /** Is dynamic entry */
  isDynamicEntry?: boolean;

  /** Imported files */
  imports?: string[];

  /** Dynamically imported files */
  dynamicImports?: string[];

  /** Associated CSS files */
  css?: string[];

  /** Associated asset files */
  assets?: string[];
}
```

**Usage Example:**

```typescript
import { build } from 'vite';
import { readFileSync } from 'fs';

await build({
  build: {
    manifest: true // or 'manifest.json'
  }
});

// Read manifest after build
const manifest = JSON.parse(
  readFileSync('dist/.vite/manifest.json', 'utf-8')
);

// Use in server-side rendering
const entryChunk = manifest['src/main.ts'];
const scriptTag = `<script type="module" src="/${entryChunk.file}"></script>`;
```

### SSR Build

Builds for server-side rendering with separate client and server bundles.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Build for SSR (true or entry file path)
   * @default false
   */
  ssr?: boolean | string;

  /**
   * Generate SSR manifest for style links and asset preloading
   * @default false
   */
  ssrManifest?: boolean | string;

  /**
   * Emit assets during SSR build
   * @default false
   */
  ssrEmitAssets?: boolean;
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

// Build client bundle with SSR manifest
await build({
  build: {
    ssrManifest: true,
    outDir: 'dist/client'
  }
});

// Build server bundle
await build({
  build: {
    ssr: 'src/entry-server.ts',
    outDir: 'dist/server'
  }
});
```

### Asset Handling

Controls how static assets are processed and emitted.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Directory for built assets (relative to outDir)
   * @default 'assets'
   */
  assetsDir?: string;

  /**
   * Inline assets smaller than this size (bytes)
   * Set to 0 to disable
   * @default 4096
   */
  assetsInlineLimit?: number | ((filePath: string, content: Buffer) => boolean | undefined);

  /**
   * Emit assets during build
   * Default: true for client, false for other environments
   */
  emitAssets?: boolean;
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

await build({
  build: {
    assetsDir: 'static',
    assetsInlineLimit: 8192, // 8kb
    // Or use function for custom logic
    assetsInlineLimit: (filePath, content) => {
      // Always inline SVGs
      if (filePath.endsWith('.svg')) return true;
      // Use default logic for others
      return undefined;
    }
  }
});
```

### Code Splitting

Controls code splitting and CSS extraction.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Enable/disable CSS code splitting
   * @default true
   */
  cssCodeSplit?: boolean;

  /**
   * Rollup options for advanced control
   */
  rollupOptions?: RollupOptions;
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

await build({
  build: {
    cssCodeSplit: false, // Single CSS file
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['./src/utils']
        }
      }
    }
  }
});
```

### Minification

Controls code minification with esbuild or Terser.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Minification option
   * @default 'esbuild'
   */
  minify?: boolean | 'terser' | 'esbuild';

  /**
   * Terser minification options
   */
  terserOptions?: TerserOptions;

  /**
   * CSS minification
   * @default 'esbuild'
   */
  cssMinify?: boolean | 'esbuild' | 'lightningcss';
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

await build({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    }
  }
});
```

### Source Maps

Controls source map generation for debugging.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Source map generation
   * true: separate file
   * 'inline': appended as data URI
   * 'hidden': generated but not referenced
   * @default false
   */
  sourcemap?: boolean | 'inline' | 'hidden';
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

// Generate separate source maps
await build({
  build: {
    sourcemap: true
  }
});

// Inline source maps (useful for debugging)
await build({
  build: {
    sourcemap: 'inline'
  }
});
```

### Module Preload

Configures module preloading for optimized loading.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Module preload configuration
   * @default true
   */
  modulePreload?: boolean | ModulePreloadOptions;
}

interface ModulePreloadOptions {
  /**
   * Inject module preload polyfill
   * @default true
   */
  polyfill?: boolean;

  /**
   * Resolve dependencies to preload
   */
  resolveDependencies?: ResolveModulePreloadDependenciesFn;
}

type ResolveModulePreloadDependenciesFn = (
  filename: string,
  deps: string[],
  context: {
    hostId: string;
    hostType: 'html' | 'js';
  }
) => string[];
```

**Usage Example:**

```typescript
import { build } from 'vite';

await build({
  build: {
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps, { hostType }) => {
        // Filter deps based on custom logic
        return deps.filter(dep => !dep.includes('heavy-lib'));
      }
    }
  }
});
```

### Build Targets

Specifies browser compatibility targets for transpilation.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Browser compatibility target
   * @default 'baseline-widely-available'
   */
  target?: 'baseline-widely-available' | 'esnext' | string | string[] | false;

  /**
   * Separate CSS target
   * @default target
   */
  cssTarget?: string | string[] | false;
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

// Target modern browsers
await build({
  build: {
    target: 'esnext'
  }
});

// Target specific browsers
await build({
  build: {
    target: ['chrome90', 'firefox88', 'safari14']
  }
});
```

### Watch Mode

Enables watch mode for continuous rebuilding.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Rollup watch options (null to disable)
   * @default null
   */
  watch?: WatcherOptions | null;
}

interface WatcherOptions {
  /** Paths to watch */
  include?: string | string[];

  /** Paths to exclude */
  exclude?: string | string[];

  /** Chokidar options */
  chokidar?: WatchOptions;

  /** Build delay (ms) */
  buildDelay?: number;

  /** Skip write to disk */
  skipWrite?: boolean;
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

const watcher = await build({
  build: {
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**',
      buildDelay: 100
    }
  }
});

// watcher is a RollupWatcher instance
watcher.on('event', (event) => {
  if (event.code === 'BUNDLE_END') {
    console.log('Build completed');
  }
});
```

### Output Configuration

Controls build output directory and structure.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Output directory (relative to root)
   * @default 'dist'
   */
  outDir?: string;

  /**
   * Empty output directory before build
   * @default true when outDir is subdirectory of root
   */
  emptyOutDir?: boolean | null;

  /**
   * Copy public directory to outDir
   * @default true
   */
  copyPublicDir?: boolean;

  /**
   * Write bundle to disk
   * @default true
   */
  write?: boolean;
}
```

**Usage Example:**

```typescript
import { build } from 'vite';

await build({
  build: {
    outDir: 'build',
    emptyOutDir: true,
    copyPublicDir: false,
    write: true
  }
});
```

### License Extraction

Extracts and bundles dependency licenses.

```typescript { .api }
interface BuildEnvironmentOptions {
  /**
   * Emit license file with bundled dependencies' licenses
   * @default false
   */
  license?: boolean | LicenseOptions;
}

interface LicenseOptions {
  /** Output file name */
  fileName?: string;
}
```

## Types

```typescript { .api }
interface BuildEnvironmentOptions {
  target?: 'baseline-widely-available' | TransformOptions['target'] | false;
  polyfillModulePreload?: boolean;
  modulePreload?: boolean | ModulePreloadOptions;
  outDir?: string;
  assetsDir?: string;
  assetsInlineLimit?: number | ((filePath: string, content: Buffer) => boolean | undefined);
  cssCodeSplit?: boolean;
  cssTarget?: TransformOptions['target'] | false;
  cssMinify?: boolean | 'esbuild' | 'lightningcss';
  sourcemap?: boolean | 'inline' | 'hidden';
  minify?: boolean | 'terser' | 'esbuild';
  terserOptions?: TerserOptions;
  rollupOptions?: RollupOptions;
  commonjsOptions?: RollupCommonJSOptions;
  dynamicImportVarsOptions?: RollupDynamicImportVarsOptions;
  write?: boolean;
  emptyOutDir?: boolean | null;
  copyPublicDir?: boolean;
  license?: boolean | LicenseOptions;
  manifest?: boolean | string;
  lib?: LibraryOptions | false;
  ssr?: boolean | string;
  ssrManifest?: boolean | string;
  ssrEmitAssets?: boolean;
  emitAssets?: boolean;
  reportCompressedSize?: boolean;
  chunkSizeWarningLimit?: number;
  watch?: WatcherOptions | null;
  createEnvironment?: (name: string, config: ResolvedConfig) => Promise<BuildEnvironment> | BuildEnvironment;
}

interface ResolvedBuildEnvironmentOptions extends Required<Omit<BuildEnvironmentOptions, 'polyfillModulePreload'>> {
  modulePreload: false | ResolvedModulePreloadOptions;
}

interface ViteBuilder {
  /** Resolved configuration */
  config: ResolvedConfig;

  /** Build environments */
  environments: Record<string, BuildEnvironment>;

  /**
   * Build a specific environment
   * @param environment - Environment to build
   * @returns Promise resolving to Rollup output
   */
  build(environment: BuildEnvironment): Promise<RollupOutput | RollupOutput[] | RollupWatcher>;

  /**
   * Close the builder
   */
  close(): Promise<void>;
}

interface BuildEnvironment {
  /** Environment name */
  name: string;

  /** Resolved configuration */
  config: ResolvedConfig;

  /** Environment-specific options */
  options: ResolvedEnvironmentOptions;
}

interface RollupOutput {
  output: OutputChunk | OutputAsset[];
}

interface OutputChunk {
  type: 'chunk';
  code: string;
  fileName: string;
  map?: SourceMap;
  imports: string[];
  exports: string[];
  modules: { [id: string]: ModuleInfo };
  isEntry: boolean;
  isDynamicEntry: boolean;
}

interface OutputAsset {
  type: 'asset';
  fileName: string;
  source: string | Uint8Array;
}

interface RollupWatcher {
  on(event: 'event', handler: (event: RollupWatcherEvent) => void): this;
  on(event: 'restart' | 'close', handler: () => void): this;
  close(): void;
}

interface RollupWatcherEvent {
  code: 'START' | 'BUNDLE_START' | 'BUNDLE_END' | 'END' | 'ERROR';
  error?: RollupError;
  result?: RollupBuild;
}

interface TerserOptions {
  compress?: any;
  format?: any;
  mangle?: any;
  module?: boolean;
  sourceMap?: boolean;
  maxWorkers?: number;
}

interface RollupOptions {
  input?: InputOption;
  output?: OutputOptions | OutputOptions[];
  external?: ExternalOption;
  plugins?: Plugin[];
  onwarn?: WarningHandlerWithDefault;
}

interface RollupCommonJSOptions {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  extensions?: string[];
  ignoreGlobal?: boolean;
  sourceMap?: boolean;
  transformMixedEsModules?: boolean;
}

interface RollupDynamicImportVarsOptions {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  warnOnError?: boolean;
}

type InputOption = string | string[] | { [entryAlias: string]: string };

type ExternalOption = string | RegExp | (string | RegExp)[] | ((source: string, importer: string | undefined, isResolved: boolean) => boolean);

interface TransformOptions {
  target?: 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'esnext' | string[];
}
```
