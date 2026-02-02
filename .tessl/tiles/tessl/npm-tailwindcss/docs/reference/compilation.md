# CSS Compilation

The compilation API provides functions for processing CSS with TailwindCSS features including @apply, @theme, utilities, and variants.

## Capabilities

### Compile CSS String

Compiles a CSS string with full TailwindCSS processing.

```typescript { .api }
/**
 * Compiles CSS string with TailwindCSS processing
 * @param css - CSS string to compile
 * @param opts - Compilation options
 * @returns Promise resolving to CompileResult with build methods
 */
function compile(css: string, opts?: CompileOptions): Promise<CompileResult>;

interface CompileOptions {
  /** Base directory for resolving imports and modules */
  base?: string;

  /** Source file path for error reporting and source maps */
  from?: string;

  /** Polyfill configuration for CSS features */
  polyfills?: Polyfills;

  /** Custom module loader for @plugin and @config directives */
  loadModule?: (
    id: string,
    base: string,
    resourceHint: 'plugin' | 'config'
  ) => Promise<{
    path: string;
    base: string;
    module: any;
  }>;

  /** Custom stylesheet loader for @import directives */
  loadStylesheet?: (
    id: string,
    base: string
  ) => Promise<{
    path: string;
    base: string;
    content: string;
  }>;
}

interface CompileResult {
  /** Array of source patterns for content scanning */
  sources: { base: string; pattern: string; negated: boolean }[];

  /** Root source configuration */
  root: Root;

  /** Feature flags indicating which TailwindCSS features were used */
  features: Features;

  /** Build the final CSS string with candidate classes */
  build: (candidates: string[]) => string;

  /** Generate source map for the compiled CSS */
  buildSourceMap: () => DecodedSourceMap;
}
```

**Usage Examples:**

```typescript
import { compile, Polyfills } from 'tailwindcss';

// Basic compilation
const result = await compile(`
  @theme {
    --color-primary: #3b82f6;
  }

  .button {
    @apply bg-primary text-white px-4 py-2 rounded;
  }
`);

// Build with candidate classes found in HTML/templates
const candidates = ['bg-primary', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-blue-600'];
const css = result.build(candidates);
console.log(css);

// With custom base directory
const result2 = await compile(cssString, {
  base: './src/styles',
  from: 'app.css',
});

// Build with candidates
const css2 = result2.build(['flex', 'items-center', 'justify-between']);

// Generate source map
const sourceMap = result2.buildSourceMap();
```

### Compile AST Nodes

Compiles pre-parsed AST nodes directly, useful for advanced use cases where you're manipulating AST before compilation.

```typescript { .api }
/**
 * Compiles AST nodes directly without parsing
 * @param input - Array of AST nodes to compile
 * @param opts - Compilation options
 * @returns Promise resolving to CompileAstResult with build method
 */
function compileAst(
  input: AstNode[],
  opts?: CompileOptions
): Promise<CompileAstResult>;

interface CompileAstResult {
  /** Array of source patterns for content scanning */
  sources: { base: string; pattern: string; negated: boolean }[];

  /** Root source configuration */
  root: Root;

  /** Feature flags indicating which TailwindCSS features were used */
  features: Features;

  /** Build the final AST with candidate classes */
  build: (candidates: string[]) => AstNode[];
}
```

**Note:** The `compileAst` function is primarily for internal use and advanced integrations. It requires pre-constructed AST nodes which are not part of the public API.

### Load Design System

Internal unstable API for loading a design system from CSS. This is primarily used internally but exposed for advanced use cases.

```typescript { .api }
/**
 * Loads design system from CSS (unstable API)
 * @param css - CSS string containing theme and configuration
 * @param opts - Compilation options
 * @returns Promise resolving to DesignSystem instance
 */
function __unstable__loadDesignSystem(
  css: string,
  opts?: CompileOptions
): Promise<DesignSystem>;
```

**Warning:** This is an unstable API that may change in future versions.

## Types

### Root Type

