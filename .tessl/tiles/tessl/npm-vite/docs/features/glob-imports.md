# Glob Imports (import.meta.glob)

Vite provides `import.meta.glob` for importing multiple modules using glob patterns. This feature enables dynamic imports of file collections, commonly used for plugin systems, route loading, and modular architectures.

## Capabilities

### Basic Glob Import

Import multiple modules matching a glob pattern as dynamic imports (lazy-loaded).

```typescript { .api }
/**
 * Import multiple modules with glob pattern
 * Returns an object mapping file paths to dynamic import functions
 */
const modules = import.meta.glob('./modules/*.js');

// Type signature (default behavior - dynamic imports)
const modules: Record<string, () => Promise<any>>;
```

**Usage Example:**

```typescript
// Import all JavaScript files in modules directory
const modules = import.meta.glob('./modules/*.js');

// Result: { './modules/foo.js': () => import('./modules/foo.js'), ... }
console.log(Object.keys(modules));
// Output: ['./modules/foo.js', './modules/bar.js', './modules/baz.js']

// Dynamically load a specific module
const foo = await modules['./modules/foo.js']();
console.log(foo.default);

// Load all modules
for (const path in modules) {
  const mod = await modules[path]();
  console.log(mod);
}
```

### Eager Glob Import

Import multiple modules synchronously at build time (not lazy-loaded).

```typescript { .api }
/**
 * Import modules eagerly (static imports)
 * Returns an object mapping file paths to module objects
 */
const modules = import.meta.glob('./modules/*.js', { eager: true });

// Type signature with eager option
const modules: Record<string, any>;
```

**Usage Example:**

```typescript
// Import all modules immediately
const modules = import.meta.glob('./modules/*.js', { eager: true });

// Result: { './modules/foo.js': { default: ..., export1: ... }, ... }
// Modules are already loaded, no await needed
console.log(modules['./modules/foo.js'].default);

// Iterate over loaded modules
for (const path in modules) {
  console.log(modules[path].default);
}
```

### Multiple Patterns

Use an array of glob patterns to import from multiple locations.

```typescript { .api }
/**
 * Import modules matching any of the provided patterns
 */
const modules = import.meta.glob([
  './pages/**/*.jsx',
  './components/**/*.jsx'
]);
```

**Usage Example:**

```typescript
// Import from multiple directories
const components = import.meta.glob([
  './components/**/*.jsx',
  './pages/**/*.jsx',
  './layouts/**/*.jsx'
]);

// All matching files from all patterns
console.log(Object.keys(components));
// ['./components/Button.jsx', './pages/Home.jsx', './layouts/Main.jsx', ...]
```

### Negative Patterns

Use negative patterns (prefixed with `!`) to exclude files.

```typescript { .api }
/**
 * Import with exclusions using negative patterns
 */
const modules = import.meta.glob([
  './modules/**/*.js',
  '!./modules/**/*.test.js',
  '!./modules/**/*.spec.js'
]);
```

**Usage Example:**

```typescript
// Import all JS files except test files
const modules = import.meta.glob([
  './components/**/*.js',
  '!**/*.test.js',
  '!**/*.spec.js',
  '!**/__tests__/**'
]);

// Only includes non-test files
console.log(Object.keys(modules));
// ['./components/Button.js', './components/Input.js']
// Excludes: './components/Button.test.js', etc.
```

### Named Import Selection

Import specific named exports instead of the entire module.

```typescript { .api }
/**
 * Import only specific named exports from matching modules
 */
const modules = import.meta.glob('./modules/*.js', {
  import: 'setup'
});

// With eager: true
const setups = import.meta.glob('./plugins/*.js', {
  eager: true,
  import: 'setup'
});
```

**Usage Example:**

```typescript
// Import only the 'setup' export from each module
const setups = import.meta.glob('./plugins/*.js', {
  import: 'setup'
});

// Each value is just the 'setup' export, not the full module
for (const path in setups) {
  const setup = await setups[path]();
  setup(); // Call the setup function
}

// Import default exports
const defaults = import.meta.glob('./components/*.jsx', {
  eager: true,
  import: 'default'
});
```

### Custom Query Parameters

Add custom query parameters to imported modules for special processing.

```typescript { .api }
/**
 * Import modules with custom query parameters
 */
const modules = import.meta.glob('./assets/*.svg', {
  query: { raw: true }
});

// Or as string
const modules2 = import.meta.glob('./data/*.json', {
  query: '?url'
});
```

**Usage Example:**

```typescript
// Import SVG files as raw strings
const svgs = import.meta.glob('./icons/*.svg', {
  eager: true,
  query: { raw: true }
});

// Import JSON as URLs instead of parsed objects
const dataUrls = import.meta.glob('./data/*.json', {
  query: '?url'
});

// Complex query object
const assets = import.meta.glob('./images/*', {
  query: {
    w: 500,
    h: 300,
    format: 'webp'
  }
});
```

### Exhaustive Search

Search in `node_modules` and hidden directories (disabled by default for performance).

```typescript { .api }
/**
 * Enable exhaustive search including node_modules and hidden directories
 */
const modules = import.meta.glob('./**/*.js', {
  exhaustive: true
});
```

**Usage Example:**

```typescript
// Search everywhere, including node_modules and hidden folders
const allModules = import.meta.glob('**/*.plugin.js', {
  exhaustive: true
});

// This will find:
// - ./my-plugin.js
// - ./node_modules/some-package/plugin.js
// - ./.config/plugin.js

// Note: May impact performance, use sparingly
```

