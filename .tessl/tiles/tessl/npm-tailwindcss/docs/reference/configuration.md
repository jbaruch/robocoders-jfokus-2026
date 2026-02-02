# Configuration

Configure TailwindCSS behavior including theme, plugins, content scanning, dark mode, prefixes, and feature flags.

## Capabilities

### User Configuration

Main configuration interface for TailwindCSS.

```typescript { .api }
/**
 * User configuration for TailwindCSS
 */
interface UserConfig {
  /** Configuration presets to extend from */
  presets?: UserConfig[];

  /** Theme configuration */
  theme?: ThemeConfig;

  /** Plugins to load */
  plugins?: Plugin[];

  /** Content files to scan for class names */
  content?:
    | ContentFile[]
    | {
        relative?: boolean;
        files: ContentFile[];
      };

  /** Dark mode strategy */
  darkMode?: DarkModeStrategy;

  /** Prefix for generated utility classes */
  prefix?: string;

  /** Class patterns to exclude */
  blocklist?: string[];

  /** Force !important on utilities or use specific selector */
  important?: boolean | string;

  /** Future feature flags */
  future?: 'all' | Record<string, boolean>;

  /** Experimental feature flags */
  experimental?: 'all' | Record<string, boolean>;
}

/**
 * Content file pattern (glob pattern string)
 */
type ContentFile = string;

/**
 * Resolved configuration (after presets and defaults applied)
 */
interface ResolvedConfig {
  theme: Record<string, Record<string, unknown>>;
  plugins: PluginWithConfig[];
  content: ResolvedContentConfig;
  darkMode: DarkModeStrategy | null;
  prefix: string;
  blocklist: string[];
  important: boolean | string;
  future: Record<string, boolean>;
  experimental: Record<string, boolean>;
}
```

**Usage Examples:**

```typescript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],

  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],

  prefix: 'tw-',
  important: true,
  darkMode: 'class',
};
```

### Theme Configuration

Configure or extend the default theme.

```typescript { .api }
/**
 * Theme configuration object
 */
type ThemeConfig = Record<string, ThemeValue> & {
  /** Extend default theme instead of replacing */
  extend?: Record<string, ThemeValue>;
};

/**
 * Valid theme values
 */
type ThemeValue =
  | string
  | number
  | Record<string, ThemeValue>
  | ThemeValue[]
  | ((utils: ThemeUtils) => ThemeValue);

interface ThemeUtils {
  theme: (path: string, defaultValue?: any) => any;
  breakpoint: (breakpoint: string) => string;
}
```

**Usage Examples:**

```typescript
export default {
  theme: {
    // Replace entire color palette
    colors: {
      white: '#ffffff',
      black: '#000000',
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        900: '#1e3a8a',
      },
    },

    // Replace spacing scale
    spacing: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },

    // Extend default theme
    extend: {
      colors: {
        brand: {
          light: '#3fbaeb',
          DEFAULT: '#0fa9e6',
          dark: '#0c87b8',
        },
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
};
```

### Content Configuration

Specify files to scan for class names.

```typescript { .api }
/**
 * Content file pattern (glob or object)
 */
type ContentFile =
  | string
  | {
      raw: string;
      extension?: string;
    }
  | {
      files: string[];
      extract?: ContentExtractor;
      transform?: ContentTransformer;
    };

type ContentExtractor = (content: string) => string[];
type ContentTransformer = (content: string) => string;

interface ResolvedContentConfig {
  relative: boolean;
  files: ContentFile[];
}
```

**Usage Examples:**

```typescript
export default {
  // Simple glob patterns
  content: ['./src/**/*.{js,ts,jsx,tsx}', './public/index.html'],

  // With relative option
  content: {
    relative: true,
    files: ['./src/**/*.{html,js}'],
  },

  // With raw content
  content: [
    './src/**/*.html',
    {
      raw: '<div class="text-red-500">Direct HTML</div>',
      extension: 'html',
    },
  ],

  // With custom extractor
  content: [
    {
      files: ['./src/**/*.js'],
      extract: (content) => {
        // Custom extraction logic
        return content.match(/class[Name]*="([^"]*)"/g) || [];
      },
    },
  ],

  // With transformer
  content: [
    {
      files: ['./src/**/*.pug'],
      transform: (content) => {
        // Transform Pug to HTML first
        return pug.render(content);
      },
    },
  ],
};
```

### Dark Mode Configuration

Configure dark mode strategy.

```typescript { .api }
/**
 * Dark mode strategy
 */
type DarkModeStrategy =
  | false // Disable dark mode
  | 'media' // Use prefers-color-scheme media query
  | 'class' // Use .dark class on html element
  | ['class', string] // Use custom class name
  | 'selector' // Use custom selector
  | ['selector', string] // Use specific selector
  | ['variant', string | string[]]; // Use custom variant(s)
```

**Usage Examples:**

```typescript
// Disable dark mode
export default {
  darkMode: false,
};

// Media query based (respects OS preference)
export default {
  darkMode: 'media',
};

// Class-based (default: .dark class)
export default {
  darkMode: 'class',
};

// Custom class name
export default {
  darkMode: ['class', 'dark-mode'],
};

// Custom selector
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
};

// Custom variant
export default {
  darkMode: ['variant', 'dark'],
};

// Multiple custom variants
export default {
  darkMode: ['variant', ['dark', 'dark-mode']],
};
```

### Prefix Configuration

Add prefix to all generated utility classes.

```typescript
export default {
  prefix: 'tw-',
};

// Generates: tw-flex, tw-pt-4, tw-text-center, etc.
```

### Blocklist Configuration

Exclude specific class patterns from generation.

```typescript
export default {
  blocklist: [
    'container',
    'collapse',
    /^debug-/, // Block all classes starting with debug-
  ],
};
```

### Important Configuration

Force !important on all utilities or scope utilities under a selector.

```typescript
// Force !important on all utilities
export default {
  important: true,
};

// Scope utilities under a selector
export default {
  important: '#app',
};
// Generates: #app .text-center { text-align: center; }
```

### Presets

Extend from configuration presets.

```typescript
import baseConfig from './tailwind.base.js';
import typographyPreset from './presets/typography.js';

export default {
  presets: [baseConfig, typographyPreset],

  // This config extends the presets
  theme: {
    extend: {
      colors: {
        custom: '#abc123',
      },
    },
  },
};
```

### Future Flags

Enable upcoming features before they become default.

```typescript
export default {
  // Enable all future features
  future: 'all',

  // Or enable specific features
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
  },
};
```

### Experimental Flags

Enable experimental features.

```typescript
export default {
  // Enable all experimental features (not recommended)
  experimental: 'all',

  // Or enable specific experimental features
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
```

## Complete Configuration Example

```typescript
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        display: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      screens: {
        '3xl': '1920px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },

  plugins: [
    forms({
      strategy: 'class',
    }),
    typography({
      className: 'prose',
    }),
  ],

  prefix: '',
  important: false,

  blocklist: [],

  future: {
    hoverOnlyWhenSupported: true,
  },

  experimental: {},
} satisfies Config;
```

## Types

### Plugin Types

```typescript { .api }
type Plugin = PluginWithConfig | PluginWithOptions<any>;

interface PluginWithConfig {
  handler: (api: PluginAPI) => void;
  config?: Partial<Config>;
}

interface PluginWithOptions<T> {
  (options?: T): PluginWithConfig;
  __isOptionsFunction: true;
}
```

### Type Alias

```typescript { .api }
/**
 * Main config type (alias for UserConfig)
 */
type Config = UserConfig;
```

