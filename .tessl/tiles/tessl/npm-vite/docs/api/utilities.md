# Utilities

Vite provides a comprehensive set of utility functions for common operations including path normalization, configuration merging, file filtering, logging, and module resolution. These utilities are used internally by Vite and are also available for plugins and custom tools.

## Capabilities

### Path Normalization

Normalize file system paths for cross-platform compatibility.

```typescript { .api }
import { normalizePath } from 'vite';

/**
 * Normalize file system path to use forward slashes
 * Converts Windows backslashes to forward slashes
 * @param id - File path or module ID
 * @returns Normalized path with forward slashes
 */
function normalizePath(id: string): string;
```

**Usage Example:**

```typescript
import { normalizePath } from 'vite';

// Windows path
const winPath = 'C:\\Users\\name\\project\\src\\index.js';
console.log(normalizePath(winPath));
// Output: C:/Users/name/project/src/index.js

// Already normalized path (unchanged)
const posixPath = '/home/user/project/src/index.js';
console.log(normalizePath(posixPath));
// Output: /home/user/project/src/index.js
```

### Configuration Merging

Merge Vite configuration objects with proper handling of arrays and nested objects.

```typescript { .api }
import { mergeConfig } from 'vite';

/**
 * Merge two Vite configuration objects
 * Arrays are concatenated, objects are deeply merged
 * @param defaults - Default configuration
 * @param overrides - Configuration overrides
 * @param isRoot - Whether this is root config merge
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
import { mergeConfig, defineConfig } from 'vite';

const baseConfig = defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist'
  }
});

const prodConfig = defineConfig({
  plugins: [compression()],
  build: {
    minify: 'terser',
    sourcemap: true
  }
});

// Merge configurations
const finalConfig = mergeConfig(baseConfig, prodConfig);
// Result: {
//   plugins: [vue(), compression()],
//   build: {
//     outDir: 'dist',
//     minify: 'terser',
//     sourcemap: true
//   }
// }
```

### Alias Merging

Merge alias configurations from multiple sources.

```typescript { .api }
import { mergeAlias } from 'vite';

/**
 * Merge two alias configurations
 * @param a - First alias config
 * @param b - Second alias config
 * @returns Merged alias config
 */
function mergeAlias(
  a?: AliasOptions,
  b?: AliasOptions
): AliasOptions | undefined;
```

**Usage Example:**

```typescript
import { mergeAlias } from 'vite';

const baseAliases = {
  '@': '/src',
  '@components': '/src/components'
};

const extraAliases = {
  '@utils': '/src/utils',
  '@': '/custom-src' // Override
};

const merged = mergeAlias(baseAliases, extraAliases);
// Result: {
//   '@': '/custom-src',
//   '@components': '/src/components',
//   '@utils': '/src/utils'
// }
```

### File Filtering

Create filter functions for testing file paths against include/exclude patterns.

```typescript { .api }
import { createFilter } from 'vite';

/**
 * Create a filter function from include/exclude patterns
 * @param include - Patterns to include
 * @param exclude - Patterns to exclude
 * @param options - Filter options
 * @returns Filter function that returns true if ID matches
 */
function createFilter(
  include?: FilterPattern,
  exclude?: FilterPattern,
  options?: {
    /** Resolve relative paths against this directory */
    resolve?: string | false | null;
  }
): (id: string | unknown) => boolean;

/**
 * Filter pattern type
 * Can be a string, RegExp, or array of either
 */
type FilterPattern =
  | ReadonlyArray<string | RegExp>
  | string
  | RegExp
  | null;
```

**Usage Example:**

```typescript
import { createFilter } from 'vite';

// Create filter with include and exclude patterns
const filter = createFilter(
  ['**/*.js', '**/*.ts'],
  ['**/*.test.ts', 'node_modules/**']
);

console.log(filter('/src/index.ts'));        // true
console.log(filter('/src/index.test.ts'));   // false
console.log(filter('/node_modules/lib.js')); // false

// With RegExp patterns
const jsFilter = createFilter(
  /\.jsx?$/,
  /node_modules/
);

console.log(jsFilter('/src/App.jsx'));       // true
console.log(jsFilter('/src/App.tsx'));       // false

// Resolve relative paths
const resolvedFilter = createFilter(
  ['*.config.js'],
  null,
  { resolve: '/project' }
);
```

