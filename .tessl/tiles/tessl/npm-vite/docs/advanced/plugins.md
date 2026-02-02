# Plugin System

Vite's plugin system extends Rollup's plugin interface with Vite-specific hooks for development server integration, HMR, HTML transformation, and per-environment configuration. Plugins can be shared across environments or configured per-environment for specialized behavior.

## Capabilities

### Per-Environment Plugin

Creates a plugin that runs differently per environment, allowing environment-specific configurations.

```typescript { .api }
/**
 * Create a plugin that runs per-environment
 * @param name - Plugin name
 * @param applyToEnvironment - Function determining how plugin applies to each environment
 * @returns Plugin instance
 */
function perEnvironmentPlugin(
  name: string,
  applyToEnvironment: (
    environment: PartialEnvironment
  ) => boolean | Promise<boolean> | PluginOption
): Plugin;
```

**Usage Example:**

```typescript
import { perEnvironmentPlugin } from 'vite';

const myPlugin = perEnvironmentPlugin('my-plugin', (environment) => {
  // Only apply to client environment
  if (environment.name === 'client') {
    return {
      name: 'my-plugin-client',
      transform(code, id) {
        // Client-specific transform
        return code;
      }
    };
  }

  // Skip for other environments
  return false;
});

export default {
  plugins: [myPlugin]
};
```

### Config Hook

Modifies Vite configuration before it's resolved.

```typescript { .api }
interface Plugin {
  /**
   * Modify Vite config before resolution
   * Can mutate config directly or return partial config to merge
   */
  config?: (
    this: ConfigPluginContext,
    config: UserConfig,
    env: ConfigEnv
  ) => Omit<UserConfig, 'plugins'> | null | void | Promise<Omit<UserConfig, 'plugins'> | null | void>;
}

interface ConfigEnv {
  command: 'build' | 'serve';
  mode: string;
  isSsrBuild?: boolean;
  isPreview?: boolean;
}
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  config(config, { command, mode }) {
    if (command === 'build') {
      return {
        build: {
          minify: 'terser'
        }
      };
    }
  }
});
```

### Config Resolved Hook

Reads and stores the final resolved configuration.

```typescript { .api }
interface Plugin {
  /**
   * Read and store the final resolved config
   */
  configResolved?: (
    this: MinimalPluginContextWithoutEnvironment,
    config: ResolvedConfig
  ) => void | Promise<void>;
}
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => {
  let config: ResolvedConfig;

  return {
    name: 'my-plugin',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transform(code, id) {
      // Use stored config
      if (config.isProduction) {
        // Production-specific logic
      }
      return code;
    }
  };
};
```

### Configure Server Hook

Configures the development server with custom middlewares and server access.

```typescript { .api }
interface Plugin {
  /**
   * Configure the Vite dev server
   * Can return post hook to run after internal middlewares
   */
  configureServer?: (
    server: ViteDevServer
  ) => (() => void) | void | Promise<(() => void) | void>;
}
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  configureServer(server) {
    // Add middleware before internal middlewares
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/custom') {
        res.end('Custom API response');
        return;
      }
      next();
    });

    // Return post hook for after internal middlewares
    return () => {
      server.middlewares.use((req, res, next) => {
        // Runs after Vite's internal middlewares
        next();
      });
    };
  }
});
```

### Configure Preview Server Hook

Configures the preview server.

```typescript { .api }
interface Plugin {
  /**
   * Configure the preview server
   * Can return post hook to run after other middlewares
   */
  configurePreviewServer?: (
    server: PreviewServer
  ) => (() => void) | void | Promise<(() => void) | void>;
}
```

### Transform Index HTML Hook

Transforms index.html with tag injection or string transformation.

```typescript { .api }
interface Plugin {
  /**
   * Transform index.html
   * Can return transformed HTML string or tag descriptors
   */
  transformIndexHtml?: IndexHtmlTransform;
}

type IndexHtmlTransform =
  | IndexHtmlTransformHook
  | { order?: 'pre' | 'post'; handler: IndexHtmlTransformHook };

type IndexHtmlTransformHook = (
  html: string,
  ctx: IndexHtmlTransformContext
) => IndexHtmlTransformResult | Promise<IndexHtmlTransformResult>;

type IndexHtmlTransformResult =
  | string
  | HtmlTagDescriptor[]
  | { html?: string; tags?: HtmlTagDescriptor[] };

interface IndexHtmlTransformContext {
  /** Public path when served */
  path: string;
  /** Filename on disk */
  filename: string;
  /** Dev server (only during serve) */
  server?: ViteDevServer;
  /** Rollup bundle (only during build) */
  bundle?: OutputBundle;
  /** Output chunk (only during build) */
  chunk?: OutputChunk;
  /** Original request URL */
  originalUrl?: string;
}

interface HtmlTagDescriptor {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string | HtmlTagDescriptor[];
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  transformIndexHtml: {
    order: 'pre',
    handler(html, ctx) {
      // Inject script tag
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: { src: '/my-script.js' },
            injectTo: 'head'
          }
        ]
      };
    }
  }
});
```

