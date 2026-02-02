# Module Resolution

Vite provides flexible module resolution with support for aliases, custom extensions, conditions, and Node.js-compatible package resolution. Resolution behavior can be customized per environment and integrates with the dependency optimization system.

## Capabilities

### createIdResolver Function

Create a custom module ID resolver with specific resolution options.

```typescript { .api }
/**
 * Create an internal resolver for special scenarios (e.g., optimizer, CSS @imports)
 * @param config - Resolved Vite configuration (required)
 * @param options - Optional internal resolution options
 * @returns Async function that resolves module IDs per environment
 */
function createIdResolver(
  config: ResolvedConfig,
  options?: Partial<InternalResolveOptions>
): ResolveIdFn;

type ResolveIdFn = (
  environment: PartialEnvironment,
  id: string,
  importer?: string,
  aliasOnly?: boolean
) => Promise<string | undefined>;
```

**Usage Example:**

```typescript
import { createIdResolver, resolveConfig } from 'vite';

// Get resolved config
const config = await resolveConfig({ root: '.' }, 'build');

// Create internal resolver
const resolver = createIdResolver(config, {
  scan: false,
  asSrc: true
});

// Resolve module IDs (requires environment context)
const resolved = await resolver(
  server.environments.client,
  'lodash',
  '/path/to/importer.ts'
);
console.log(resolved); // /path/to/node_modules/lodash/lodash.js

// Resolve with alias only
const aliased = await resolver(
  server.environments.client,
  '@/utils',
  '/src/app.ts',
  true // aliasOnly
);
```

### Resolution Options

Configure module resolution behavior with comprehensive options.

```typescript { .api }
/**
 * Module resolution configuration
 */
interface ResolveOptions {
  /**
   * Main fields to resolve from package.json
   * @default ['browser', 'module', 'jsnext:main', 'jsnext']
   */
  mainFields?: string[];

  /**
   * Export conditions for package.json exports field
   */
  conditions?: string[];

  /**
   * External conditions (for server environments)
   */
  externalConditions?: string[];

  /**
   * File extensions to try when resolving
   * @default ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
   */
  extensions?: string[];

  /**
   * Force dedupe these dependencies (use same version across project)
   */
  dedupe?: string[];

  /**
   * Preserve symlinks instead of resolving to real path
   * @default false
   */
  preserveSymlinks?: boolean;

  /**
   * Prevent dependencies from being externalized (server environments)
   * @experimental
   */
  noExternal?: string | RegExp | (string | RegExp)[] | true;

  /**
   * Externalize dependencies and their transitive dependencies (server environments)
   * @experimental
   */
  external?: string[] | true;

  /**
   * Modules that are considered built-in for the environment
   */
  builtins?: (string | RegExp)[];
}
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    // Try .vue files in addition to defaults
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],

    // Resolve browser field first, then module field
    mainFields: ['browser', 'module', 'main'],

    // Custom export conditions
    conditions: ['import', 'module', 'browser', 'default'],

    // Force specific version of React across all dependencies
    dedupe: ['react', 'react-dom'],

    // Don't resolve symlinks to their real path
    preserveSymlinks: true
  }
});
```

### Path Aliases

Define path aliases for cleaner imports and better project organization.

```typescript { .api }
/**
 * Alias configuration for module resolution
 * Supports string mappings and custom resolver functions
 */
type Alias = {
  find: string | RegExp;
  replacement: string;
  /**
   * Custom resolver function
   */
  customResolver?: ResolverFunction | ResolverObject;
};

type AliasOptions = readonly Alias[] | { [find: string]: string };
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // String alias
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),

      // Multiple targets
      '@lib': [
        path.resolve(__dirname, './src/lib'),
        path.resolve(__dirname, './lib')
      ],

      // Regex alias
      '~': path.resolve(__dirname, './src')
    }
  }
});

// Usage in code
import Button from '@components/Button.vue';
import { format } from '@utils/string';
import logo from '@assets/logo.png';
```