### CSS Request Detection

Check if a request is for a CSS file.

```typescript { .api }
import { isCSSRequest } from 'vite';

/**
 * Check if a request is for CSS
 * Checks for .css, .scss, .sass, .less, .styl, .stylus, .pcss, .sss extensions
 * @param request - Request URL or file path
 * @returns True if request is for CSS
 */
function isCSSRequest(request: string): boolean;
```

**Usage Example:**

```typescript
import { isCSSRequest } from 'vite';

console.log(isCSSRequest('/src/styles.css'));      // true
console.log(isCSSRequest('/src/styles.scss'));     // true
console.log(isCSSRequest('/src/styles.module.css')); // true
console.log(isCSSRequest('/src/component.tsx'));   // false
console.log(isCSSRequest('/src/styles.css?raw'));  // true (includes query)
```

### Logger Creation

Create configured logger instances for consistent logging.

```typescript { .api }
import { createLogger } from 'vite';

/**
 * Create a logger instance
 * @param level - Log level to use
 * @param options - Logger options
 * @returns Logger instance
 */
function createLogger(
  level?: LogLevel,
  options?: LoggerOptions
): Logger;

/**
 * Log level
 */
type LogLevel = 'info' | 'warn' | 'error' | 'silent';

/**
 * Logger options
 */
interface LoggerOptions {
  /** Prefix for log messages */
  prefix?: string;
  /** Allow clearing the screen */
  allowClearScreen?: boolean;
  /** Custom log output function */
  customLogger?: Logger;
}

/**
 * Logger interface
 */
interface Logger {
  /** Log info message */
  info(msg: string, options?: LogOptions): void;
  /** Log warning message */
  warn(msg: string, options?: LogOptions): void;
  /** Log error message */
  error(msg: string, options?: LogErrorOptions): void;
  /** Clear screen if allowed */
  clearScreen(type: LogType): void;
  /** Check if level is active */
  hasErrorLogged(error: Error | RollupError): boolean;
  /** Check if warnings have been logged */
  hasWarned: boolean;
}

/**
 * Log options
 */
interface LogOptions {
  /** Clear screen before logging */
  clear?: boolean;
  /** Include timestamp */
  timestamp?: boolean;
}

/**
 * Error log options
 */
interface LogErrorOptions extends LogOptions {
  /** Error object */
  error?: Error | RollupError | null;
}

type LogType = 'info' | 'warn' | 'error';
```

**Usage Example:**

```typescript
import { createLogger } from 'vite';

// Create logger with custom level
const logger = createLogger('warn', {
  prefix: '[my-plugin]'
});

logger.info('This will not be logged'); // Silent (level is warn)
logger.warn('Warning message');          // Logged
logger.error('Error message');           // Logged

// With options
logger.info('Server started', {
  clear: true,
  timestamp: true
});

// Custom logger
const customLogger = createLogger('info', {
  customLogger: {
    info(msg, options) {
      console.log('[CUSTOM]', msg);
    },
    warn(msg, options) {
      console.warn('[CUSTOM]', msg);
    },
    error(msg, options) {
      console.error('[CUSTOM]', msg);
    },
    clearScreen() {},
    hasErrorLogged() { return false; },
    hasWarned: false
  }
});
```

### File Sending

Send file responses with proper headers and caching.

```typescript { .api }
import { send } from 'vite';

/**
 * Send file response with proper headers
 * @param req - HTTP request
 * @param res - HTTP response
 * @param content - File content
 * @param type - Content type
 * @param options - Send options
 */
function send(
  req: IncomingMessage,
  res: ServerResponse,
  content: string | Buffer,
  type: string,
  options: SendOptions
): void;

/**
 * Send options
 */
interface SendOptions {
  /** ETag for caching */
  etag?: string;
  /** Cache control header */
  cacheControl?: string;
  /** Content headers */
  headers?: OutgoingHttpHeaders;
  /** Map for source maps */
  map?: SourceMap | null;
}
```

