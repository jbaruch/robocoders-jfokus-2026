# Preview Server

The preview server allows you to locally preview production builds before deployment. It serves the built files from the output directory with production-like behavior including compression and proper MIME types.

## Capabilities

### Create Preview Server

Starts a preview server to serve production build files.

```typescript { .api }
/**
 * Create a preview server for production builds
 * @param inlineConfig - Configuration object to merge with config file
 * @returns Promise resolving to PreviewServer instance
 */
function preview(
  inlineConfig?: InlineConfig
): Promise<PreviewServer>;
```

**Usage Example:**

```typescript
import { preview } from 'vite';

// Start preview server with default settings
const server = await preview();
server.printUrls();

// Start with custom configuration
const server = await preview({
  preview: {
    port: 4173,
    host: true,
    open: true
  }
});

// Close when done
await server.close();
```

### Server Lifecycle

Controls preview server startup and shutdown.

```typescript { .api }
interface PreviewServer {
  /**
   * Stop the server
   */
  close(): Promise<void>;

  /**
   * Print server URLs to console
   */
  printUrls(): void;

  /**
   * Open browser to server URL
   */
  openBrowser?(): void;
}
```

**Usage Example:**

```typescript
const server = await preview({
  preview: {
    port: 4173
  }
});

server.printUrls();

// Programmatically shut down
setTimeout(async () => {
  await server.close();
}, 60000);
```

### Middleware Management

Attaches custom middlewares to the preview server.

```typescript { .api }
interface PreviewServer {
  /**
   * Connect app instance for custom middlewares
   */
  middlewares: Connect.Server;

  /**
   * Native Node HTTP server instance
   */
  httpServer: HttpServer;
}
```

**Usage Example:**

```typescript
import { preview } from 'vite';

const server = await preview();

// Add custom middleware
server.middlewares.use('/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
});

// Add authentication middleware
server.middlewares.use((req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || auth !== 'Bearer secret-token') {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized');
    return;
  }
  next();
});
```

### CLI Shortcuts

Binds keyboard shortcuts for CLI interactions.

```typescript { .api }
interface PreviewServer {
  /**
   * Bind CLI shortcuts
   * @param options - Shortcut configuration options
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void;
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

### Server URLs

Access to resolved server URLs for programmatic use.

```typescript { .api }
interface PreviewServer {
  /**
   * Resolved server URLs (null if not listening)
   */
  resolvedUrls: ResolvedServerUrls | null;
}

interface ResolvedServerUrls {
  /** Local URLs (localhost, 127.0.0.1) */
  local: string[];

  /** Network URLs (LAN IP addresses) */
  network: string[];
}
```

**Usage Example:**

```typescript
const server = await preview();

if (server.resolvedUrls) {
  console.log('Local:', server.resolvedUrls.local);
  console.log('Network:', server.resolvedUrls.network);
}
```

### Configuration Access

Access to resolved Vite configuration.

```typescript { .api }
interface PreviewServer {
  /**
   * The resolved Vite config object
   */
  config: ResolvedConfig;
}
```

## Types

```typescript { .api }
interface PreviewServer {
  /** Resolved Vite configuration */
  config: ResolvedConfig;

  /** Connect app instance for middlewares */
  middlewares: Connect.Server;

  /** Native Node HTTP server instance */
  httpServer: HttpServer;

  /** Resolved server URLs (null if not listening) */
  resolvedUrls: ResolvedServerUrls | null;

  /** Stop the server */
  close(): Promise<void>;

  /** Print server URLs */
  printUrls(): void;

  /** Bind CLI shortcuts */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void;
}

interface PreviewOptions extends CommonServerOptions {
  // Inherits all CommonServerOptions
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

interface ResolvedPreviewOptions {
  port: number;
  strictPort: boolean;
  host?: string | boolean;
  allowedHosts?: string[];
  https?: boolean | HttpsOptions;
  open?: boolean | string;
  proxy?: Record<string, string | ProxyOptions>;
  cors?: boolean | CorsOptions;
  headers?: OutgoingHttpHeaders;
}

interface HttpsOptions {
  key?: string;
  cert?: string;
  pfx?: string;
  passphrase?: string;
}

interface ProxyOptions {
  target: string;
  changeOrigin?: boolean;
  ws?: boolean;
  rewrite?: (path: string) => string;
  configure?: (proxy: any, options: ProxyOptions) => void;
}

interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

type HttpServer = http.Server | http2.Http2SecureServer;

interface OutgoingHttpHeaders {
  [header: string]: number | string | string[] | undefined;
}

type PreviewServerHook = (
  this: MinimalPluginContextWithoutEnvironment,
  server: PreviewServer
) => (() => void) | void | Promise<(() => void) | void>;
```
