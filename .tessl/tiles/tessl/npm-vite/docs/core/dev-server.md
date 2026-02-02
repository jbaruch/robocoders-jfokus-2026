# Development Server

Vite's development server provides fast, on-demand compilation with Hot Module Replacement (HMR) support. It creates an HTTP server that transforms files as they're requested, enabling instant updates during development.

## Capabilities

### Create Development Server

Creates a Vite development server instance with full HMR support and middleware capabilities.

```typescript { .api }
/**
 * Creates a Vite development server
 * @param inlineConfig - Configuration object or resolved configuration
 * @returns Promise resolving to ViteDevServer instance
 */
function createServer(
  inlineConfig?: InlineConfig | ResolvedConfig
): Promise<ViteDevServer>;
```

**Usage Example:**

```typescript
import { createServer } from 'vite';

// Create server with default configuration
const server = await createServer();
await server.listen();

// Create server with custom configuration
const server = await createServer({
  root: process.cwd(),
  server: {
    port: 3000,
    host: 'localhost'
  }
});

await server.listen();
server.printUrls();
```

### Transform Request

Programmatically resolves, loads, and transforms a URL without going through the HTTP request pipeline.

```typescript { .api }
interface ViteDevServer {
  /**
   * Programmatically resolve, load and transform a URL
   * @param url - Module URL to transform
   * @param options - Transform options
   * @returns Promise resolving to transform result or null
   */
  transformRequest(
    url: string,
    options?: TransformOptions
  ): Promise<TransformResult | null>;
}
```

**Usage Example:**

```typescript
const result = await server.transformRequest('/src/main.ts', {
  ssr: false
});

if (result) {
  console.log(result.code);
  console.log(result.map);
}
```

### Warmup Request

Pre-transforms URLs to cache them for future requests. Never throws errors, handling them internally.

```typescript { .api }
interface ViteDevServer {
  /**
   * Warm up URLs so next request will be cached
   * @param url - Module URL to warmup
   * @param options - Transform options
   */
  warmupRequest(url: string, options?: TransformOptions): Promise<void>;
}
```

**Usage Example:**

```typescript
// Pre-transform commonly used modules
await server.warmupRequest('/src/utils/helpers.ts');
await server.warmupRequest('/src/components/Button.tsx');
```

### Transform HTML

Applies Vite's built-in HTML transforms and plugin HTML transforms.

```typescript { .api }
interface ViteDevServer {
  /**
   * Apply built-in and plugin HTML transforms
   * @param url - Request URL
   * @param html - HTML content to transform
   * @param originalUrl - Original URL before transformations
   * @returns Promise resolving to transformed HTML
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string
  ): Promise<string>;
}
```

### SSR Module Loading

Loads and executes modules for server-side rendering.

```typescript { .api }
interface ViteDevServer {
  /**
   * Load a URL as an instantiated module for SSR
   * @param url - Module URL to load
   * @param opts - Loading options
   * @returns Promise resolving to module exports
   */
  ssrLoadModule(
    url: string,
    opts?: { fixStacktrace?: boolean }
  ): Promise<Record<string, any>>;

  /**
   * Transform module code into SSR format
   * @param code - Source code to transform
   * @param inMap - Input source map
   * @param url - Module URL
   * @param originalCode - Original untransformed code
   * @returns Promise resolving to transform result
   */
  ssrTransform(
    code: string,
    inMap: SourceMap | { mappings: '' } | null,
    url: string,
    originalCode?: string
  ): Promise<TransformResult | null>;

  /**
   * Fix SSR error stacktraces (mutates error)
   * @param e - Error to fix
   */
  ssrFixStacktrace(e: Error): void;

  /**
   * Rewrite SSR stacktrace
   * @param stack - Stack string to rewrite
   * @returns Fixed stack string
   */
  ssrRewriteStacktrace(stack: string): string;
}

interface SourceMap {
  file?: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent?: string[];
  version: number;
}
```

**Usage Example:**

```typescript
// Load an SSR module
const module = await server.ssrLoadModule('/src/App.tsx');
const html = renderToString(module.default);
```

### Server Lifecycle

Controls server startup, shutdown, and restarts.

```typescript { .api }
interface ViteDevServer {
  /**
   * Start the server
   * @param port - Port to listen on (optional)
   * @param isRestart - Whether this is a restart
   * @returns Promise resolving to server instance
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>;

  /**
   * Stop the server
   */
  close(): Promise<void>;

  /**
   * Restart the server
   * @param forceOptimize - Force optimizer to re-bundle
   */
  restart(forceOptimize?: boolean): Promise<void>;

  /**
   * Print server URLs to console
   */
  printUrls(): void;

  /**
   * Open browser to server URL
   */
  openBrowser(): void;
}
```

**Usage Example:**

```typescript
// Start server
const server = await createServer();
await server.listen(3000);
server.printUrls();

// Restart server (e.g., after config change)
await server.restart(true);

// Shutdown
await server.close();
```

### Hot Module Replacement

Triggers HMR updates for modules.

```typescript { .api }
interface ViteDevServer {
  /**
   * Trigger HMR for a module
   * @param module - Module node to reload
   */
  reloadModule(module: ModuleNode): Promise<void>;
}
```

**Usage Example:**

```typescript
// Get module from graph and trigger HMR
const module = server.moduleGraph.getModuleById('/src/App.tsx');
if (module) {
  await server.reloadModule(module);
}
```

### Middleware Management

Attaches custom middlewares to the development server.

```typescript { .api }
interface ViteDevServer {
  /**
   * Connect app instance for attaching custom middlewares
   */
  middlewares: Connect.Server;
}
```

**Usage Example:**

