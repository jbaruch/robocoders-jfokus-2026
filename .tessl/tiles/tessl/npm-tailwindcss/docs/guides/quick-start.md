# Quick Start Guide

This guide walks you through getting started with TailwindCSS v4 programmatic API.

## Installation

```bash
npm install tailwindcss@4.1.18
```

## Basic Compilation

The core API is the `compile()` function that processes CSS with TailwindCSS features.

```typescript
import { compile } from 'tailwindcss';

// Define your CSS with TailwindCSS directives
const css = `
  @theme {
    --color-primary: #3b82f6;
    --color-secondary: #8b5cf6;
  }

  .button {
    @apply bg-primary text-white px-4 py-2 rounded;
  }
`;

// Compile the CSS
const result = await compile(css, {
  base: process.cwd(),
});

// Build final CSS with candidate classes found in your HTML/templates
const candidates = ['bg-primary', 'text-white', 'px-4', 'py-2', 'rounded'];
const output = result.build(candidates);
console.log(output);
```

## Using @apply Directive

When using `@apply`, you need to either:

1. **Define utilities in @theme** (recommended for v4)
2. **Use @source directive** to scan files for utilities

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
  @source "./src/**/*.{js,jsx,ts,tsx}";

  .button {
    @apply bg-blue-500 text-white px-4 py-2;
  }
`;

const result = await compile(css);
```

## Creating a Plugin

Plugins extend TailwindCSS with custom utilities, variants, and components.

```typescript
import plugin from 'tailwindcss/plugin';

const myPlugin = plugin(function ({ addUtilities, theme }) {
  addUtilities({
    '.scrollbar-hide': {
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
  });
});

// Use in configuration
export default {
  plugins: [myPlugin],
};
```

## Configuration

Create a `tailwind.config.js` file:

```typescript
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
    },
  },

  plugins: [],
};
```

## Next Steps

- Read the [Compilation API reference](../reference/compilation.md) for detailed compilation options
- Explore [Plugin Development guide](./plugin-development.md) for advanced plugin creation
- Check [Real-World Scenarios](../examples/real-world-scenarios.md) for common patterns
- Review [Configuration reference](../reference/configuration.md) for all configuration options

