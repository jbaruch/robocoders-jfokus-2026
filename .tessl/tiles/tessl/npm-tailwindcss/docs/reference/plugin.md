# Plugin API

The Plugin API enables extending TailwindCSS with custom utilities, variants, components, and configuration.

## Capabilities

### Create Plugin

Create a Tailwind plugin with optional configuration.

```typescript { .api }
/**
 * Creates a Tailwind plugin
 * @param handler - Plugin function receiving the plugin API
 * @param config - Optional configuration to merge
 * @returns Plugin with config
 */
function plugin(
  handler: (api: PluginAPI) => void,
  config?: Partial<Config>
): PluginWithConfig;
```

**Usage Examples:**

```typescript
import plugin from 'tailwindcss/plugin';

// Simple plugin
const myPlugin = plugin(function ({ addUtilities }) {
  addUtilities({
    '.content-auto': {
      'content-visibility': 'auto',
    },
    '.content-hidden': {
      'content-visibility': 'hidden',
    },
    '.content-visible': {
      'content-visibility': 'visible',
    },
  });
});

// Plugin with theme configuration
const buttonPlugin = plugin(
  function ({ addComponents, theme }) {
    addComponents({
      '.btn': {
        padding: theme('spacing.4'),
        borderRadius: theme('borderRadius.md'),
        fontWeight: theme('fontWeight.semibold'),
      },
      '.btn-primary': {
        backgroundColor: theme('colors.blue.500'),
        color: theme('colors.white'),
      },
    });
  },
  {
    theme: {
      extend: {
        colors: {
          'btn-primary': '#3b82f6',
        },
      },
    },
  }
);

export default {
  plugins: [myPlugin, buttonPlugin],
};
```

### Create Plugin with Options

Create a plugin that accepts options.

```typescript { .api }
/**
 * Creates a plugin that accepts options
 */
namespace plugin {
  function withOptions<T>(
    pluginFunction: (options: T) => (api: PluginAPI) => void,
    configFunction?: (options: T) => Partial<Config>
  ): PluginWithOptions<T>;
}
```

**Usage Examples:**

```typescript
import plugin from 'tailwindcss/plugin';

interface MyPluginOptions {
  className?: string;
  respectPrefix?: boolean;
}

const myPlugin = plugin.withOptions<MyPluginOptions>(
  function (options = {}) {
    return function ({ addUtilities, prefix }) {
      const className = options.className || 'custom';
      const name = options.respectPrefix ? prefix(className) : className;

      addUtilities({
        [`.${name}`]: {
          display: 'flex',
          justifyContent: 'center',
        },
      });
    };
  },
  function (options = {}) {
    return {
      theme: {
        extend: {
          // Add theme extensions based on options
        },
      },
    };
  }
);

// Use plugin with options
export default {
  plugins: [
    myPlugin({
      className: 'centered',
      respectPrefix: true,
    }),
  ],
};
```

## Plugin API Interface

The API object provided to plugin functions.

