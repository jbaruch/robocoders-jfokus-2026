# Vite

Vite is a next-generation frontend build tool that provides an extremely fast development experience through native ES modules and optimized production builds. It offers instant server start with on-demand file serving over native ESM, lightning-fast Hot Module Replacement (HMR) that stays fast regardless of app size, and highly optimized production builds powered by Rollup. Vite is framework-agnostic and provides both a powerful dev server and a build command, along with a rich plugin ecosystem and full TypeScript support.

## Package Information

- **Package Name**: vite
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install vite` or `pnpm add vite` or `yarn add vite`
- **Node Version**: ^20.19.0 || >=22.12.0

## Quick Start

### Core Imports

```typescript { .api }
import {
  createServer,
  build,
  preview,
  defineConfig,
  type UserConfig,
  type ViteDevServer
} from 'vite';
```

For CommonJS:

```javascript { .api }
const { createServer, build, preview, defineConfig } = require('vite');
```

### Basic Usage

```typescript
import { createServer, build, defineConfig } from 'vite';

// Define configuration
export default defineConfig({
  root: './src',
  base: '/',
  build: {
    outDir: '../dist',
  },
});

// Create dev server programmatically
const server = await createServer({
  server: { port: 3000 }
});
await server.listen();

// Build for production
await build({
  root: './src',
  build: { outDir: '../dist' }
});
```

### CLI Usage

Vite provides a command-line interface with four main commands:

```bash
# Start development server (default command)
vite
vite dev
vite serve

# Build for production
vite build

# Preview production build locally
vite preview

# Pre-bundle dependencies (deprecated)
vite optimize --force
```

## Core Capabilities

### Development Server

Create and configure a Vite development server with instant module serving, HMR, and middleware support.

```typescript { .api }
function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>;

interface ViteDevServer {
  config: ResolvedConfig;
  httpServer: HttpServer | null;
  ws: WebSocketServer;
  environments: Record<string, DevEnvironment>;
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>;
  close(): Promise<void>;
  restart(forceOptimize?: boolean): Promise<void>;
}
```

[Development Server Guide](./core/dev-server.md)

### Production Build

Build your project for production with optimized bundling, code splitting, and asset handling.

```typescript { .api }
function build(inlineConfig?: InlineConfig): Promise<RollupOutput | RollupOutput[] | RollupWatcher>;
function createBuilder(inlineConfig?: InlineConfig): Promise<ViteBuilder>;

interface ViteBuilder {
  build(environment?: string): Promise<void>;
  buildApp(): Promise<void>;
  close(): Promise<void>;
}
```

[Production Build Guide](./core/build.md)

### Preview Server

Locally preview your production build to test the final output before deployment.

```typescript { .api }
function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>;

interface PreviewServer {
  config: ResolvedConfig;
  httpServer: HttpServer;
  listen(port?: number): Promise<PreviewServer>;
  close(): Promise<void>;
}
```

[Preview Server Guide](./core/preview.md)

### Configuration

Define, load, and resolve Vite configuration with type safety and environment-specific settings.

```typescript { .api }
function defineConfig(config: UserConfigExport): UserConfigExport;
function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot?: string,
  logLevel?: LogLevel,
  customLogger?: Logger,
  configLoader?: 'bundle' | 'runner' | 'native'
): Promise<{ path: string; config: UserConfig; dependencies: string[] } | null>;
function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode?: string
): Promise<ResolvedConfig>;
```

[Configuration Guide](./core/configuration.md)

## Advanced Features

### Plugin System

Create and configure plugins to extend Vite's functionality with custom transforms, hooks, and behavior.

```typescript { .api }
interface Plugin extends RollupPlugin {
  name: string;
  enforce?: 'pre' | 'post';
  apply?: 'serve' | 'build' | ((config: UserConfig, env: ConfigEnv) => boolean);
  config?: (config: UserConfig, env: ConfigEnv) => UserConfig | null | void;
  configResolved?: (config: ResolvedConfig) => void | Promise<void>;
  configureServer?: (server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>;
  // ... many more hooks
}

function perEnvironmentPlugin(
  factory: (environment: Environment) => Plugin
): Plugin;
```

[Plugin System Guide](./advanced/plugins.md)

### Multi-Environment System

Multi-environment support for client, SSR, and custom build targets with isolated module graphs and plugin pipelines.

```typescript { .api }
class DevEnvironment {
  name: string;
  config: ResolvedConfig;
  moduleGraph: EnvironmentModuleGraph;
  transformRequest(url: string, options?: TransformOptions): Promise<TransformResult | null>;
  warmupRequest(url: string): Promise<void>;
}

function createRunnableDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context?: RunnableDevEnvironmentContext
): RunnableDevEnvironment;

function createFetchableDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context?: FetchableDevEnvironmentContext
): FetchableDevEnvironment;
```

[Environments Guide](./advanced/environments.md)

### Module Runner

Execute transformed modules in any JavaScript environment (Node.js, workers, tests) with HMR support.

```typescript { .api }
class ModuleRunner {
  constructor(options: ModuleRunnerOptions);
  import(url: string): Promise<any>;
  close(): Promise<void>;
}

function createServerModuleRunner(
  environment: DevEnvironment,
  options?: Partial<ServerModuleRunnerOptions>
): Promise<ModuleRunner>;
```

[Module Runner Guide](./advanced/module-runner.md)

### Server-Side Rendering

Transform and execute modules for server-side rendering with proper externalization and module runner support.

```typescript { .api }
interface SSROptions {
  external?: string[];
  noExternal?: string | RegExp | (string | RegExp)[] | true;
  target?: 'node' | 'webworker';
  resolve?: {
    conditions?: string[];
    externalConditions?: string[];
  };
}

function fetchModule(
  environment: DevEnvironment,
  url: string,
  importer?: string,
  options?: FetchModuleOptions
): Promise<FetchResult>;

function createServerModuleRunner(
  environment: DevEnvironment,
  options?: Partial<ServerModuleRunnerOptions>
): Promise<ModuleRunner>;
```

[SSR Guide](./advanced/ssr.md)

## Feature Guides

### Hot Module Replacement

Server-side and client-side HMR systems for lightning-fast updates during development.

- [Server-Side HMR](./features/hmr.md) - WebSocket communication, hot channels, update payloads
- [Client-Side HMR](./features/client-hmr.md) - `import.meta.hot` API for accepting updates

### Module Graph

Track module dependencies, importers, and transforms for efficient HMR and incremental builds.

```typescript { .api }
class EnvironmentModuleGraph {
  getModuleByUrl(url: string): Promise<EnvironmentModuleNode | undefined>;
  getModuleById(id: string): EnvironmentModuleNode | undefined;
  invalidateModule(mod: EnvironmentModuleNode): void;
  invalidateAll(): void;
}

interface EnvironmentModuleNode {
  id: string | null;
  url: string;
  importers: Set<EnvironmentModuleNode>;
  importedModules: Set<EnvironmentModuleNode>;
  transformResult: TransformResult | null;
}
```

[Module Graph Guide](./features/module-graph.md)

### Asset Handling

Import and process static assets (images, fonts, media) with URL generation and inlining support.

```typescript { .api }
interface BuildOptions {
  assetsDir?: string;
  assetsInlineLimit?: number;
  assetsInclude?: string | RegExp | (string | RegExp)[];
}
```

- [Asset Handling](./features/asset-handling.md) - Static asset processing
- [Asset Queries](./features/asset-queries.md) - URL query parameters for asset imports

### CSS Processing

Process CSS, CSS Modules, preprocessors (Sass, Less, Stylus), and PostCSS with full HMR support.

```typescript { .api }
function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig
): Promise<PreprocessCSSResult>;

interface CSSOptions {
  modules?: CSSModulesOptions;
  postcss?: string | object;
  preprocessorOptions?: Record<string, any>;
  lightningcss?: LightningCSSOptions;
}
```

[CSS Processing Guide](./features/css-processing.md)

### TypeScript Support

Transform TypeScript with esbuild for fast compilation without type checking.

```typescript { .api }
function transformWithEsbuild(
  code: string,
  filename: string,
  options?: ESBuildTransformOptions,
  inMap?: object
): Promise<ESBuildTransformResult>;