**Usage Example:**

```typescript
import { send } from 'vite';

// In a middleware
app.use((req, res, next) => {
  if (req.url === '/custom.js') {
    const code = 'console.log("Hello");';

    send(req, res, code, 'application/javascript', {
      etag: getHash(code),
      cacheControl: 'no-cache',
      headers: {
        'X-Custom-Header': 'value'
      }
    });
  } else {
    next();
  }
});
```

### Workspace Root Search

Find the workspace root directory.

```typescript { .api }
import { searchForWorkspaceRoot } from 'vite';

/**
 * Search for workspace root directory
 * Looks for workspace indicators like .git, pnpm-workspace.yaml, etc.
 * @param current - Current directory to start search from
 * @param root - Project root directory
 * @returns Workspace root path
 */
function searchForWorkspaceRoot(
  current: string,
  root?: string
): string;
```

**Usage Example:**

```typescript
import { searchForWorkspaceRoot } from 'vite';

const workspaceRoot = searchForWorkspaceRoot(process.cwd());
console.log('Workspace root:', workspaceRoot);

// Use in configuration
export default defineConfig({
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())]
    }
  }
});
```

### File Serving Permissions

Check if file serving is allowed for a path.

```typescript { .api }
import { isFileServingAllowed } from 'vite';

/**
 * Check if file serving is allowed for this path
 * Based on server.fs.allow configuration
 * @param file - File path to check
 * @param server - Dev server instance
 * @returns True if serving is allowed
 */
function isFileServingAllowed(
  file: string,
  server: ViteDevServer
): boolean;
```

**Usage Example:**

```typescript
import { isFileServingAllowed } from 'vite';

// In a plugin
{
  name: 'check-file-access',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const file = getFilePathFromRequest(req);

      if (!isFileServingAllowed(file, server)) {
        res.statusCode = 403;
        res.end('Access denied');
        return;
      }

      next();
    });
  }
}
```

### Environment Variables

Load environment variables from .env files.

```typescript { .api }
import { loadEnv, resolveEnvPrefix } from 'vite';

/**
 * Load environment variables from .env files
 * Loads .env, .env.local, .env.[mode], .env.[mode].local
 * @param mode - Mode (development, production, etc.)
 * @param envDir - Directory to load .env files from
 * @param prefixes - Only load variables with these prefixes
 * @returns Object with loaded environment variables
 */
function loadEnv(
  mode: string,
  envDir: string,
  prefixes?: string | string[]
): Record<string, string>;

/**
 * Resolve environment variable prefixes from config
 * @param config - User configuration
 * @returns Array of prefixes
 */
function resolveEnvPrefix(config: UserConfig): string[];
```

**Usage Example:**

```typescript
import { loadEnv } from 'vite';
import path from 'path';

// Load environment variables
const env = loadEnv(
  'development',
  process.cwd(),
  '' // Load all variables (not just VITE_ prefixed)
);

console.log(env.VITE_API_URL);
console.log(env.DATABASE_URL);

// Use in configuration
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    define: {
      'process.env.API_URL': JSON.stringify(env.VITE_API_URL)
    }
  };
});
```

### Build Error Messages

Format error messages for display in the browser.

```typescript { .api }
import { buildErrorMessage } from 'vite';

/**
 * Build formatted error message for display
 * @param err - Error object
 * @param args - Additional formatting arguments
 * @param includeStack - Include stack trace
 * @returns Formatted HTML error message
 * @internal
 */
function buildErrorMessage(
  err: Error | RollupError,
  args?: string[],
  includeStack?: boolean
): string;
```

### Version Constants

Access version information for Vite and its dependencies.

```typescript { .api }
import { version, rollupVersion, esbuildVersion } from 'vite';

/**
 * Vite version string
 */
const version: string;

/**
 * Rollup version string
 */
const rollupVersion: string;

/**
 * esbuild version string
 */
const esbuildVersion: string;
```

**Usage Example:**

```typescript
import { version, rollupVersion, esbuildVersion } from 'vite';

console.log('Vite version:', version);
console.log('Rollup version:', rollupVersion);
console.log('esbuild version:', esbuildVersion);

// Use in plugin
{
  name: 'version-info',
  buildStart() {
    console.log(`Building with Vite ${version}`);
  }
}
```

