# Plugin Development Guide

This guide covers creating custom TailwindCSS plugins to extend functionality.

## Basic Plugin

A plugin is a function that receives a PluginAPI object:

```typescript
import plugin from 'tailwindcss/plugin';

const myPlugin = plugin(function ({ addUtilities, addComponents, addVariant }) {
  // Add utilities
  addUtilities({
    '.custom-utility': {
      display: 'flex',
      justifyContent: 'center',
    },
  });

  // Add components
  addComponents({
    '.card': {
      padding: '1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  });

  // Add variants
  addVariant('optional', '&:optional');
});
```

## Plugin with Options

Create configurable plugins using `plugin.withOptions()`:

```typescript
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
  }
);

// Use with options
export default {
  plugins: [
    myPlugin({
      className: 'centered',
      respectPrefix: true,
    }),
  ],
};
```

## Functional Utilities

Create utilities that accept values using `matchUtilities()`:

```typescript
plugin(function ({ matchUtilities, theme }) {
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
});
```

## Functional Variants

Create variants that accept values using `matchVariant()`:

```typescript
plugin(function ({ matchVariant }) {
  matchVariant('supports', (value) => `@supports (${value})`);
  
  matchVariant('nth', (value) => `&:nth-child(${value})`);
});
```

## Using Theme Values

Access theme values in plugins:

```typescript
plugin(function ({ addUtilities, theme }) {
  const colors = theme('colors');
  const spacing = theme('spacing.4', '1rem'); // with default

  addUtilities({
    '.custom': {
      padding: spacing,
      color: colors.blue[500],
    },
  });
});
```

## Plugin with Configuration

Plugins can provide additional configuration:

```typescript
const buttonPlugin = plugin(
  function ({ addComponents, theme }) {
    addComponents({
      '.btn': {
        padding: theme('spacing.4'),
        borderRadius: theme('borderRadius.md'),
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
```

## Complete Example

```typescript
import plugin from 'tailwindcss/plugin';

interface AnimationOptions {
  prefix?: string;
}

const animationPlugin = plugin.withOptions<AnimationOptions>(
  function (options = {}) {
    return function ({ addUtilities, matchUtilities, addVariant, theme }) {
      const prefix = options.prefix || '';

      // Static utilities
      addUtilities({
        [`.${prefix}animate-spin-slow`]: {
          animation: 'spin 3s linear infinite',
        },
      });

      // Functional utilities
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

      // Variants
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
    };
  },
  function (options = {}) {
    return {
      theme: {
        extend: {
          transitionDelay: {
            0: '0ms',
            100: '100ms',
          },
        },
      },
    };
  }
);

export default animationPlugin;
```

## Reference

- [Complete Plugin API Reference](../reference/plugin.md)
- [Configuration Reference](../reference/configuration.md)