Represents the root source configuration for content scanning.

```typescript { .api }
/**
 * Root source configuration
 */
type Root =
  /** Unknown root (not specified) */
  | null
  /** No content scanning specified via source(none) */
  | 'none'
  /** Explicit source pattern specified */
  | { base: string; pattern: string };
```

### Polyfills Enum

Controls which CSS feature polyfills are applied during compilation.

```typescript { .api }
/**
 * Flags for controlling CSS feature polyfills
 */
enum Polyfills {
  /** No polyfills */
  None = 0,

  /** Add fallbacks for @property rules */
  AtProperty = 1,

  /** Add fallbacks for color-mix() function */
  ColorMix = 2,

  /** All polyfills enabled */
  All = 3
}
```

### Features Enum

Indicates which TailwindCSS features were detected during compilation.

```typescript { .api }
/**
 * Flags indicating which TailwindCSS features were used during compilation
 */
enum Features {
  /** No features used */
  None = 0,

  /** @apply directive was used */
  AtApply = 1,

  /** @import directive was used */
  AtImport = 2,

  /** @plugin or @config directive was used (v3 compatibility) */
  JsPluginCompat = 4,

  /** theme() function was used */
  ThemeFunction = 8,

  /** @tailwind utilities directive was used */
  Utilities = 16,

  /** @variant directive was used */
  Variants = 32,

  /** @theme directive was used */
  AtTheme = 64
}
```

**Usage Examples:**

```typescript
import { compile, Features } from 'tailwindcss';

const result = await compile(css);

// Check which features were used
if (result.features & Features.AtApply) {
  console.log('CSS uses @apply directive');
}

if (result.features & Features.ThemeFunction) {
  console.log('CSS uses theme() function');
}

// Check for any v3 compatibility features
if (result.features & Features.JsPluginCompat) {
  console.warn('CSS uses v3 compatibility features');
}
```

## Loading Custom Modules and Stylesheets

You can provide custom loaders for @plugin, @config, and @import directives.

**Module Loader Example:**

```typescript
import { compile } from 'tailwindcss';
import { resolve } from 'path';
import { readFile } from 'fs/promises';

const result = await compile(css, {
  base: './src',
  async loadModule(id, base, resourceHint) {
    const fullPath = resolve(base, id);
    const module = await import(fullPath);
    return {
      path: fullPath,
      base: dirname(fullPath),
      module,
    };
  },
});
```

**Stylesheet Loader Example:**

```typescript
import { compile } from 'tailwindcss';
import { resolve } from 'path';
import { readFile } from 'fs/promises';

const result = await compile(css, {
  base: './src',
  async loadStylesheet(id, base) {
    const fullPath = resolve(base, id);
    const content = await readFile(fullPath, 'utf-8');
    return {
      path: fullPath,
      base: dirname(fullPath),
      content,
    };
  },
});
```

## Using @apply Directive

When using the `@apply` directive in TailwindCSS v4, you need to either:

1. **Define utilities in @theme first**, OR
2. **Use @source directive** to tell TailwindCSS where to scan for utilities, OR
3. **Use @reference directive** when using CSS modules

**Example with @theme:**

```typescript
const css = `
  @theme {
    --color-primary: #3b82f6;
  }

  .button {
    @apply bg-primary text-white;
  }
`;

const result = await compile(css);
```

**Example with @source:**

```typescript
const css = `
  @source "../src/**/*.{js,jsx,ts,tsx}";

  .button {
    @apply bg-blue-500 text-white px-4 py-2;
  }
`;

const result = await compile(css);
```

Without one of these directives, utility classes in `@apply` may not be resolved, resulting in errors like "Cannot apply unknown utility class".

## Error Handling

Compilation may throw errors for invalid CSS syntax or TailwindCSS directives.

```typescript
import { compile } from 'tailwindcss';

try {
  const result = await compile(css);
  const output = result.build([]);
} catch (error) {
  console.error('Compilation error:', error);
}
```