interface ESBuildOptions {
  include?: string | RegExp | string[] | RegExp[];
  exclude?: string | RegExp | string[] | RegExp[];
  jsxInject?: string;
  target?: string | string[];
}
```

[TypeScript Guide](./features/typescript.md)

### Import Features

- [JSON Imports](./features/json-imports.md) - Import JSON with named imports and tree-shaking
- [Glob Imports](./features/glob-imports.md) - Dynamically import multiple modules with `import.meta.glob`
- [Environment Variables](./features/env-variables.md) - Load and access `.env` files with type-safe access
- [Web Workers](./features/web-workers.md) - Import and instantiate Web Workers and Shared Workers
- [WebAssembly](./features/webassembly.md) - Import and instantiate WebAssembly modules

### Build Features

- [Build Manifest](./features/build-manifest.md) - Generate manifest mapping original files to built assets
- [Library Mode](./features/library-mode.md) - Build libraries with multiple output formats (ESM, CommonJS, UMD, IIFE)
- [HTML Processing](./features/html-processing.md) - Transform HTML entry points with script injection and tag manipulation
- [Module Resolution](./features/module-resolution.md) - Resolve module IDs with custom resolution logic, aliases, and conditions
- [Proxy and CORS](./features/proxy-cors.md) - Configure HTTP proxy and CORS for the development server
- [Dependency Optimization](./features/dep-optimization.md) - Pre-bundle dependencies with esbuild for faster cold starts

## API Reference

### Utilities

Common utility functions for path normalization, config merging, filtering, logging, plugin management, and more.

```typescript { .api }
function normalizePath(id: string): string;
function mergeConfig<T, U>(defaults: T, overrides: U): Record<string, any>;
function mergeAlias(a?: AliasOptions, b?: AliasOptions): AliasOptions | undefined;
function createFilter(
  include?: FilterPattern,
  exclude?: FilterPattern,
  options?: { resolve?: string | false }
): (id: string | unknown) => boolean;
function createLogger(level?: LogLevel, options?: LogOptions): Logger;
function isCSSRequest(request: string): boolean;
function loadEnv(mode: string, envDir: string, prefixes?: string | string[]): Record<string, string>;
function searchForWorkspaceRoot(current: string, root?: string): string;
function isFileServingAllowed(file: string, server: ViteDevServer): boolean;
function isFileLoadingAllowed(file: string, server: ViteDevServer): boolean;
function send(req: IncomingMessage, res: ServerResponse, content: string | Buffer, type: string, options: SendOptions): void;
function buildErrorMessage(err: Error, args?: string[], includeStack?: boolean): string;
function parseAst(code: string, options?: any): Promise<any>;
function parseAstAsync(code: string, options?: any): Promise<any>;
function sortUserPlugins(plugins: (Plugin | Plugin[])[]): [Plugin[], Plugin[], Plugin[]];
function perEnvironmentPlugin(factory: (environment: Environment) => Plugin): Plugin;
function perEnvironmentState<T>(stateFactory: () => T): PerEnvironmentState<T>;
function runnerImport<T>(moduleId: string, inlineConfig?: InlineConfig): Promise<RunnerImportResult<T>>;
function isRunnableDevEnvironment(environment: DevEnvironment): environment is RunnableDevEnvironment;
function isFetchableDevEnvironment(environment: DevEnvironment): environment is FetchableDevEnvironment;
function moduleRunnerTransform(code: string, inMap: SourceMap | null, url: string, originalCode: string, options?: ModuleRunnerTransformOptions): Promise<TransformResult | null>;
```

[Utilities Reference](./api/utilities.md)

## Architecture

Vite is built around several key components:

- **Dev Server**: Connect-based middleware server that serves source files over native ES modules with instant transforms
- **Build System**: Rollup-based production bundler with optimized static asset generation
- **Plugin System**: Rollup-compatible plugin interface extended with Vite-specific hooks
- **Module Graph**: Per-environment dependency tracking for HMR and transforms
- **HMR Engine**: WebSocket-based Hot Module Replacement with custom event support
- **Dependency Optimizer**: esbuild-powered pre-bundling of dependencies for optimal loading
- **Environment System**: Multi-environment support (client, SSR, custom) with isolated module graphs
- **Module Runner**: Standalone runtime for executing transformed modules outside the browser

## Types

Common types used throughout the Vite API are documented in each relevant section. Key base types include:

- `UserConfig` - User configuration object
- `ResolvedConfig` - Fully resolved configuration
- `Plugin` - Plugin interface
- `ViteDevServer` - Dev server instance
- `InlineConfig` - Inline configuration for programmatic use
- `FilterPattern` - File filter patterns (string | RegExp | (string | RegExp)[])

See individual capability documentation for detailed type definitions.

