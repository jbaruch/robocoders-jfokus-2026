# Module Runner

The module runner is a standalone runtime for executing Vite-transformed modules outside of the browser. It's primarily used for SSR and can execute code in Node.js, workers, or other JavaScript runtimes with HMR support.

## Capabilities

### Module Runner

Core class for executing transformed modules with caching and HMR support.

```typescript { .api }
/**
 * Module runner for executing transformed modules
 */
class ModuleRunner {
  /** Module evaluation cache */
  evaluatedModules: EvaluatedModules;

  /** HMR client (if enabled) */
  hmrClient?: HMRClient;

  /** Runner options */
  options: ModuleRunnerOptions;

  /** Module evaluator strategy */
  evaluator: ModuleEvaluator;

  /**
   * Create a module runner
   * @param options - Runner configuration
   * @param evaluator - Module evaluation strategy (default: ESModulesEvaluator)
   * @param debug - Debug function
   */
  constructor(
    options: ModuleRunnerOptions,
    evaluator?: ModuleEvaluator,
    debug?: (formatter: unknown, ...args: unknown[]) => void
  );

  /**
   * Import and execute a module
   * @param url - Module URL (file path, server path, or ID relative to root)
   * @returns Promise resolving to module exports
   */
  import<T = any>(url: string): Promise<T>;

  /**
   * Clear all caches including HMR listeners
   */
  clearCache(): void;

  /**
   * Close the runner (clears caches, removes HMR, resets source maps)
   */
  close(): Promise<void>;

  /**
   * Check if runner is closed
   * @returns true if closed
   */
  isClosed(): boolean;
}
```

**Usage Example:**

```typescript
import { ModuleRunner } from 'vite/module-runner';

const runner = new ModuleRunner({
  transport: {
    invoke: async (method, args) => {
      // Communicate with Vite server
      const response = await fetch(`http://localhost:5173/__vite_runner`, {
        method: 'POST',
        body: JSON.stringify({ method, args })
      });
      return response.json();
    }
  },
  hmr: true
});

// Import and execute module
const app = await runner.import('/src/entry-server.ts');
const html = await app.render();

// Clean up
await runner.close();
```

### ESM Evaluator

Default evaluator for ES modules using dynamic import or Function constructor.

```typescript { .api }
/**
 * ESM evaluation strategy
 */
class ESModulesEvaluator implements ModuleEvaluator {
  /** Number of prefixed lines in transformed code */
  startOffset?: number;

  /**
   * Run inlined module code
   * @param context - Module execution context
   * @param code - Transformed code
   * @param module - Module node
   * @returns Promise resolving to module exports
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    module: Readonly<EvaluatedModuleNode>
  ): Promise<any>;

  /**
   * Run externalized module
   * @param file - File URL to external module
   * @returns Promise resolving to module exports
   */
  runExternalModule(file: string): Promise<any>;
}
```

**Usage Example:**

```typescript
import { ModuleRunner, ESModulesEvaluator } from 'vite/module-runner';

const evaluator = new ESModulesEvaluator();
const runner = new ModuleRunner(
  { transport: /* ... */ },
  evaluator
);
```

### Evaluated Modules

Manages the module cache and dependency graph.

```typescript { .api }
/**
 * Module graph manager and cache
 */
class EvaluatedModules {
  /** Map of module ID to module node */
  readonly idToModuleMap: Map<string, EvaluatedModuleNode>;

  /** Map of file path to set of modules */
  readonly fileToModulesMap: Map<string, Set<EvaluatedModuleNode>>;

  /** Map of import URL to module node */
  readonly urlToIdModuleMap: Map<string, EvaluatedModuleNode>;

  /**
   * Get module by ID
   * @param id - Module ID
   * @returns Module node or undefined
   */
  getModuleById(id: string): EvaluatedModuleNode | undefined;

  /**
   * Get all modules for a file path (different query params/hash)
   * @param file - File system path
   * @returns Set of module nodes or undefined
   */
  getModulesByFile(file: string): Set<EvaluatedModuleNode> | undefined;

  /**
   * Get module by URL
   * @param url - Module URL
   * @returns Module node or undefined
   */
  getModuleByUrl(url: string): EvaluatedModuleNode | undefined;

  /**
   * Ensure module exists in graph, create if needed
   * @param id - Module ID
   * @param url - Module URL
   * @returns Module node (existing or new)
   */
  ensureModule(id: string, url: string): EvaluatedModuleNode;

  /**
   * Invalidate a specific module node
   * @param node - Module node to invalidate
   */
  invalidateModule(node: EvaluatedModuleNode): void;

  /**
   * Get inlined source map from module code
   * @param id - Module ID
   * @returns Decoded source map or null
   */
  getModuleSourceMapById(id: string): DecodedMap | null;

  /**
   * Clear all cached modules
   */
  clear(): void;
}
```

**Usage Example:**

```typescript
import { EvaluatedModules, ModuleRunner } from 'vite/module-runner';

// Share cache between multiple runners
const sharedCache = new EvaluatedModules();

const runner1 = new ModuleRunner({
  transport: transport1,
  evaluatedModules: sharedCache
});