### Default Constants

Access default configuration constants.

```typescript { .api }
import {
  defaultClientConditions,
  defaultClientMainFields,
  defaultServerConditions,
  defaultServerMainFields,
  defaultExternalConditions,
  defaultAllowedOrigins
} from 'vite';

/**
 * Default export conditions for client resolution
 */
const defaultClientConditions: string[];

/**
 * Default main fields for client resolution
 */
const defaultClientMainFields: string[];

/**
 * Default export conditions for server resolution
 */
const defaultServerConditions: string[];

/**
 * Default main fields for server resolution
 */
const defaultServerMainFields: string[];

/**
 * Default external conditions
 */
const defaultExternalConditions: string[];

/**
 * Default allowed CORS origins
 */
const defaultAllowedOrigins: string[];
```

### AST Parsing

Parse JavaScript/TypeScript code into AST (Abstract Syntax Tree) using Rollup's parser.

```typescript { .api }
import { parseAst, parseAstAsync } from 'vite';

/**
 * Parse code into AST synchronously
 * @param code - Source code to parse
 * @param options - Parse options
 * @returns Promise resolving to AST node
 */
function parseAst(code: string, options?: any): Promise<any>;

/**
 * Parse code into AST asynchronously
 * @param code - Source code to parse
 * @param options - Parse options
 * @returns Promise resolving to AST node
 */
function parseAstAsync(code: string, options?: any): Promise<any>;
```

**Usage Example:**

```typescript
import { parseAst } from 'vite';

// Parse code into AST
const ast = await parseAst('export const foo = 42;');
console.log(ast);
```

### Plugin Management

Sort and manage plugin configurations.

```typescript { .api }
import { sortUserPlugins, perEnvironmentPlugin, perEnvironmentState } from 'vite';

/**
 * Sort user plugins into pre, normal, and post groups
 * @param plugins - Array of plugins or plugin arrays
 * @returns Tuple of [prePlugins, normalPlugins, postPlugins]
 */
function sortUserPlugins(
  plugins: (Plugin | Plugin[])[]
): [Plugin[], Plugin[], Plugin[]];

/**
 * Create environment-specific plugin instances
 * @experimental
 * @param name - Name of the plugin
 * @param applyToEnvironment - Function that determines if plugin applies to an environment
 * @returns Plugin that works across environments
 */
function perEnvironmentPlugin(
  name: string,
  applyToEnvironment: (
    environment: PartialEnvironment
  ) => boolean | Promise<boolean> | PluginOption
): Plugin;

/**
 * Create per-environment state management
 * @experimental
 * @param initial - Factory function that takes environment and creates initial state
 * @returns Function that returns state for the current plugin context environment
 */
function perEnvironmentState<State>(
  initial: (environment: Environment) => State
): (context: PluginContext) => State;
```

**Usage Example:**

```typescript
import { sortUserPlugins, perEnvironmentPlugin } from 'vite';

// Sort plugins by enforcement
const [prePlugins, normalPlugins, postPlugins] = sortUserPlugins([
  myPlugin(),
  { ...otherPlugin, enforce: 'pre' }
]);

// Create environment-specific plugin
const envPlugin = perEnvironmentPlugin((environment) => ({
  name: 'my-env-plugin',
  transform(code, id) {
    // Environment-specific logic
    if (environment.name === 'client') {
      return transformForClient(code);
    }
    return transformForSSR(code);
  }
}));
```

### Module Runner Utilities

Utilities for working with the module runner and SSR transforms.