### Hot Update Hook

Handles HMR updates with custom filtering and payload sending.

```typescript { .api }
interface Plugin {
  /**
   * Handle HMR updates for a module
   * @experimental - Use environment.hot hook instead
   */
  hotUpdate?: (
    this: MinimalPluginContext & { environment: DevEnvironment },
    options: HotUpdateOptions
  ) => Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>;
}

interface HotUpdateOptions {
  type: 'create' | 'update' | 'delete';
  file: string;
  modules: EnvironmentModuleNode[];
  read: () => string | Promise<string>;
  timestamp: number;
}
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  async hotUpdate({ file, modules, environment }) {
    if (file.endsWith('.custom')) {
      // Filter to specific modules
      const filtered = modules.filter(m =>
        m.id?.includes('specific-part')
      );

      // Or send custom HMR payload
      environment.hot.send({
        type: 'custom',
        event: 'my-event',
        data: { file }
      });

      return [];
    }
  }
});
```

### Resolve ID Hook

Resolves module IDs with custom resolution logic.

```typescript { .api }
interface Plugin {
  /**
   * Resolve module ID
   * Extended with SSR and scan flags
   */
  resolveId?: (
    this: PluginContext,
    source: string,
    importer: string | undefined,
    options: {
      attributes: Record<string, string>;
      custom?: CustomPluginOptions;
      ssr?: boolean;
      scan?: boolean;
      isEntry: boolean;
    }
  ) => ResolveIdResult | Promise<ResolveIdResult>;
}

type ResolveIdResult = string | false | null | undefined | {
  id: string;
  external?: boolean | 'absolute' | 'relative';
  moduleSideEffects?: boolean | 'no-treeshake' | null;
  meta?: CustomPluginOptions | null;
};
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  resolveId(source, importer, { ssr }) {
    if (source === 'virtual-module') {
      return '\0virtual-module';
    }

    if (ssr && source.startsWith('client-only:')) {
      return { id: source, external: true };
    }
  }
});
```

### Load Hook

Loads module content with custom loaders.

```typescript { .api }
interface Plugin {
  /**
   * Load module content
   * Extended with SSR flag
   */
  load?: (
    this: PluginContext,
    id: string,
    options?: { ssr?: boolean }
  ) => LoadResult | Promise<LoadResult>;
}

type LoadResult = string | null | undefined | {
  code: string;
  map?: SourceMap | null;
  meta?: CustomPluginOptions | null;
};
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  load(id) {
    if (id === '\0virtual-module') {
      return {
        code: 'export default "virtual content"',
        map: null
      };
    }
  }
});
```

### Transform Hook

Transforms module code with source maps.

```typescript { .api }
interface Plugin {
  /**
   * Transform module code
   * Extended with SSR flag
   */
  transform?: (
    this: TransformPluginContext,
    code: string,
    id: string,
    options?: { ssr?: boolean }
  ) => TransformResult | Promise<TransformResult>;
}

type TransformResult = string | null | undefined | {
  code: string;
  map?: SourceMap | null;
  meta?: CustomPluginOptions | null;
};
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  transform(code, id, { ssr }) {
    if (id.endsWith('.custom')) {
      const transformed = processCustomFile(code);
      return {
        code: transformed,
        map: null
      };
    }
  }
});
```

### Plugin Ordering

Controls when plugins are applied in the pipeline.

```typescript { .api }
interface Plugin {
  /**
   * Enforce plugin invocation order
   * pre: before core plugins
   * post: after core plugins
   */
  enforce?: 'pre' | 'post';

  /**
   * Apply plugin only for certain commands
   */
  apply?: 'serve' | 'build' | ((config: UserConfig, env: ConfigEnv) => boolean);
}
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  enforce: 'pre', // Run before Vite core plugins
  apply: 'build', // Only apply during build
  transform(code, id) {
    // ...
  }
});
```

### Environment-Specific Application

Controls which environments a plugin applies to.

```typescript { .api }
interface Plugin {
  /**
   * Define environments where plugin should be active
   * By default, plugin is active in all environments
   */
  applyToEnvironment?: (
    environment: PartialEnvironment
  ) => boolean | Promise<boolean> | PluginOption;
}
```

**Usage Example:**