const runner2 = new ModuleRunner({
  transport: transport2,
  evaluatedModules: sharedCache
});

// Invalidate specific module
const module = sharedCache.getModuleById('/src/config.ts');
if (module) {
  sharedCache.invalidateModule(module);
}

// Get all modules for a file
const modules = sharedCache.getModulesByFile('/src/app.ts');
modules?.forEach(mod => sharedCache.invalidateModule(mod));
```

### Create Server Module Runner

Creates a module runner connected to a Vite dev server.

```typescript { .api }
/**
 * Create a server-side module runner
 * @param environment - Dev environment to use
 * @param options - Runner options
 * @returns Promise resolving to ModuleRunner instance
 */
function createServerModuleRunner(
  environment: RunnableDevEnvironment,
  options?: ServerModuleRunnerOptions
): Promise<ModuleRunner>;

interface ServerModuleRunnerOptions {
  /** HMR configuration */
  hmr?: boolean | ModuleRunnerHmr;

  /** Source map interceptor */
  sourcemapInterceptor?: false | 'node' | 'prepareStackTrace' | InterceptorOptions;
}
```

**Usage Example:**

```typescript
import { createServer, createServerModuleRunner } from 'vite';

const server = await createServer();
const ssrEnv = server.environments.ssr;

// Create runner connected to server
const runner = await createServerModuleRunner(ssrEnv, {
  hmr: true
});

// Use runner for SSR
const module = await runner.import('/src/entry-server.ts');
const html = await module.render();
```

### Create Server Module Runner Transport

Creates the transport layer for server module runner.

```typescript { .api }
/**
 * Create transport for server module runner
 * @param options - Options containing the hot channel
 * @returns Module runner transport
 */
function createServerModuleRunnerTransport(
  options: { channel: NormalizedServerHotChannel }
): ModuleRunnerTransport;
```

### Fetch Module

Fetches and transforms a module for the module runner.

```typescript { .api }
/**
 * Fetch and transform a module
 * @param environment - Dev environment
 * @param url - Module URL
 * @param importer - Importer module URL
 * @param options - Fetch options
 * @returns Promise resolving to fetch result
 */
function fetchModule(
  environment: DevEnvironment,
  url: string,
  importer?: string,
  options?: FetchModuleOptions
): Promise<FetchResult>;

interface FetchModuleOptions extends FetchFunctionOptions {
  /** Whether module is already cached */
  cached?: boolean;

  /** Start offset for transformed code */
  startOffset?: number;
}
```

### Create Default Import Meta

Creates the default import.meta object for modules.

```typescript { .api }
/**
 * Create default import.meta object
 * @param modulePath - Module file path
 * @returns import.meta object
 */
function createDefaultImportMeta(
  modulePath: string
): ModuleRunnerImportMeta;
```

**Usage Example:**

```typescript
import { createDefaultImportMeta } from 'vite/module-runner';

const importMeta = createDefaultImportMeta('/src/app.ts');
console.log(importMeta.url); // file:///path/to/src/app.ts
console.log(importMeta.env.MODE); // 'development'
```

### Create Node Import Meta

Creates a Node.js-specific import.meta object with resolve capabilities.

```typescript { .api }
/**
 * Create Node.js-specific import.meta object
 * @param modulePath - Module file path
 * @returns Promise resolving to import.meta object with Node features
 */
function createNodeImportMeta(
  modulePath: string
): Promise<ModuleRunnerImportMeta>;
```

**Usage Example:**

```typescript
import { createNodeImportMeta } from 'vite/module-runner';

const importMeta = await createNodeImportMeta('/src/app.ts');

// Use import.meta.resolve (Node.js feature)
const resolved = await importMeta.resolve('./utils.ts');
```

### Create WebSocket Module Runner Transport

Creates WebSocket-based transport for remote module runner.

```typescript { .api }
/**
 * Create WebSocket transport for module runner
 * @param options - WebSocket connection options
 * @returns Module runner transport
 */
function createWebSocketModuleRunnerTransport(
  options: {
    createConnection: () => WebSocket;
    pingInterval?: number;
  }
): Required<Pick<ModuleRunnerTransport, 'connect' | 'disconnect' | 'send'>>;
```

**Usage Example:**

```typescript
import {
  ModuleRunner,
  createWebSocketModuleRunnerTransport
} from 'vite/module-runner';

const transport = createWebSocketModuleRunnerTransport({
  createConnection: () => new WebSocket('ws://localhost:5173'),
  pingInterval: 30000 // Optional ping interval in ms
});

const runner = new ModuleRunner({ transport });
```

### Normalize Module ID

Normalizes module IDs for consistent caching.

```typescript { .api }
/**
 * Normalize module ID
 * @param id - Module ID to normalize
 * @returns Normalized ID
 */
function normalizeModuleId(id: string): string;
```

### SSR Transform Constants

Constants for SSR-transformed module code.

```typescript { .api }
/**
 * Key for SSR dynamic imports in transformed code
 */
const ssrDynamicImportKey: string;

/**
 * Key for SSR export all in transformed code
 */
const ssrExportAllKey: string;