### Array Format Aliases

Define aliases using array format for more control.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: [
      // Exact match
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      },
      // Regex match
      {
        find: /^@components\/(.*)$/,
        replacement: path.resolve(__dirname, './src/components/$1')
      },
      // With custom resolver
      {
        find: '@custom',
        replacement: path.resolve(__dirname, './custom'),
        customResolver: (id, importer) => {
          // Custom resolution logic
          return id.replace('@custom', './custom');
        }
      }
    ]
  }
});
```

### Main Fields Resolution

Specify which package.json fields to resolve for entry points.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    // For browser builds (default)
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],

    // For Node.js/SSR builds
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main']
  }
});

// When resolving a package, Vite checks these fields in order:
// 1. package.json "browser" field
// 2. package.json "module" field
// 3. package.json "jsnext:main" field
// 4. package.json "main" field (default fallback)
```

### Export Conditions

Control package.json exports field resolution with conditions.

```typescript { .api }
/**
 * Export conditions for resolving package.json "exports" field
 * Standard conditions: 'import', 'require', 'module', 'default'
 * Environment conditions: 'browser', 'node', 'development', 'production'
 */
conditions?: string[];
```

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    // Client/browser conditions
    conditions: ['import', 'module', 'browser', 'default'],

    // For SSR
    conditions: ['import', 'module', 'node', 'default']
  }
});

// Package.json with exports field:
// {
//   "exports": {
//     ".": {
//       "import": "./dist/esm/index.js",
//       "require": "./dist/cjs/index.js",
//       "browser": "./dist/browser/index.js",
//       "node": "./dist/node/index.js",
//       "default": "./dist/index.js"
//     }
//   }
// }
```

### File Extensions

Configure which file extensions are automatically resolved.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    // Default extensions
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],

    // Add custom extensions
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.svelte'],

    // TypeScript-only project
    extensions: ['.ts', '.tsx', '.mts', '.cts']
  }
});

// With extensions configured:
import Component from './Component'; // Resolves to Component.tsx or Component.ts
import data from './data';           // Resolves to data.json
```

### Dependency Deduplication

Force multiple versions of the same package to resolve to a single version.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@emotion/react',
      '@emotion/styled'
    ]
  }
});

// Without dedupe:
// node_modules/react (v18.0.0)
// node_modules/some-lib/node_modules/react (v17.0.2)

// With dedupe:
// Both resolve to node_modules/react (v18.0.0)
```

### Preserve Symlinks

Control whether symlinks are resolved to their real path.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    // Preserve symlinks (don't resolve to real path)
    preserveSymlinks: true
  }
});

// With preserveSymlinks: false (default)
// /project/node_modules/lib -> /actual/path/to/lib
// Import resolves to: /actual/path/to/lib/index.js

// With preserveSymlinks: true
// /project/node_modules/lib -> /actual/path/to/lib
// Import resolves to: /project/node_modules/lib/index.js
```

### Server-Side Resolution

Configure resolution for server-side/SSR environments.

```typescript { .api }
/**
 * Server environment resolution options
 */
interface EnvironmentResolveOptions {
  /**
   * Prevent dependencies from being externalized
   * @experimental
   */
  noExternal?: string | RegExp | (string | RegExp)[] | true;

  /**
   * Externalize dependencies (not bundled)
   * @experimental
   */
  external?: string[] | true;

  /**
   * Built-in modules for the environment
   */
  builtins?: (string | RegExp)[];
}
```

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  environments: {
    ssr: {
      resolve: {
        // Don't externalize these packages (bundle them)
        noExternal: ['@my-company/shared', /^@ui\//],

        // Externalize all other dependencies
        external: true,

        // Custom built-ins for runtime
        builtins: ['custom-runtime-api']
      }
    }
  }
});
```

### Bare Import Resolution

Vite resolves bare imports (imports without ./ or ../) to node_modules.

**Usage Example:**

```typescript
// Bare imports (resolved from node_modules)
import React from 'react';                    // node_modules/react
import { debounce } from 'lodash-es';         // node_modules/lodash-es
import Button from '@my-ui/button';           // node_modules/@my-ui/button