```typescript
const myPlugin = (): Plugin => ({
  name: 'my-plugin',
  applyToEnvironment(environment) {
    // Only apply to client environment
    return environment.name === 'client';
  },
  transform(code, id) {
    // Only runs for client environment
    return code;
  }
});
```

## Types

```typescript { .api }
interface Plugin extends RollupPlugin {
  name: string;
  enforce?: 'pre' | 'post';
  apply?: 'serve' | 'build' | ((config: UserConfig, env: ConfigEnv) => boolean);
  applyToEnvironment?: (environment: PartialEnvironment) => boolean | Promise<boolean> | PluginOption;
  config?: (config: UserConfig, env: ConfigEnv) => Omit<UserConfig, 'plugins'> | null | void | Promise<Omit<UserConfig, 'plugins'> | null | void>;
  configEnvironment?: (name: string, config: EnvironmentOptions, env: ConfigEnv) => EnvironmentOptions | null | void | Promise<EnvironmentOptions | null | void>;
  configResolved?: (config: ResolvedConfig) => void | Promise<void>;
  configureServer?: (server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>;
  configurePreviewServer?: (server: PreviewServer) => (() => void) | void | Promise<(() => void) | void>;
  transformIndexHtml?: IndexHtmlTransform;
  buildApp?: (builder: ViteBuilder) => void | Promise<void>;
  hotUpdate?: (options: HotUpdateOptions) => Array<EnvironmentModuleNode> | void | Promise<Array<EnvironmentModuleNode> | void>;
  handleHotUpdate?: (ctx: HmrContext) => Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>;
  resolveId?: (source: string, importer: string | undefined, options: ResolveIdOptions) => ResolveIdResult | Promise<ResolveIdResult>;
  load?: (id: string, options?: LoadOptions) => LoadResult | Promise<LoadResult>;
  transform?: (code: string, id: string, options?: TransformOptions) => TransformResult | Promise<TransformResult>;
  sharedDuringBuild?: boolean;
  perEnvironmentStartEndDuringDev?: boolean;
  perEnvironmentWatchChangeDuringDev?: boolean;
}

type PluginOption = Plugin | false | null | undefined | PluginOption[];

interface ResolveIdOptions {
  attributes: Record<string, string>;
  custom?: CustomPluginOptions;
  ssr?: boolean;
  scan?: boolean;
  isEntry: boolean;
}

interface LoadOptions {
  ssr?: boolean;
}

interface TransformOptions {
  ssr?: boolean;
}

interface PluginContext {
  meta: PluginContextMeta;
  environment: Environment;
  parse(code: string, options?: any): any;
  resolve(source: string, importer?: string, options?: ResolveOptions): Promise<ResolveIdResult | null>;
  load(options: { id: string; resolveDependencies?: boolean }): Promise<LoadResult>;
  getModuleInfo(id: string): ModuleInfo | null;
  getModuleIds(): IterableIterator<string>;
  addWatchFile(id: string): void;
  getWatchFiles(): string[];
  emitFile(emittedFile: EmittedFile): string;
  setAssetSource(assetReferenceId: string, source: string | Uint8Array): void;
  getFileName(referenceId: string): string;
  warn(warning: string | RollupLog, position?: number | { column: number; line: number }): void;
  error(error: string | RollupError, position?: number | { column: number; line: number }): never;
}

interface TransformPluginContext extends PluginContext {
  getCombinedSourcemap(): SourceMap;
}

interface ConfigPluginContext {
  resolve(id: string, importer?: string, options?: { skipSelf?: boolean }): Promise<string | undefined>;
  meta: Omit<PluginContextMeta, 'watchMode'>;
}

interface MinimalPluginContextWithoutEnvironment {
  meta: PluginContextMeta;
  parse(code: string, options?: any): any;
  resolve(source: string, importer?: string, options?: ResolveOptions): Promise<ResolveIdResult | null>;
  addWatchFile(id: string): void;
  getWatchFiles(): string[];
  warn(warning: string | RollupLog, position?: number | { column: number; line: number }): void;
  error(error: string | RollupError, position?: number | { column: number; line: number }): never;
}

interface PluginContextMeta {
  rollupVersion: string;
  viteVersion: string;
  watchMode: boolean;
}

interface HmrContext {
  file: string;
  timestamp: number;
  modules: ModuleNode[];
  read: () => string | Promise<string>;
  server: ViteDevServer;
}

interface PartialEnvironment {
  name: string;
  config: ResolvedConfig;
  getTopLevelConfig(): ResolvedConfig;
}

interface CustomPluginOptions {
  [key: string]: any;
}

interface SourceMap {
  version: number;
  sources: string[];
  names: string[];
  mappings: string;
  sourcesContent?: string[];
  file?: string;
}
```