```typescript { .api }
import {
  runnerImport,
  moduleRunnerTransform,
  isRunnableDevEnvironment,
  isFetchableDevEnvironment
} from 'vite';

/**
 * Import any file using the default Vite environment (experimental)
 * Creates a temporary runnable environment to import and execute the module
 * @param moduleId - Module ID or file path to import
 * @param inlineConfig - Optional inline Vite configuration
 * @returns Promise resolving to module exports and dependencies
 */
function runnerImport<T>(
  moduleId: string,
  inlineConfig?: InlineConfig
): Promise<RunnerImportResult<T>>;

interface RunnerImportResult<T> {
  module: T;
  dependencies: string[];
}

/**
 * Transform code for module runner execution (SSR transform)
 * @param code - Source code
 * @param inMap - Input source map
 * @param url - Module URL
 * @param originalCode - Original untransformed code
 * @param options - Transform options
 * @returns Promise resolving to transform result
 */
function moduleRunnerTransform(
  code: string,
  inMap: SourceMap | null,
  url: string,
  originalCode: string,
  options?: ModuleRunnerTransformOptions
): Promise<TransformResult | null>;

/**
 * Type guard to check if environment is runnable
 * @param environment - Dev environment to check
 * @returns True if environment is runnable
 */
function isRunnableDevEnvironment(
  environment: DevEnvironment
): environment is RunnableDevEnvironment;

/**
 * Type guard to check if environment is fetchable
 * @param environment - Dev environment to check
 * @returns True if environment is fetchable
 */
function isFetchableDevEnvironment(
  environment: DevEnvironment
): environment is FetchableDevEnvironment;
```

**Usage Example:**

```typescript
import { runnerImport } from 'vite';

// Import module using the default environment
const result = await runnerImport('./src/config.ts', {
  root: process.cwd(),
  logLevel: 'silent'
});

console.log(result.module); // Exported config
console.log(result.dependencies); // File dependencies
```

### File Permission Checks

Check file access permissions based on server configuration.

```typescript { .api }
import { isFileLoadingAllowed } from 'vite';

/**
 * Check if file loading is allowed for this path
 * Based on server.fs.allow configuration
 * @param file - File path to check
 * @param server - Dev server instance
 * @returns True if loading is allowed
 */
function isFileLoadingAllowed(
  file: string,
  server: ViteDevServer
): boolean;
```

**Usage Example:**

```typescript
import { isFileLoadingAllowed } from 'vite';

// Check if file can be loaded
const filePath = '/some/restricted/file.js';
if (isFileLoadingAllowed(filePath, server)) {
  const content = await fs.readFile(filePath, 'utf-8');
}
```

## Types

### Runner Import Result

```typescript { .api }
/**
 * Result from runnerImport function
 */
interface RunnerImportResult<T> {
  /** The imported module exports */
  module: T;
  /** Array of dependency file paths */
  dependencies: string[];
}
```

### Alias Options

```typescript { .api }
/**
 * Alias configuration
 * From @rollup/plugin-alias
 */
type AliasOptions = readonly Alias[] | { [find: string]: string };

/**
 * Single alias definition
 */
interface Alias {
  /** Pattern to find */
  find: string | RegExp;
  /** Replacement string */
  replacement: string;
  /**
   * Custom resolver function
   * If returns null, falls back to default resolution
   */
  customResolver?: ResolverFunction | ResolverObject | null;
}

/**
 * Alias resolver function
 */
type ResolverFunction = (
  source: string,
  importer: string | undefined,
  options: { custom?: any }
) => string | null | undefined | Promise<string | null | undefined>;

/**
 * Alias resolver object
 */
interface ResolverObject {
  resolveId: ResolverFunction;
}
```

### HTTP Server Types

```typescript { .api }
/**
 * HTTP server (Node.js or HTTPS server)
 */
type HttpServer = http.Server | https.Server;

/**
 * Incoming message (HTTP request)
 */
type IncomingMessage = http.IncomingMessage;

/**
 * Server response (HTTP response)
 */
type ServerResponse = http.ServerResponse;

/**
 * Outgoing HTTP headers
 */
type OutgoingHttpHeaders = http.OutgoingHttpHeaders;
```

### Error Types

```typescript { .api }
/**
 * Rollup error with additional metadata
 */
interface RollupError extends Error {
  /** Plugin that caused the error */
  plugin?: string;
  /** Error code */
  code?: string;
  /** File location */
  loc?: {
    file?: string;
    line: number;
    column: number;
  };
  /** Code frame */
  frame?: string;
  /** Plugin-specific code */
  pluginCode?: string;
  /** Unique error ID */
  id?: string;
}
```