```typescript { .api }
interface PluginAPI {
  /**
   * Add base styles (like CSS resets)
   * @param base - CSS-in-JS object
   */
  addBase(base: CssInJs): void;

  /**
   * Add a static variant
   * @param name - Variant name
   * @param variant - CSS selector, array of selectors, or CSS-in-JS object
   */
  addVariant(name: string, variant: string | string[] | CssInJs): void;

  /**
   * Add a functional variant that accepts values
   * @param name - Variant name
   * @param cb - Function that generates selector(s) from value
   * @param options - Optional configuration
   */
  matchVariant<T>(
    name: string,
    cb: (
      value: T | string,
      extra: { modifier: string | null }
    ) => string | string[],
    options?: {
      values?: Record<string, T>;
      sort?: (
        a: { value: T; modifier: string | null },
        b: { value: T; modifier: string | null }
      ) => number;
    }
  ): void;

  /**
   * Add static utilities
   * @param utilities - CSS-in-JS object or array of objects
   * @param options - Optional configuration
   */
  addUtilities(
    utilities:
      | Record<string, CssInJs | CssInJs[]>
      | Record<string, CssInJs | CssInJs[]>[],
    options?: {}
  ): void;

  /**
   * Add functional utilities that accept values
   * @param utilities - Object mapping utility names to generator functions
   * @param options - Optional configuration including values and type
   */
  matchUtilities(
    utilities: Record<
      string,
      (value: string, extra: { modifier: string | null }) => CssInJs | CssInJs[]
    >,
    options?: {
      type?: string | string[];
      supportsNegativeValues?: boolean;
      values?: Record<string, string>;
      modifiers?: 'any' | Record<string, string>;
    }
  ): void;

  /**
   * Add component styles
   * @param utilities - CSS-in-JS object or array of objects
   * @param options - Optional configuration
   */
  addComponents(
    utilities: Record<string, CssInJs> | Record<string, CssInJs>[],
    options?: {}
  ): void;

  /**
   * Add functional components that accept values
   * @param utilities - Object mapping component names to generator functions
   * @param options - Optional configuration including values and type
   */
  matchComponents(
    utilities: Record<
      string,
      (value: string, extra: { modifier: string | null }) => CssInJs
    >,
    options?: {
      type?: string | string[];
      supportsNegativeValues?: boolean;
      values?: Record<string, string>;
      modifiers?: 'any' | Record<string, string>;
    }
  ): void;

  /**
   * Access theme value
   * @param path - Dot-notation path to theme value
   * @param defaultValue - Default value if path not found
   * @returns Theme value
   */
  theme(path: string, defaultValue?: any): any;

  /**
   * Access config value
   * @param path - Dot-notation path to config value
   * @param defaultValue - Default value if path not found
   * @returns Config value
   */
  config(path?: string, defaultValue?: any): any;

  /**
   * Apply configured class prefix
   * @param className - Class name to prefix
   * @returns Prefixed class name
   */
  prefix(className: string): string;
}

/**
 * CSS-in-JS object format
 */
type CssInJs = Record<string, string | string[] | CssInJs>;
```

## Plugin API Examples

### Add Base Styles

```typescript
plugin(function ({ addBase }) {
  addBase({
    h1: {
      fontSize: '2rem',
      fontWeight: '700',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: '600',
    },
    a: {
      color: '#3b82f6',
      textDecoration: 'underline',
    },
  });
});
```

### Add Static Variants

```typescript
plugin(function ({ addVariant }) {
  // Simple selector variant
  addVariant('optional', '&:optional');
  addVariant('hocus', ['&:hover', '&:focus']);

  // Pseudo-element variant
  addVariant('first-letter', '&::first-letter');

  // Complex selector variant
  addVariant('not-first', '&:not(:first-child)');

  // Parent selector variant
  addVariant('group-optional', ':merge(.group):optional &');
});
```

### Add Functional Variants

```typescript
plugin(function ({ matchVariant }) {
  // Supports variant that accepts @supports queries
  matchVariant('supports', (value) => `@supports (${value})`);

  // nth-child variant
  matchVariant('nth', (value) => `&:nth-child(${value})`);

  // Data attribute variant with predefined values
  matchVariant(
    'data',
    (value) => `&[data-${value}]`,
    {
      values: {
        checked: 'checked',
        disabled: 'disabled',
        loading: 'loading',
      },
    }
  );

  // Area variant with modifiers
  matchVariant('area', (value, { modifier }) => {
    if (modifier) {
      return `@container ${modifier} (min-width: ${value})`;
    }
    return `@container (min-width: ${value})`;
  });
});
```

### Add Static Utilities

```typescript
plugin(function ({ addUtilities }) {
  addUtilities({
    '.scrollbar-hide': {
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    '.scrollbar-default': {
      '-ms-overflow-style': 'auto',
      'scrollbar-width': 'auto',
      '&::-webkit-scrollbar': {
        display: 'block',
      },
    },
  });
});
```

### Add Functional Utilities

