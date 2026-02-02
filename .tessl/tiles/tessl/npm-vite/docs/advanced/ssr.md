# Server-Side Rendering

Vite provides comprehensive Server-Side Rendering (SSR) support through module transformation, proper externalization, and the module runner system. SSR in Vite enables rendering application code on the server with proper handling of environment-specific resolution, imports, and hot updates.

## Capabilities

### Fetch Module

Transform and fetch modules for SSR execution using the module runner system.

```typescript { .api }
import { fetchModule } from 'vite';

/**
 * Fetch and transform a module for SSR execution
 * @param environment - Development environment
 * @param url - Module URL to fetch
 * @param importer - Optional importer URL
 * @param options - Fetch options
 * @returns Fetch result with code or externalization info
 * @experimental
 */
function fetchModule(
  environment: DevEnvironment,
  url: string,
  importer?: string,
  options?: FetchModuleOptions
): Promise<FetchResult>;

/**
 * Fetch module options
 */
interface FetchModuleOptions {
  /** Use cached result if available */
  cached?: boolean;
  /** Include inline source map */
  inlineSourceMap?: boolean;
  /** Offset for source map (useful for eval) */
  startOffset?: number;
}

/**
 * Fetch result
 * Either transformed code or externalization info
 */
type FetchResult =
  | {
      /** Transformed code */
      code: string;
      /** Resolved file path */
      file: string | null;
      /** Resolved module ID */
      id: string;
      /** Module URL */
      url: string;
      /** Whether module cache should be invalidated */
      invalidate: boolean;
    }
  | {
      /** Module is cached on server */
      cache: true;
    }
  | {
      /** External URL to use */
      externalize: string;
      /** Type of external module */
      type: 'builtin' | 'network' | 'module' | 'commonjs';
    };
```

**Usage Example:**

```typescript
import { fetchModule } from 'vite';

// In SSR environment
const environment = server.environments.ssr;

// Fetch and transform a module
const result = await fetchModule(
  environment,
  '/src/App.tsx',
  undefined,
  { inlineSourceMap: true }
);

if ('code' in result) {
  // Module was transformed
  console.log('Transformed code:', result.code);
  console.log('Module ID:', result.id);
} else if ('externalize' in result) {
  // Module should be externalized
  console.log('External module:', result.externalize);
  console.log('Type:', result.type);
}
```

### Server Module Runner

Create a module runner for executing transformed modules on the server.

```typescript { .api }
import { createServerModuleRunner } from 'vite';

/**
 * Create a server-side module runner
 * Executes modules in the current Node.js process
 * @param environment - Development environment
 * @param options - Module runner options
 * @returns Module runner instance
 * @experimental
 */
function createServerModuleRunner(
  environment: DevEnvironment,
  options?: Partial<ServerModuleRunnerOptions>
): Promise<ModuleRunner>;

/**
 * Server module runner options
 */
interface ServerModuleRunnerOptions {
  /** Custom fetch function */
  fetchFunction?: FetchFunction;
  /** HMR configuration */
  hmr?: {
    /** Connection timeout */
    timeout?: number;
    /** Enable HMR */
    enabled?: boolean;
  };
  /** Source map interceptor options */
  sourcemapInterceptor?: InterceptorOptions;
}
```

**Usage Example:**

```typescript
import { createServerModuleRunner } from 'vite';

const environment = server.environments.ssr;

// Create module runner
const runner = await createServerModuleRunner(environment, {
  hmr: {
    enabled: true,
    timeout: 5000
  }
});

// Import and execute a module
const module = await runner.import('/src/App.tsx');
console.log('Module exports:', Object.keys(module));

// Use the module
const html = await module.render();

// Clean up when done
await runner.destroy();
```

### Server Module Runner Transport

Create transport for communication between server and module runner.