### Custom Base Path

Resolve relative paths from a custom base directory.

```typescript { .api }
/**
 * Use custom base path for relative path resolution
 */
const modules = import.meta.glob('./components/*.jsx', {
  base: './src'
});
```

**Usage Example:**

```typescript
// Without base: keys are relative to current file
const mods1 = import.meta.glob('./components/*.jsx');
// Keys: ['./components/Button.jsx', './components/Input.jsx']

// With base: keys are relative to specified base
const mods2 = import.meta.glob('./components/*.jsx', {
  base: './src'
});
// Keys: ['components/Button.jsx', 'components/Input.jsx']
// (relative to src directory)
```

### Glob Pattern Syntax

Vite uses fast-glob syntax for pattern matching:

**Wildcards:**
- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/` (recursive)
- `?` - Matches any single character

**Examples:**
```typescript
// Single directory
import.meta.glob('./modules/*.js')
// Matches: ./modules/foo.js, ./modules/bar.js
// Not: ./modules/nested/baz.js

// Recursive (all subdirectories)
import.meta.glob('./modules/**/*.js')
// Matches: ./modules/foo.js, ./modules/nested/bar.js, ./modules/a/b/c/baz.js

// Specific extensions
import.meta.glob('./components/*.{jsx,tsx}')
// Matches: ./components/Button.jsx, ./components/Input.tsx

// Character wildcard
import.meta.glob('./pages/page-?.jsx')
// Matches: ./pages/page-1.jsx, ./pages/page-a.jsx
// Not: ./pages/page-10.jsx
```

### Advanced Usage Patterns

Combine options for powerful module loading patterns.

**Plugin System:**
```typescript
// Load all plugins eagerly with just the register function
const plugins = import.meta.glob('./plugins/*.js', {
  eager: true,
  import: 'register'
});

// Register all plugins
Object.values(plugins).forEach(register => register());
```

**Route Loading:**
```typescript
// Lazy-load page components
const pages = import.meta.glob('./pages/**/*.vue');

// Route configuration
const routes = Object.keys(pages).map(path => ({
  path: path.replace('./pages', '').replace('.vue', ''),
  component: pages[path]
}));
```

**Icon Registry:**
```typescript
// Load SVG icons as raw strings
const icons = import.meta.glob('./icons/*.svg', {
  eager: true,
  query: { raw: true },
  import: 'default'
});

// Create icon registry
const iconRegistry = Object.entries(icons).reduce((acc, [path, svg]) => {
  const name = path.match(/\/([^/]+)\.svg$/)[1];
  acc[name] = svg;
  return acc;
}, {});
```

### Build-Time Code Generation

Glob imports are statically analyzed at build time and converted to explicit imports.

**Source Code:**
```typescript
const modules = import.meta.glob('./modules/*.js');
```

**Generated Code (development):**
```typescript
const modules = {
  './modules/foo.js': () => import('./modules/foo.js'),
  './modules/bar.js': () => import('./modules/bar.js')
};
```

**Generated Code (with eager: true):**
```typescript
import * as __glob__0 from './modules/foo.js';
import * as __glob__1 from './modules/bar.js';

const modules = {
  './modules/foo.js': __glob__0,
  './modules/bar.js': __glob__1
};
```

## Types

```typescript { .api }
/**
 * Options for import.meta.glob
 */
interface ImportGlobOptions<Eager extends boolean, AsType extends string> {
  /**
   * Import type for the import url.
   * @deprecated Use `query` instead
   */
  as?: AsType;

  /**
   * Import as static or dynamic
   * @default false
   */
  eager?: Eager;

  /**
   * Import only the specific named export.
   * Set to 'default' to import the default export.
   */
  import?: string;

  /**
   * Custom queries
   */
  query?: string | Record<string, string | number | boolean>;

  /**
   * Search files also inside node_modules and hidden directories.
   * May impact performance.
   * @default false
   */
  exhaustive?: boolean;

  /**
   * Base path to resolve relative paths
   */
  base?: string;
}

/**
 * General options type (any combination)
 */
type GeneralImportGlobOptions = ImportGlobOptions<boolean, string>;

/**
 * Known 'as' type mappings
 */
interface KnownAsTypeMap {
  raw: string;
  url: string;
  worker: Worker;
}

/**
 * import.meta.glob function signature
 */
interface ImportGlobFunction {
  /**
   * Import a list of files with a glob pattern
   * Overload 1: No generic provided, infer type from eager and as
   */
  <Eager extends boolean, As extends string, T = As extends keyof KnownAsTypeMap ? KnownAsTypeMap[As] : unknown>(
    glob: string | string[],
    options?: ImportGlobOptions<Eager, As>
  ): (Eager extends true ? true : false) extends true
    ? Record<string, T>
    : Record<string, () => Promise<T>>;

  /**
   * Overload 2: Module generic provided, eager: false (dynamic)
   */
  <M>(
    glob: string | string[],
    options?: ImportGlobOptions<false, string>
  ): Record<string, () => Promise<M>>;

  /**
   * Overload 3: Module generic provided, eager: true (static)
   */
  <M>(
    glob: string | string[],
    options: ImportGlobOptions<true, string>
  ): Record<string, M>;
}

/**
 * Extended ImportMeta interface
 */
interface ImportMeta {
  glob: ImportGlobFunction;
}
```