```typescript
plugin(function ({ matchUtilities, theme }) {
  // Grid column span utility
  matchUtilities(
    {
      'grid-cols': (value) => ({
        'grid-template-columns': `repeat(${value}, minmax(0, 1fr))`,
      }),
    },
    {
      values: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        6: '6',
        12: '12',
      },
    }
  );

  // Custom spacing utility from theme
  matchUtilities(
    {
      'scroll-m': (value) => ({
        'scroll-margin': value,
      }),
    },
    {
      values: theme('spacing'),
    }
  );

  // Utility with modifiers
  matchUtilities(
    {
      'bg-gradient': (value, { modifier }) => ({
        'background-image': `linear-gradient(${value}, var(--tw-gradient-stops))`,
        ...(modifier && { 'background-size': modifier }),
      }),
    },
    {
      values: {
        0: '0deg',
        45: '45deg',
        90: '90deg',
        180: '180deg',
      },
      modifiers: 'any',
    }
  );

  // Utility with negative value support
  matchUtilities(
    {
      'inset-shadow': (value) => ({
        'box-shadow': `inset 0 2px 4px 0 rgb(0 0 0 / ${value})`,
      }),
    },
    {
      values: theme('opacity'),
      supportsNegativeValues: false,
      type: 'number',
    }
  );
});
```

### Add Components

```typescript
plugin(function ({ addComponents, theme }) {
  addComponents({
    '.card': {
      backgroundColor: theme('colors.white'),
      borderRadius: theme('borderRadius.lg'),
      padding: theme('spacing.6'),
      boxShadow: theme('boxShadow.xl'),
    },
    '.card-title': {
      fontSize: theme('fontSize.xl'),
      fontWeight: theme('fontWeight.bold'),
      marginBottom: theme('spacing.2'),
    },
  });
});
```

### Use Theme and Config

```typescript
plugin(function ({ addUtilities, theme, config }) {
  // Access theme values
  const colors = theme('colors');
  const spacing = theme('spacing.4', '1rem'); // with default

  // Access config values
  const prefix = config('prefix', '');
  const important = config('important', false);

  addUtilities({
    '.custom': {
      padding: spacing,
      color: colors.blue[500],
    },
  });
});
```

### Use Prefix

```typescript
plugin(function ({ addUtilities, prefix }) {
  // Manually apply prefix when needed
  addUtilities({
    [`.${prefix('custom-utility')}`]: {
      display: 'flex',
    },
  });
});
```

## Complete Plugin Example

```typescript
import plugin from 'tailwindcss/plugin';

interface AnimationOptions {
  prefix?: string;
  respectImportant?: boolean;
}

const animationPlugin = plugin.withOptions<AnimationOptions>(
  function (options = {}) {
    return function ({ addUtilities, matchUtilities, addVariant, theme, config }) {
      const prefix = options.prefix || '';

      // Add static utilities
      addUtilities({
        [`.${prefix}animate-spin-slow`]: {
          animation: 'spin 3s linear infinite',
        },
        [`.${prefix}animate-bounce-slow`]: {
          animation: 'bounce 2s infinite',
        },
      });

      // Add functional utilities
      matchUtilities(
        {
          [`${prefix}animation-delay`]: (value) => ({
            'animation-delay': value,
          }),
        },
        {
          values: theme('transitionDelay'),
        }
      );

      // Add variant
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
      addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');
    };
  },
  function (options = {}) {
    return {
      theme: {
        extend: {
          transitionDelay: {
            0: '0ms',
            100: '100ms',
            200: '200ms',
            500: '500ms',
            1000: '1000ms',
          },
        },
      },
    };
  }
);

export default animationPlugin;
```

## Types

```typescript { .api }
type Config = UserConfig;

type PluginCreator = (api: PluginAPI) => void;

interface PluginWithConfig {
  handler: PluginCreator;
  config?: Partial<Config>;
}

interface PluginWithOptions<T> {
  (options?: T): PluginWithConfig;
  __isOptionsFunction: true;
}
```