```typescript { .api }
import { createServerModuleRunnerTransport } from 'vite';

/**
 * Create transport for server module runner
 * Handles communication for module fetching and HMR
 * @param options - Transport options
 * @returns Transport handlers
 * @experimental
 */
function createServerModuleRunnerTransport(
  options: {
    /** Hot channel for HMR */
    channel: NormalizedServerHotChannel;
  }
): ModuleRunnerTransport;

/**
 * Transport handlers for module runner
 */
interface ModuleRunnerTransportHandlers {
  /** Fetch a module */
  fetchModule: (
    id: string,
    importer?: string,
    options?: FetchModuleOptions
  ) => Promise<FetchResult>;
}
```

### SSR Configuration

Configure SSR-specific behavior and module resolution.

```typescript { .api }
/**
 * SSR configuration options
 */
interface SSROptions {
  /**
   * Dependencies to externalize for SSR
   * These will not be transformed by Vite
   */
  external?: string[];

  /**
   * Dependencies to NOT externalize
   * These will be transformed by Vite even if in node_modules
   */
  noExternal?: string | RegExp | (string | RegExp)[] | true;

  /**
   * SSR target environment
   * @default 'node'
   */
  target?: 'node' | 'webworker';

  /**
   * Module resolution configuration for SSR
   */
  resolve?: {
    /**
     * Export conditions for SSR resolution
     * @default defaultServerConditions
     */
    conditions?: string[];

    /**
     * Export conditions for external dependencies
     * @default defaultExternalConditions
     */
    externalConditions?: string[];
  };

  /**
   * Dependency optimization for SSR
   * @experimental
   */
  optimizeDeps?: SsrDepOptimizationConfig;
}

/**
 * Resolved SSR options (internal)
 */
interface ResolvedSSROptions {
  target: 'node' | 'webworker';
  external: string[];
  noExternal: string | RegExp | (string | RegExp)[] | true;
  resolve: {
    conditions: string[];
    externalConditions: string[];
  };
  optimizeDeps?: DepOptimizationOptions;
}
```

**Configuration Example:**

```typescript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  ssr: {
    // Target Node.js
    target: 'node',

    // Externalize these dependencies
    external: [
      'express',
      'compression'
    ],

    // Don't externalize these (transform with Vite)
    noExternal: [
      '@my-org/shared-ui',
      /^@my-scope\//
    ],

    // SSR module resolution
    resolve: {
      conditions: ['node', 'import', 'module', 'default'],
      externalConditions: ['node']
    },

    // SSR dependency optimization (experimental)
    optimizeDeps: {
      enabled: true,
      include: ['heavy-library']
    }
  }
});
```

### SSR Target

Specify the target environment for SSR.

**Node.js Target:**

```typescript
export default defineConfig({
  ssr: {
    target: 'node'
  }
});
```

**Web Worker Target:**

```typescript
export default defineConfig({
  ssr: {
    target: 'webworker',
    noExternal: true // Usually externalize nothing for workers
  }
});
```

### SSR External Dependencies

Control which dependencies are externalized vs. transformed.

**Externalize Node.js Dependencies:**

```typescript
export default defineConfig({
  ssr: {
    // These will use require() in output
    external: [
      'express',
      'fs-extra',
      'compression'
    ]
  }
});
```

**Transform Workspace Packages:**

```typescript
export default defineConfig({
  ssr: {
    // Transform all @my-org/* packages
    noExternal: [
      /^@my-org\//
    ]
  }
});
```

**Transform Everything:**

```typescript
export default defineConfig({
  ssr: {
    // Bundle everything for edge runtimes
    noExternal: true,
    external: [] // Override defaults
  }
});
```

### SSR Module Resolution

Configure how modules are resolved in SSR context.

```typescript
export default defineConfig({
  ssr: {
    resolve: {
      // Export conditions for SSR imports
      conditions: [
        'node',      // Prefer node exports
        'import',    // Use ESM exports
        'module',    // Fallback to module field
        'default'    // Final fallback
      ],

      // Conditions for externalized dependencies
      externalConditions: [
        'node',
        'require'  // Use CJS for externalized deps
      ]
    }
  }
});
```

### SSR Transform

The module runner automatically handles SSR transformation, but you can also transform code manually.

```typescript
// In a plugin or custom tool
{
  name: 'custom-ssr-transform',
  async transform(code, id, options) {
    // Check if this is SSR
    if (options?.ssr) {
      // Apply SSR-specific transformations
      return {
        code: transformForSSR(code),
        map: null
      };
    }
  }
}
```

