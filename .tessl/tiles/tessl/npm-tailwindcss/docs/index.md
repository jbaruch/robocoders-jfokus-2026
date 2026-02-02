# TailwindCSS

TailwindCSS is a utility-first CSS framework with a programmatic API for CSS compilation, plugin system, and theme management. Version 4.x introduces an AST-based architecture with direct compilation APIs and extensive TypeScript support.

## Quick Start

```typescript
import { compile } from 'tailwindcss';

const css = `
  @theme {
    --color-primary: #3b82f6;
  }

  .button {
    @apply bg-primary text-white px-4 py-2 rounded;
  }
`;

const result = await compile(css, { base: process.cwd() });
const output = result.build(['bg-primary', 'text-white', 'px-4', 'py-2', 'rounded']);
```

**Installation:** `npm install tailwindcss@4.1.18`

**Documentation:** https://tailwindcss.com

## Core Concepts

TailwindCSS v4 provides:

- **Compilation API**: `compile()` and `compileAst()` for processing CSS with @apply, @theme, utilities, and variants
- **Plugin System**: Extensible API for adding custom utilities, variants, and components
- **Theme Management**: CSS variable-based theming with programmatic access
- **Design System**: Central coordination object for theme, utilities, variants, and compilation
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Quick Reference

### Core Imports

```typescript { .api }
import { compile, compileAst, type CompileOptions } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
```

### Main APIs

| API | Purpose | Reference |
|-----|---------|-----------|
| `compile()` | Compile CSS with TailwindCSS processing | [Compilation](./reference/compilation.md) |
| `plugin()` | Create custom plugins | [Plugin API](./reference/plugin.md) |
| `UserConfig` | Configuration interface | [Configuration](./reference/configuration.md) |
| `DesignSystem` | Theme, utilities, variants coordination | [Design System](./reference/design-system.md) |
| `Theme` | Programmatic theme management | [Theme System](./reference/theme.md) |

### Key Types

```typescript { .api }
// Compilation
function compile(css: string, opts?: CompileOptions): Promise<CompileResult>;
interface CompileResult {
  build: (candidates: string[]) => string;
  buildSourceMap: () => DecodedSourceMap;
  features: Features;
  sources: { base: string; pattern: string; negated: boolean }[];
  root: Root;
}

// Plugin
function plugin(handler: (api: PluginAPI) => void, config?: Partial<Config>): PluginWithConfig;
interface PluginAPI {
  addUtilities(utilities: Record<string, CssInJs> | Record<string, CssInJs>[]): void;
  addComponents(utilities: Record<string, CssInJs> | Record<string, CssInJs>[]): void;
  addVariant(name: string, variant: string | string[] | CssInJs): void;
  matchUtilities(utilities: Record<string, (value: string, extra: { modifier: string | null }) => CssInJs>): void;
  theme(path: string, defaultValue?: any): any;
  config(path?: string, defaultValue?: any): any;
  prefix(className: string): string;
}

// Configuration
interface UserConfig {
  presets?: UserConfig[];
  theme?: ThemeConfig;
  plugins?: Plugin[];
  content?: ContentFile[] | { relative?: boolean; files: ContentFile[] };
  darkMode?: DarkModeStrategy;
  prefix?: string;
  blocklist?: string[];
  important?: boolean | string;
  future?: 'all' | Record<string, boolean>;
  experimental?: 'all' | Record<string, boolean>;
}
```

## Documentation Structure

### Guides

- **[Quick Start Guide](./guides/quick-start.md)** - Step-by-step getting started tutorial
- **[Plugin Development](./guides/plugin-development.md)** - Creating custom plugins

### Examples

- **[Real-World Scenarios](./examples/real-world-scenarios.md)** - Common usage patterns and examples
- **[Edge Cases](./examples/edge-cases.md)** - Advanced scenarios and corner cases

### Reference

- **[CSS Compilation](./reference/compilation.md)** - Complete compilation API reference
- **[Plugin API](./reference/plugin.md)** - Complete plugin API reference
- **[Configuration](./reference/configuration.md)** - Configuration options and types
- **[Design System](./reference/design-system.md)** - DesignSystem API reference
- **[Theme System](./reference/theme.md)** - Theme class API reference
- **[Colors & Default Theme](./reference/colors-theme.md)** - Color palette and default theme
- **[Candidates & Variants](./reference/candidates-variants.md)** - Candidate and variant types
- **[IntelliSense](./reference/intellisense.md)** - IntelliSense support APIs
- **[Source Maps](./reference/source-maps.md)** - Source map generation

## Common Workflows

### Compile CSS

```typescript
import { compile } from 'tailwindcss';

const result = await compile(css, { base: './src' });
const output = result.build(candidates);
```

### Create Plugin

```typescript
import plugin from 'tailwindcss/plugin';

const myPlugin = plugin(function ({ addUtilities }) {
  addUtilities({
    '.custom': { display: 'flex' },
  });
});
```

### Configure Theme

```typescript
export default {
  theme: {
    extend: {
      colors: { primary: '#3b82f6' },
    },
  },
};
```

## Architecture Overview

TailwindCSS v4 architecture:

- **Compilation Layer**: Processes CSS with TailwindCSS directives (@apply, @theme, @source)
- **Design System**: Coordinates theme, utilities, variants, and compilation
- **Plugin System**: Extensible architecture for custom functionality
- **Theme System**: CSS variable-based theming with programmatic resolution
- **Compatibility**: Backward compatibility with v3 API (colors, defaultTheme, plugins)

## Package Information

- **Package**: tailwindcss@4.1.18
- **Type**: npm
- **Language**: TypeScript
- **Official Docs**: https://tailwindcss.com
