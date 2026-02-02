# TypeScript Support

Vite provides first-class TypeScript support with automatic transpilation using esbuild. TypeScript files are transformed on-the-fly without type checking, enabling fast development with instant hot module replacement.

## Capabilities

### TypeScript Transpilation

Transform TypeScript code to JavaScript using esbuild for fast compilation.

```typescript { .api }
/**
 * Transform code with esbuild
 * @param code - Source code to transform
 * @param filename - File name (used to determine loader)
 * @param options - esbuild transform options
 * @param inMap - Input source map
 * @param config - Resolved Vite configuration
 * @param watcher - File system watcher for tracking tsconfig changes
 * @returns Transformed code with source map
 */
function transformWithEsbuild(
  code: string,
  filename: string,
  options?: TransformOptions,
  inMap?: object,
  config?: ResolvedConfig,
  watcher?: FSWatcher
): Promise<ESBuildTransformResult>;
```

**Usage Example:**

```typescript
import { transformWithEsbuild } from 'vite';

// Transform TypeScript code
const result = await transformWithEsbuild(
  'const message: string = "Hello";',
  'example.ts',
  {
    loader: 'ts',
    target: 'es2020'
  }
);

console.log(result.code); // Transpiled JavaScript
console.log(result.map);  // Source map

// Transform with JSX
const jsxResult = await transformWithEsbuild(
  'const element = <div>Hello</div>;',
  'Component.tsx',
  {
    loader: 'tsx',
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
);
```

### ESBuild Options

Configure esbuild transformation behavior for TypeScript and JavaScript files.

```typescript { .api }
/**
 * ESBuild plugin configuration options
 */
interface ESBuildOptions extends TransformOptions {
  /**
   * Files to include (glob patterns)
   */
  include?: string | RegExp | ReadonlyArray<string | RegExp>;

  /**
   * Files to exclude (glob patterns)
   */
  exclude?: string | RegExp | ReadonlyArray<string | RegExp>;

  /**
   * Code to inject before each JSX file
   * Useful for automatic React import
   */
  jsxInject?: string;

  /**
   * This option is not respected. Use `build.minify` instead.
   */
  minify?: never;
}

/**
 * Transform result with Vite-compatible source map
 */
type ESBuildTransformResult = Omit<TransformResult, 'map'> & {
  map: SourceMap;
};
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    // Automatically inject React import in JSX files
    jsxInject: `import React from 'react'`,

    // Configure JSX transformation
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',

    // Target ES version
    target: 'es2020',

    // Include decorators support
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true
      }
    },

    // File inclusion/exclusion
    include: /\.[jt]sx?$/,
    exclude: /node_modules/
  }
});
```

### TypeScript Configuration

Vite automatically reads and applies TypeScript compiler options from `tsconfig.json`.

**Respected Compiler Options:**
- `experimentalDecorators` - Enable decorator support
- `useDefineForClassFields` - Class field behavior
- `jsx` - JSX transformation mode
- `jsxFactory` - JSX factory function
- `jsxFragmentFactory` - JSX fragment factory
- `jsxImportSource` - JSX import source (for React 17+ automatic mode)
- `target` - Target JavaScript version
- `alwaysStrict` - Always emit 'use strict'
- `importsNotUsedAsValues` - Import elision behavior
- `preserveValueImports` - Preserve value imports
- `verbatimModuleSyntax` - Module syntax handling

```typescript { .api }
/**
 * TypeScript configuration that affects compilation
 */
interface TSCompilerOptions {
  experimentalDecorators?: boolean;
  useDefineForClassFields?: boolean;
  jsx?: 'preserve' | 'react' | 'react-jsx' | 'react-jsxdev';
  jsxFactory?: string;
  jsxFragmentFactory?: string;
  jsxImportSource?: string;
  target?: string;
  alwaysStrict?: boolean;
  importsNotUsedAsValues?: 'remove' | 'preserve' | 'error';
  preserveValueImports?: boolean;
  verbatimModuleSyntax?: boolean;
}
```

**Usage Example:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "experimentalDecorators": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "verbatimModuleSyntax": true
  }
}
```

These options are automatically applied by Vite during transformation.

### TypeScript-Only Syntax

Vite supports TypeScript-specific syntax including type-only imports/exports.

```typescript
// Type-only imports (erased at runtime)
import type { User } from './types';
import { type Config, helper } from './utils';

// Type-only exports
export type { User };
export { type Config };

// Enums (const enums recommended for tree-shaking)
enum Status {
  Active,
  Inactive
}

// Const enums (inlined at compile time)
const enum Direction {
  Up,
  Down,
  Left,
  Right
}

// Namespace (avoid in modern code, use ES modules)
namespace Utils {
  export function format(s: string): string {
    return s.trim();
  }
}

// Decorators (requires experimentalDecorators: true)
function log(target: any, propertyKey: string) {
  console.log(`${propertyKey} was called`);
}

class MyClass {
  @log
  myMethod() {}
}
```

### Type Checking

Vite does not perform type checking during transpilation for performance. Use separate tools for type checking.

**Development:**
```bash
# Run TypeScript compiler in watch mode (type checking only)
tsc --noEmit --watch