// Relative imports (resolved from file system)
import utils from './utils';                  // ./utils.ts
import Component from '../components/App';    // ../components/App.tsx

// Absolute imports (resolved from root)
import config from '/src/config';             // project-root/src/config.ts
```

### Subpath Imports

Support for package.json subpath imports (imports starting with #).

**Usage Example:**

```json
// package.json
{
  "imports": {
    "#utils/*": "./src/utils/*",
    "#components/*": "./src/components/*"
  }
}
```

```typescript
// Use subpath imports
import { format } from '#utils/string';
import Button from '#components/Button';

// These resolve based on package.json "imports" field
```

### Browser Field Support

Resolve browser-specific versions of modules using package.json browser field.

**Usage Example:**

```json
// package.json
{
  "main": "./index.js",
  "browser": {
    "./index.js": "./browser.js",
    "fs": false,
    "path": "./path-browserify.js"
  }
}
```

```typescript
// When building for browser, Vite resolves:
import pkg from 'my-package';  // Uses browser.js instead of index.js

// Node built-ins are replaced or disabled:
import fs from 'fs';           // Resolves to false (excluded)
import path from 'path';       // Resolves to path-browserify.js
```

### Custom Resolver Plugin

Create a custom resolution plugin for advanced use cases.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'custom-resolver',
      resolveId(id, importer) {
        // Custom resolution logic
        if (id.startsWith('virtual:')) {
          return '\0' + id; // Virtual module
        }

        if (id.startsWith('npm:')) {
          // Resolve npm: protocol
          return {
            id: id.replace('npm:', ''),
            external: false
          };
        }

        // Return null to fall through to default resolution
        return null;
      }
    }
  ]
});
```

## Types

```typescript { .api }
/**
 * Create an ID resolver (documented in Capabilities section above)
 */

/**
 * Resolve ID function type returned by createIdResolver
 */
type ResolveIdFn = (
  environment: PartialEnvironment,
  id: string,
  importer?: string,
  aliasOnly?: boolean
) => Promise<string | undefined>;

/**
 * Partial environment interface for resolution
 */
interface PartialEnvironment {
  name: string;
  config: {
    resolve: {
      alias: AliasOptions;
    };
  };
}

/**
 * Internal resolution options
 */
interface InternalResolveOptions {
  scan?: boolean;
  asSrc?: boolean;
  tryIndex?: boolean;
  preferRelative?: boolean;
  idOnly?: boolean;
}

/**
 * Module resolution configuration
 */
interface ResolveOptions {
  mainFields?: string[];
  conditions?: string[];
  externalConditions?: string[];
  extensions?: string[];
  dedupe?: string[];
  preserveSymlinks?: boolean;
  noExternal?: string | RegExp | (string | RegExp)[] | true;
  external?: string[] | true;
  builtins?: (string | RegExp)[];
}

/**
 * Alias configuration
 */
type Alias = {
  find: string | RegExp;
  replacement: string;
  customResolver?: ResolverFunction | ResolverObject;
};

type AliasOptions = readonly Alias[] | { [find: string]: string };

/**
 * Resolver function type
 */
type ResolverFunction = (
  id: string,
  importer?: string
) => string | undefined | Promise<string | undefined>;

/**
 * Resolver object type
 */
interface ResolverObject {
  buildStart?: () => void | Promise<void>;
  resolveId: ResolverFunction;
}

/**
 * Internal resolution options (extended)
 */
interface InternalResolveOptions extends Required<ResolveOptions> {
  root: string;
  isBuild: boolean;
  isProduction: boolean;
  asSrc?: boolean;
  tryIndex?: boolean;
  preferRelative?: boolean;
  isRequire?: boolean;
  scan?: boolean;
}
```
