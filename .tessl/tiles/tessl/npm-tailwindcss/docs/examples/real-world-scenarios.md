# Real-World Scenarios

Common usage patterns and examples for TailwindCSS v4.

## Build Tool Integration

### Webpack Integration

```typescript
import { compile } from 'tailwindcss';
import { readFile } from 'fs/promises';

async function processTailwind(inputPath: string, outputPath: string) {
  const css = await readFile(inputPath, 'utf-8');
  const result = await compile(css, {
    base: process.cwd(),
    from: inputPath,
  });

  // Extract candidates from your HTML/JSX files
  const candidates = extractCandidatesFromFiles(['./src/**/*.{js,jsx,ts,tsx}']);
  
  const output = result.build(candidates);
  await writeFile(outputPath, output);
}
```

### Vite Integration

```typescript
import { compile } from 'tailwindcss';

export default {
  plugins: [
    {
      name: 'tailwind',
      async transform(code, id) {
        if (id.endsWith('.css')) {
          const result = await compile(code, { from: id });
          const candidates = extractCandidates(code);
          return result.build(candidates);
        }
      },
    },
  ],
};
```

## Dynamic Theme Generation

```typescript
import { compile } from 'tailwindcss';

function generateTheme(colors: Record<string, string>) {
  const themeVars = Object.entries(colors)
    .map(([key, value]) => `    --color-${key}: ${value};`)
    .join('\n');

  const css = `
    @theme {
${themeVars}
    }
  `;

  return compile(css);
}

// Usage
const result = await generateTheme({
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#10b981',
});
```

## Component Library Plugin

```typescript
import plugin from 'tailwindcss/plugin';

const componentLibrary = plugin(function ({ addComponents, theme }) {
  addComponents({
    '.btn': {
      padding: theme('spacing.4'),
      borderRadius: theme('borderRadius.md'),
      fontWeight: theme('fontWeight.semibold'),
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-1px)',
      },
    },
    '.btn-primary': {
      backgroundColor: theme('colors.blue.500'),
      color: theme('colors.white'),
      '&:hover': {
        backgroundColor: theme('colors.blue.600'),
      },
    },
    '.btn-secondary': {
      backgroundColor: theme('colors.gray.200'),
      color: theme('colors.gray.800'),
      '&:hover': {
        backgroundColor: theme('colors.gray.300'),
      },
    },
  });
});
```

## Custom Utility Generator

```typescript
import plugin from 'tailwindcss/plugin';

const spacingUtilities = plugin(function ({ matchUtilities, theme }) {
  matchUtilities(
    {
      'space-x': (value) => ({
        '& > :not([hidden]) ~ :not([hidden])': {
          '--tw-space-x-reverse': '0',
          marginRight: `calc(${value} * var(--tw-space-x-reverse))`,
          marginLeft: `calc(${value} * calc(1 - var(--tw-space-x-reverse)))`,
        },
      }),
      'space-y': (value) => ({
        '& > :not([hidden]) ~ :not([hidden])': {
          '--tw-space-y-reverse': '0',
          marginTop: `calc(${value} * calc(1 - var(--tw-space-y-reverse)))`,
          marginBottom: `calc(${value} * var(--tw-space-y-reverse))`,
        },
      }),
    },
    {
      values: theme('spacing'),
    }
  );
});
```

## Dark Mode Variant

```typescript
import plugin from 'tailwindcss/plugin';

const darkModePlugin = plugin(function ({ addVariant }) {
  addVariant('dark', [
    '@media (prefers-color-scheme: dark)',
    '.dark &',
  ]);
});
```

## Responsive Container Queries

```typescript
import plugin from 'tailwindcss/plugin';

const containerQueries = plugin(function ({ matchVariant }) {
  matchVariant('container', (value, { modifier }) => {
    if (modifier) {
      return `@container ${modifier} (min-width: ${value})`;
    }
    return `@container (min-width: ${value})`;
  });
});
```

## Custom Color System

```typescript
import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';

const brandColors = plugin(
  function ({ addUtilities, theme }) {
    const brandColors = {
      primary: colors.blue,
      secondary: colors.purple,
      accent: colors.green,
    };

    Object.entries(brandColors).forEach(([name, colorScale]) => {
      Object.entries(colorScale).forEach(([shade, value]) => {
        addUtilities({
          [`.bg-${name}-${shade}`]: {
            backgroundColor: value,
          },
          [`.text-${name}-${shade}`]: {
            color: value,
          },
        });
      });
    });
  },
  {
    theme: {
      extend: {
        colors: {
          brand: {
            primary: colors.blue,
            secondary: colors.purple,
          },
        },
      },
    },
  }
);
```

## Source Map Generation

```typescript
import { compile } from 'tailwindcss';
import { writeFile } from 'fs/promises';

async function compileWithSourceMap(css: string, outputPath: string) {
  const result = await compile(css, {
    from: 'input.css',
  });

  const candidates = extractCandidates();
  const output = result.build(candidates);
  const sourceMap = result.buildSourceMap();

  await writeFile(outputPath, output);
  await writeFile(`${outputPath}.map`, JSON.stringify(sourceMap));
  
  // Add source map comment
  const withComment = `${output}\n/*# sourceMappingURL=${outputPath}.map */`;
  await writeFile(outputPath, withComment);
}
```

## Multi-Theme Support

```typescript
import { compile } from 'tailwindcss';

async function compileThemes(themes: Record<string, Record<string, string>>) {
  const results: Record<string, string> = {};

  for (const [themeName, colors] of Object.entries(themes)) {
    const themeVars = Object.entries(colors)
      .map(([key, value]) => `    --color-${key}: ${value};`)
      .join('\n');

    const css = `
      @theme {
${themeVars}
      }
    `;

    const result = await compile(css);
    results[themeName] = result.build([]);
  }

  return results;
}
```

## Reference

- [Compilation API](../reference/compilation.md)
- [Plugin API](../reference/plugin.md)
- [Edge Cases](./edge-cases.md)