# Or use vite-plugin-checker for in-editor feedback
npm install -D vite-plugin-checker
```

**Configuration with checker plugin:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
    })
  ]
});
```

**Build:**
```bash
# Type check before build
tsc --noEmit && vite build
```

**Package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "type-check": "tsc --noEmit"
  }
}
```

### Client Types

Reference Vite's client types for TypeScript support in application code.

```typescript { .api }
/**
 * Add to tsconfig.json or as a triple-slash directive
 */
/// <reference types="vite/client" />

/**
 * Provides types for:
 * - import.meta.env
 * - import.meta.hot
 * - import.meta.glob
 * - Asset imports (CSS, images, etc.)
 * - Special imports (?raw, ?url, ?worker, etc.)
 */
```

**Usage Example:**

```typescript
// In a .d.ts file (e.g., env.d.ts or vite-env.d.ts)
/// <reference types="vite/client" />

// Extend built-in types
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Or in tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

### JSX Support

Configure JSX transformation for React, Preact, or other JSX-based frameworks.

**React (Classic):**
```typescript
// vite.config.ts
export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsxInject: `import React from 'react'`
  }
});
```

**React (Automatic - React 17+):**
```typescript
// vite.config.ts
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
});

// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

**Preact:**
```typescript
// vite.config.ts
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact'
  }
});
```

**Custom JSX:**
```typescript
// vite.config.ts
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'my-jsx-library'`
  }
});
```

### Source Maps

TypeScript source maps are generated automatically for debugging.

```typescript
// vite.config.ts
export default defineConfig({
  esbuild: {
    // Source maps are enabled by default in development
    // Configure explicitly if needed
    sourcemap: true,
    sourcefile: true
  },

  build: {
    // Source maps in production
    sourcemap: true, // or 'inline' or 'hidden'
  }
});
```

**Source map options:**
- `true` - Generate separate .map files
- `'inline'` - Inline source maps in the file
- `'hidden'` - Generate .map files but don't reference them
- `false` - No source maps

### Decorator Support

Enable experimental decorator support for TypeScript classes.

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true  // For reflect-metadata
  }
}

// vite.config.ts
export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true
      }
    }
  }
});

// Usage in code
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}
```

### File Extensions

Vite automatically handles TypeScript file extensions.

**Supported Extensions:**
- `.ts` - TypeScript files
- `.tsx` - TypeScript + JSX files
- `.mts` - TypeScript ES modules (treated as `.ts`)
- `.cts` - TypeScript CommonJS modules (treated as `.ts`)

```typescript
// Automatic loader detection based on extension
import utils from './utils.ts';        // Loaded as TypeScript
import Component from './App.tsx';      // Loaded as TSX
import config from './config.mts';     // Loaded as TypeScript
```

### Performance Considerations

Vite uses esbuild for extremely fast TypeScript transpilation.

**Speed Comparison:**
- esbuild: ~50x faster than tsc
- No type checking during transformation
- Ideal for development hot module replacement

**Tradeoffs:**
- No type checking (use tsc separately)
- Some TypeScript features not supported (e.g., const enums with external modules)
- Emit metadata requires additional setup

**Best Practices:**
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

Run type checking in parallel during development:
```bash
# Terminal 1: Development server
npm run dev

# Terminal 2: Type checking
npm run type-check:watch
```

## Types

```typescript { .api }
/**
 * Transform code with esbuild
 */
function transformWithEsbuild(
  code: string,
  filename: string,
  options?: TransformOptions,
  inMap?: object,
  config?: ResolvedConfig,
  watcher?: FSWatcher
): Promise<ESBuildTransformResult>;

/**
 * ESBuild transformation options
 */
interface ESBuildOptions extends TransformOptions {
  include?: string | RegExp | ReadonlyArray<string | RegExp>;
  exclude?: string | RegExp | ReadonlyArray<string | RegExp>;
  jsxInject?: string;
  minify?: never;
}

/**
 * Transform result with source map
 */
type ESBuildTransformResult = Omit<TransformResult, 'map'> & {
  map: SourceMap;
};

/**
 * esbuild TransformOptions (from esbuild package)
 */
interface TransformOptions {
  sourcemap?: boolean | 'inline' | 'external' | 'both';
  loader?: Loader;
  target?: string | string[];
  format?: 'iife' | 'cjs' | 'esm';
  jsxFactory?: string;
  jsxFragment?: string;
  jsx?: 'transform' | 'preserve' | 'automatic';
  jsxImportSource?: string;
  jsxDev?: boolean;
  tsconfigRaw?: string | TsconfigRaw;
  define?: Record<string, string>;
  pure?: string[];
  keepNames?: boolean;
  [key: string]: any;
}

/**
 * Loader type for different file extensions
 */
type Loader =
  | 'js'
  | 'jsx'
  | 'ts'
  | 'tsx'
  | 'css'
  | 'json'
  | 'text'
  | 'base64'
  | 'file'
  | 'dataurl'
  | 'binary'
  | 'default';

/**
 * Source map type
 */
interface SourceMap {
  file?: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent?: string[];
  version: number;
}
```