### SSR with Module Runner

Complete example of SSR rendering with the module runner.

**Server Setup:**

```typescript
import { createServer } from 'vite';
import { createServerModuleRunner } from 'vite';
import express from 'express';

async function createSSRServer() {
  const app = express();

  // Create Vite dev server
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    environments: {
      ssr: {
        // SSR environment config
        resolve: {
          conditions: ['node']
        }
      }
    }
  });

  app.use(vite.middlewares);

  // Create module runner for SSR environment
  const runner = await createServerModuleRunner(
    vite.environments.ssr
  );

  app.use('*', async (req, res) => {
    try {
      // 1. Read index.html
      let template = await fs.readFile('./index.html', 'utf-8');

      // 2. Apply Vite HTML transforms
      template = await vite.transformIndexHtml(req.originalUrl, template);

      // 3. Load and render the app using module runner
      const { render } = await runner.import('/src/entry-server.js');
      const html = await render(req.originalUrl);

      // 4. Inject rendered HTML into template
      const finalHtml = template.replace('<!--ssr-outlet-->', html);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      res.status(500).end(e.stack);
    }
  });

  app.listen(3000);
}

createSSRServer();
```

**Entry Server:**

```typescript
// src/entry-server.ts
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(url: string) {
  const html = renderToString(<App url={url} />);
  return html;
}
```

### SSR with HMR

The module runner supports HMR in SSR context.

```typescript
// Module runner automatically handles HMR
const runner = await createServerModuleRunner(environment, {
  hmr: {
    enabled: true
  }
});

// Re-import on updates
runner.import('/src/App.tsx').then(mod => {
  // Module is always up-to-date
});

// HMR updates happen automatically
// No manual invalidation needed
```

### SSR Build

Build for SSR with proper externalization.

```typescript
// vite.config.js
export default defineConfig({
  build: {
    // Build SSR bundle
    ssr: true,

    // Output directory for SSR build
    outDir: 'dist/server',

    rollupOptions: {
      // SSR entry point
      input: 'src/entry-server.ts',

      // Preserve dynamic imports
      output: {
        format: 'esm'
      }
    }
  }
});
```

**Build Command:**

```bash
# Build SSR
vite build --ssr

# Build both client and server
vite build && vite build --ssr
```

## Types

### SSR Target Type

```typescript { .api }
/**
 * SSR target environment
 */
type SSRTarget = 'node' | 'webworker';
```

### Development Environment

```typescript { .api }
/**
 * Development environment for SSR
 * Provides module transformation and graph management
 */
interface DevEnvironment {
  /** Environment name */
  name: string;

  /** Resolved configuration */
  config: ResolvedConfig;

  /** Module graph for this environment */
  moduleGraph: EnvironmentModuleGraph;

  /** Transform a request */
  transformRequest(
    url: string,
    options?: TransformOptions
  ): Promise<TransformResult | null>;

  /** Warmup frequently used files */
  warmupRequest(url: string): Promise<void>;
}
```

### Module Runner Types

See [Module Runner](./module-runner.md) documentation for complete module runner type definitions.

```typescript { .api }
/**
 * Module runner for executing transformed modules
 */
class ModuleRunner {
  /** Import and execute a module */
  import(url: string): Promise<any>;

  /** Destroy the runner */
  destroy(): Promise<void>;
}

/**
 * Fetch function for module runner
 */
type FetchFunction = (
  id: string,
  importer?: string,
  options?: FetchModuleOptions
) => Promise<FetchResult>;
```

### Transform Options

```typescript { .api }
/**
 * Transform options
 */
interface TransformOptions {
  /** Transform for SSR */
  ssr?: boolean;
  /** HTML proxy transform */
  html?: boolean;
}

/**
 * Transform result
 */
interface TransformResult {
  /** Transformed code */
  code: string;
  /** Source map */
  map: SourceMap | null;
  /** ETag for caching */
  etag?: string;
  /** Module dependencies */
  deps?: string[];
  /** Dynamic dependencies */
  dynamicDeps?: string[];
}
```