/**
 * Key for SSR export names in transformed code
 */
const ssrExportNameKey: string;

/**
 * Key for SSR imports in transformed code
 */
const ssrImportKey: string;

/**
 * Key for SSR import.meta in transformed code
 */
const ssrImportMetaKey: string;

/**
 * Key for SSR module exports in transformed code
 */
const ssrModuleExportsKey: string;
```

## Types

```typescript { .api }
interface ModuleRunnerOptions {
  /** Transport for server communication */
  transport: ModuleRunnerTransport;

  /** Source map resolution configuration */
  sourcemapInterceptor?: false | 'node' | 'prepareStackTrace' | InterceptorOptions;

  /** HMR configuration */
  hmr?: boolean | ModuleRunnerHmr;

  /** Create import.meta object */
  createImportMeta?: (modulePath: string) => ModuleRunnerImportMeta | Promise<ModuleRunnerImportMeta>;

  /** Custom module cache */
  evaluatedModules?: EvaluatedModules;
}

interface ModuleRunnerTransport {
  /**
   * Invoke method on server
   * @param method - Method name ('fetchModule', 'getBuiltins')
   * @param args - Method arguments
   * @returns Promise resolving to result
   */
  invoke(method: string, args: any[]): Promise<any>;

  /**
   * Connect to server for HMR
   * @param handler - HMR event handler
   */
  connect?(handler: (payload: any) => void): void;

  /**
   * Disconnect from server
   */
  disconnect?(): Promise<void>;
}

interface ModuleRunnerHmr {
  /** HMR logger (false to disable) */
  logger?: false | HMRLogger;
}

interface HMRLogger {
  error(message: string | Error): void;
  debug(...args: any[]): void;
}

interface ModuleEvaluator {
  /** Number of prefixed lines in transformed code */
  startOffset?: number;

  /**
   * Run inlined module code
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    module: Readonly<EvaluatedModuleNode>
  ): Promise<any>;

  /**
   * Run externalized module
   */
  runExternalModule(file: string): Promise<any>;
}

interface ModuleRunnerContext {
  [ssrModuleExportsKey]: Record<string, any>;
  [ssrImportKey]: (id: string, metadata?: DefineImportMetadata) => Promise<any>;
  [ssrDynamicImportKey]: (id: string, options?: ImportCallOptions) => Promise<any>;
  [ssrExportAllKey]: (obj: any) => void;
  [ssrExportNameKey]: (name: string, getter: () => unknown) => void;
  [ssrImportMetaKey]: ModuleRunnerImportMeta;
}

interface ModuleRunnerImportMeta extends ImportMeta {
  url: string;
  env: ImportMetaEnv;
  hot?: ViteHotContext;
  [key: string]: any;
}

interface ImportMetaEnv {
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: any;
}

interface EvaluatedModuleNode {
  /** Module ID */
  id: string;

  /** Module URL */
  url: string;

  /** Module file path */
  file: string | null;

  /** Module metadata */
  meta: ResolvedResult | null;

  /** Module exports */
  exports: Record<string, any> | null;

  /** Whether module is evaluated */
  evaluated: boolean;

  /** Evaluation promise */
  promise: Promise<any> | null;

  /** Module importers */
  importers: Set<string>;

  /** Module imports */
  imports: Set<string>;
}

interface FetchResult {
  /** Transformed code */
  code: string;

  /** Externalized module path */
  externalize?: string;

  /** Module type */
  type?: 'module' | 'commonjs' | 'builtin' | 'network';
}

interface FetchFunctionOptions {
  /** Whether module is cached */
  cached?: boolean;

  /** Start offset for code */
  startOffset?: number;
}

interface InterceptorOptions {
  /** Resolve file contents */
  retrieveFile?: (path: string) => string | null | undefined;

  /** Resolve source map */
  retrieveSourceMap?: (path: string) => {
    url?: string | null;
    map?: any;
  } | null | undefined;
}

interface SSRImportMetadata {
  isDynamicImport?: boolean;
}

interface DefineImportMetadata extends SSRImportMetadata {
  [key: string]: any;
}

interface ViteHotContext {
  /** Persistent data across hot updates */
  data: any;

  /** Accept hot updates */
  accept(): void;
  accept(cb: (mod: any) => void): void;
  accept(dep: string, cb: (mod: any) => void): void;
  accept(deps: string[], cb: (mods: any[]) => void): void;

  /** Accept specific exports */
  acceptExports(exportNames: string | string[], cb?: (mod: any) => void): void;

  /** Cleanup before update */
  dispose(cb: (data: any) => void): void;

  /** Cleanup when removed */
  prune(cb: (data: any) => void): void;

  /** Invalidate module */
  invalidate(message?: string): void;

  /** Listen to HMR events */
  on(event: string, cb: (payload: any) => void): void;

  /** Remove HMR event listener */
  off(event: string, cb: (payload: any) => void): void;

  /** Send custom HMR event */
  send(event: string, data?: any): void;
}

interface RunnableDevEnvironment extends DevEnvironment {
  /** Module runner instance */
  runner: ModuleRunner;
}
```