```typescript
import type { Connect } from 'vite';

const server = await createServer();

// Add custom middleware
server.middlewares.use('/api', (req, res, next) => {
  if (req.url === '/hello') {
    res.end('Hello from custom middleware');
  } else {
    next();
  }
});
```

### CLI Shortcuts

Binds keyboard shortcuts for CLI interactions.

```typescript { .api }
interface ViteDevServer {
  /**
   * Bind CLI shortcuts
   * @param options - Shortcut configuration options
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void;
}

interface BindCLIShortcutsOptions<Server> {
  /**
   * Print custom shortcuts hint
   */
  print?: boolean;
  /**
   * Custom shortcuts to add
   */
  customShortcuts?: CLIShortcut<Server>[];
}

interface CLIShortcut<Server> {
  key: string;
  description: string;
  action(server: Server): void | Promise<void>;
}
```

### Wait for Requests

Waits until all static imports are processed to avoid race conditions.

```typescript { .api }
interface ViteDevServer {
  /**
   * Wait until all static imports are processed
   * @param ignoredId - ID to ignore to avoid deadlocks in plugin hooks
   * @returns Promise that resolves when requests are idle
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>;
}
```

## Types

```typescript { .api }
interface ViteDevServer {
  /** The resolved Vite config object */
  config: ResolvedConfig;

  /** Connect app instance for middlewares */
  middlewares: Connect.Server;

  /** Native Node HTTP server instance (null in middleware mode) */
  httpServer: HttpServer | null;

  /** Chokidar file system watcher */
  watcher: FSWatcher;

  /** WebSocket server for HMR */
  ws: WebSocketServer;

  /** HMR hot channel (alias to environments.client.hot) */
  hot: NormalizedHotChannel;

  /** Plugin container for running plugin hooks */
  pluginContainer: PluginContainer;

  /** Module execution environments (client, ssr, custom) */
  environments: Record<'client' | 'ssr' | (string & {}), DevEnvironment>;

  /** Module graph tracking imports and HMR state */
  moduleGraph: ModuleGraph;

  /** Resolved server URLs (null in middleware mode) */
  resolvedUrls: ResolvedServerUrls | null;
}

interface ResolvedServerUrls {
  /** Local URLs (localhost, 127.0.0.1) */
  local: string[];
  /** Network URLs (LAN IP addresses) */
  network: string[];
}

interface ServerOptions extends CommonServerOptions {
  /** HMR configuration */
  hmr?: HmrOptions | boolean;

  /** Disable WebSocket connection */
  ws?: false;

  /** Warm-up files configuration */
  warmup?: {
    /** Files for client-side (glob patterns) */
    clientFiles?: string[];
    /** Files for SSR (glob patterns) */
    ssrFiles?: string[];
  };

  /** Chokidar watch options (null to disable) */
  watch?: WatchOptions | null;

  /** Middleware mode configuration */
  middlewareMode?: boolean | {
    /** Parent server for WebSocket proxying */
    server: HttpServer;
  };

  /** File system serve options */
  fs?: FileSystemServeOptions;

  /** Origin for asset URLs */
  origin?: string;

  /** Source map ignore list predicate */
  sourcemapIgnoreList?: false | ((sourcePath: string, sourcemapPath: string) => boolean);

  /** Environments to trigger hot updates */
  hotUpdateEnvironments?: string[];
}

interface CommonServerOptions {
  /** Server port */
  port?: number;

  /** Enable HTTPS */
  https?: boolean | HttpsOptions;

  /** Server host */
  host?: string | boolean;

  /** Allowed hosts for host validation */
  allowedHosts?: string[];

  /** Open browser on startup */
  open?: boolean | string;

  /** Proxy configuration */
  proxy?: Record<string, string | ProxyOptions>;

  /** Enable CORS */
  cors?: boolean | CorsOptions;

  /** Custom headers */
  headers?: OutgoingHttpHeaders;

  /** Exit if port is already in use */
  strictPort?: boolean;
}

interface FileSystemServeOptions {
  /** Strictly restrict file access outside allowed paths */
  strict?: boolean;

  /** Allowed directories (absolute or relative to root) */
  allow?: string[];

  /** Denied file patterns (picomatch patterns) */
  deny?: string[];
}

interface TransformOptions {
  /** Transform for SSR */
  ssr?: boolean;

  /** HTML transformation */
  html?: boolean;
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

interface HmrOptions {
  /** HMR protocol */
  protocol?: string;

  /** HMR host */
  host?: string;

  /** HMR port */
  port?: number;

  /** HMR client path */
  clientPort?: number;

  /** HMR URL path */
  path?: string;

  /** HMR timeout */
  timeout?: number;

  /** HMR overlay */
  overlay?: boolean;

  /** HMR server */
  server?: HttpServer;
}

type HttpServer = http.Server | http2.Http2SecureServer;

interface HttpsOptions {
  key?: string;
  cert?: string;
  pfx?: string;
  passphrase?: string;
}

interface FSWatcher {
  add(file: string | ReadonlyArray<string>): FSWatcher;
  unwatch(file: string | ReadonlyArray<string>): FSWatcher;
  on(event: string, listener: (...args: any[]) => void): FSWatcher;
  close(): Promise<void>;
}

interface WatchOptions {
  ignored?: any;
  persistent?: boolean;
  ignoreInitial?: boolean;
  followSymlinks?: boolean;
  cwd?: string;
  disableGlobbing?: boolean;
  usePolling?: boolean;
  interval?: number;
  binaryInterval?: number;
  alwaysStat?: boolean;
  depth?: number;
  awaitWriteFinish?: {
    stabilityThreshold?: number;
    pollInterval?: number;
  };
  ignorePermissionErrors?: boolean;
  atomic?: boolean | number;
}
```
