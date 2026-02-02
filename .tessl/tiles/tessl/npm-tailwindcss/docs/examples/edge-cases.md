# Edge Cases and Advanced Scenarios

Advanced scenarios, corner cases, and edge case handling for TailwindCSS v4.

## Empty Input Handling

```typescript
import { compile, Features } from 'tailwindcss';

// Empty CSS input
const emptyResult = await compile('');
// emptyResult.build([]) returns empty string
// emptyResult.features === Features.None (0)
// emptyResult.sources === []
// emptyResult.root === null
```

## No Candidates

```typescript
// CSS with no utilities - only theme
const themeOnly = await compile('@theme { --color-primary: #3b82f6; }');
const output = themeOnly.build([]);
// Returns only @theme CSS block, no utility classes
```

## Multiple @source Directives

```typescript
const multiSource = await compile(`
  @source "./src/**/*.js";
  @source "./lib/**/*.ts";
  @source "!./exclude/**";
`);
// multiSource.sources.length === 3
// multiSource.sources[2].negated === true
```

## Features Bitmask Checking

```typescript
import { compile, Features } from 'tailwindcss';

const result = await compile(css);

// Check individual features
if (result.features & Features.AtApply) {
  console.log('CSS uses @apply directive');
}

if (result.features & Features.ThemeFunction) {
  console.log('CSS uses theme() function');
}

// Check multiple features
const hasUtilities = (result.features & Features.Utilities) !== 0;
const hasVariants = (result.features & Features.Variants) !== 0;

// Check if any features were used
const hasAnyFeatures = result.features !== Features.None;
```

## Custom Module Loader Error Handling

```typescript
import { compile } from 'tailwindcss';
import { resolve, dirname } from 'path';

const result = await compile(css, {
  base: './src',
  async loadModule(id, base, resourceHint) {
    try {
      const fullPath = resolve(base, id);
      const module = await import(fullPath);
      return {
        path: fullPath,
        base: dirname(fullPath),
        module,
      };
    } catch (error) {
      // Throw error to propagate to compilation
      throw new Error(`Failed to load module ${id}: ${error.message}`);
    }
  },
});
```

## Root Source Configuration

```typescript
const result = await compile(css);

// Check root configuration
if (result.root === null) {
  // No @source directive found
} else if (result.root === 'none') {
  // @source(none) was explicitly set
} else if (typeof result.root === 'object') {
  // Explicit pattern: { base: string, pattern: string }
  console.log(result.root.base, result.root.pattern);
}
```

## Polyfill Combinations

```typescript
import { compile, Polyfills } from 'tailwindcss';

// Enable all polyfills
const result1 = await compile(css, {
  polyfills: Polyfills.All,
});

// Enable specific polyfill
const result2 = await compile(css, {
  polyfills: Polyfills.ColorMix,
});

// Combine polyfills
const result3 = await compile(css, {
  polyfills: Polyfills.AtProperty | Polyfills.ColorMix,
});
```

## Plugin with Null Modifier

```typescript
import plugin from 'tailwindcss/plugin';

plugin(function ({ matchUtilities }) {
  matchUtilities(
    {
      'custom': (value, { modifier }) => {
        const base = { property: value };
        // modifier can be null
        if (modifier !== null) {
          return { ...base, 'modifier-property': modifier };
        }
        return base;
      },
    },
    { values: { test: 'value' } }
  );
});
```

## Theme Resolution Fallback Chain

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem(css);

// Theme.get() tries keys in order until match found
const value = designSystem.theme.get([
  '--color-custom',
  '--color-primary',
  '--color-blue-500',
]);
// Returns first matching value or null
```

## Candidate Parsing Multiple Interpretations

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

// parseCandidate() returns array - one candidate can parse to multiple interpretations
const candidates = designSystem.parseCandidate('hover:bg-blue-500');
// May return multiple candidate objects for different interpretations
```

## Class Order with Null Values

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

const classes = ['p-4', 'hover:bg-blue-500', 'invalid-class', 'mt-2'];
const ordered = designSystem.getClassOrder(classes);

// ordered contains [string, bigint | null][] tuples
// null indicates invalid/unorderable classes
ordered.forEach(([className, order]) => {
  if (order === null) {
    console.log(`${className} is invalid or unorderable`);
  }
});
```

## Canonicalization and Deduplication

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

// Normalize variant order and deduplicate
const classes = [
  'hover:bg-blue-500',
  'bg-blue-500:hover', // Different order, same result
  'md:hover:text-white',
  'hover:md:text-white', // Different order, same result
];

const normalized = designSystem.canonicalizeCandidates(classes);
// Returns normalized versions, duplicates may be identical after normalization
```

## Error Handling Patterns

```typescript
import { compile } from 'tailwindcss';

async function safeCompile(css: string, options?: CompileOptions) {
  try {
    const result = await compile(css, options);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const { success, result, error } = await safeCompile(css);
if (success) {
  const output = result!.build([]);
} else {
  console.error('Compilation failed:', error);
}
```

## Important Flag with Prefix

```typescript
// Configuration
export default {
  prefix: 'tw-',
  important: true,
};

// Generated classes: !tw-flex, !tw-bg-blue-500
// Important flag is separate from prefix
```

## Variant Order Specificity

```typescript
// hover:md:bg-blue-500 vs md:hover:bg-blue-500
// Different specificity and behavior
// canonicalizeCandidates() normalizes order to consistent format

const designSystem = await __unstable__loadDesignSystem('');
const normalized = designSystem.canonicalizeCandidates([
  'hover:md:bg-blue-500',
  'md:hover:bg-blue-500',
]);
// Both normalize to same canonical form
```

## Nested CssInJs Objects

```typescript
import plugin from 'tailwindcss/plugin';

plugin(function ({ addUtilities }) {
  addUtilities({
    '.parent': {
      color: 'red',
      '&:hover': {
        color: 'blue',
        '& .child': {
          padding: '1rem',
        },
      },
    },
  });
});
```

## Reference

- [Compilation API](../reference/compilation.md)
- [Plugin API](../reference/plugin.md)
- [Design System API](../reference/design-system.md)
- [Candidates & Variants](../reference/candidates-variants.md)

