# Colors and Default Theme

TailwindCSS provides a complete color palette and default theme configuration for immediate use.

## Capabilities

### Color Palette

Complete color palette with all Tailwind colors.

```typescript { .api }
/**
 * Default Tailwind color palette
 */
const colors: {
  inherit: 'inherit';
  current: 'currentcolor';
  transparent: 'transparent';
  black: '#000';
  white: '#fff';
  slate: ColorScale;
  gray: ColorScale;
  zinc: ColorScale;
  neutral: ColorScale;
  stone: ColorScale;
  red: ColorScale;
  orange: ColorScale;
  amber: ColorScale;
  yellow: ColorScale;
  lime: ColorScale;
  green: ColorScale;
  emerald: ColorScale;
  teal: ColorScale;
  cyan: ColorScale;
  sky: ColorScale;
  blue: ColorScale;
  indigo: ColorScale;
  violet: ColorScale;
  purple: ColorScale;
  fuchsia: ColorScale;
  pink: ColorScale;
  rose: ColorScale;
};

/**
 * Color scale from 50 to 950
 */
type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};
```

**Import:**

```typescript
import colors from 'tailwindcss/colors';
```

For CommonJS:

```javascript
const colors = require('tailwindcss/colors');
```

**Note:** TailwindCSS v4 uses OKLCH color format instead of hex codes. All color values are in OKLCH format.

**Usage Examples:**

```typescript
import colors from 'tailwindcss/colors';

console.log(colors.blue[500]); // "oklch(62.3% 0.214 259.815)"
console.log(colors.red[700]); // "oklch(50.5% 0.213 27.518)"
console.log(colors.transparent); // "transparent"
console.log(colors.current); // "currentcolor"

// Use in configuration
export default {
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.purple,
        danger: colors.red[600],
      },
    },
  },
};

// Use specific shades
const brandColors = {
  light: colors.blue[300],
  DEFAULT: colors.blue[500],
  dark: colors.blue[700],
};
```

### Default Theme

Complete default theme configuration with all theme keys.

```typescript { .api }
/**
 * Default Tailwind theme configuration
 */
const defaultTheme: {
  /** Accent color values */
  accentColor: Record<string, string>;

  /** Animation definitions */
  animation: Record<string, string>;

  /** ARIA attribute values */
  aria: Record<string, string>;

  /** Aspect ratio values */
  aspectRatio: Record<string, string>;

  /** Backdrop filter blur values */
  backdropBlur: Record<string, string>;

  /** Backdrop filter brightness values */
  backdropBrightness: Record<string, string>;

  /** Backdrop filter contrast values */
  backdropContrast: Record<string, string>;

  /** Backdrop filter grayscale values */
  backdropGrayscale: Record<string, string>;

  /** Backdrop filter hue-rotate values */
  backdropHueRotate: Record<string, string>;

  /** Backdrop filter invert values */
  backdropInvert: Record<string, string>;

  /** Backdrop filter opacity values */
  backdropOpacity: Record<string, string>;

  /** Backdrop filter saturate values */
  backdropSaturate: Record<string, string>;

  /** Backdrop filter sepia values */
  backdropSepia: Record<string, string>;

  /** Background color values */
  backgroundColor: typeof colors;

  /** Background image values */
  backgroundImage: Record<string, string>;

  /** Background opacity values */
  backgroundOpacity: Record<string, string>;

  /** Background position values */
  backgroundPosition: Record<string, string>;

  /** Background size values */
  backgroundSize: Record<string, string>;

  /** Blur values */
  blur: Record<string, string>;

  /** Border color values */
  borderColor: typeof colors;

  /** Border opacity values */
  borderOpacity: Record<string, string>;

  /** Border radius values */
  borderRadius: Record<string, string>;

  /** Border spacing values */
  borderSpacing: Record<string, string>;

  /** Border width values */
  borderWidth: Record<string, string>;

  /** Box shadow values */
  boxShadow: Record<string, string>;

  /** Box shadow color values */
  boxShadowColor: typeof colors;

  /** Brightness values */
  brightness: Record<string, string>;

  /** Caret color values */
  caretColor: typeof colors;

  /** Color palette */
  colors: typeof colors;

  /** Column values */
  columns: Record<string, string>;

  /** Container configuration */
  container: Record<string, any>;

  /** Content values */
  content: Record<string, string>;

  /** Contrast values */
  contrast: Record<string, string>;

  /** Cursor values */
  cursor: Record<string, string>;

  /** Divide color values */
  divideColor: typeof colors;

  /** Divide opacity values */
  divideOpacity: Record<string, string>;

  /** Divide width values */
  divideWidth: Record<string, string>;

  /** Drop shadow values */
  dropShadow: Record<string, string>;

  /** Fill values */
  fill: typeof colors;

  /** Flex values */
  flex: Record<string, string>;

  /** Flex basis values */
  flexBasis: Record<string, string>;

  /** Flex grow values */
  flexGrow: Record<string, string>;

  /** Flex shrink values */
  flexShrink: Record<string, string>;

  /** Font family values */
  fontFamily: Record<string, string[]>;

  /** Font size values */
  fontSize: Record<string, [string, { lineHeight: string }] | string>;

  /** Font weight values */
  fontWeight: Record<string, string>;

  /** Gap values */
  gap: Record<string, string>;

  /** Gradient color stop values */
  gradientColorStops: typeof colors;

  /** Gradient color stop position values */
  gradientColorStopPositions: Record<string, string>;

  /** Grayscale values */
  grayscale: Record<string, string>;

  /** Grid auto-columns values */
  gridAutoColumns: Record<string, string>;

  /** Grid auto-rows values */
  gridAutoRows: Record<string, string>;

  /** Grid column values */
  gridColumn: Record<string, string>;

  /** Grid column-end values */
  gridColumnEnd: Record<string, string>;

  /** Grid column-start values */
  gridColumnStart: Record<string, string>;

  /** Grid row values */
  gridRow: Record<string, string>;

  /** Grid row-end values */
  gridRowEnd: Record<string, string>;

  /** Grid row-start values */
  gridRowStart: Record<string, string>;

  /** Grid template-columns values */
  gridTemplateColumns: Record<string, string>;

  /** Grid template-rows values */
  gridTemplateRows: Record<string, string>;

  /** Height values */
  height: Record<string, string>;

  /** Hue-rotate values */
  hueRotate: Record<string, string>;

  /** Inset values */
  inset: Record<string, string>;

  /** Invert values */
  invert: Record<string, string>;

  /** Keyframe definitions */
  keyframes: Record<string, Record<string, Record<string, string>>>;

  /** Letter spacing values */
  letterSpacing: Record<string, string>;

  /** Line clamp values */
  lineClamp: Record<string, string>;

  /** Line height values */
  lineHeight: Record<string, string>;

  /** List style image values */
  listStyleImage: Record<string, string>;

  /** List style type values */
  listStyleType: Record<string, string>;

  /** Margin values */
  margin: Record<string, string>;

  /** Max height values */
  maxHeight: Record<string, string>;

  /** Max width values */
  maxWidth: Record<string, string>;

  /** Min height values */
  minHeight: Record<string, string>;

  /** Min width values */
  minWidth: Record<string, string>;

  /** Object position values */
  objectPosition: Record<string, string>;

  /** Opacity values */
  opacity: Record<string, string>;

  /** Order values */
  order: Record<string, string>;

  /** Outline color values */
  outlineColor: typeof colors;

  /** Outline offset values */
  outlineOffset: Record<string, string>;

  /** Outline width values */
  outlineWidth: Record<string, string>;

  /** Padding values */
  padding: Record<string, string>;

  /** Placeholder color values */
  placeholderColor: typeof colors;

  /** Placeholder opacity values */
  placeholderOpacity: Record<string, string>;

  /** Ring color values */
  ringColor: typeof colors;

  /** Ring offset color values */
  ringOffsetColor: typeof colors;

  /** Ring offset width values */
  ringOffsetWidth: Record<string, string>;

  /** Ring opacity values */
  ringOpacity: Record<string, string>;

  /** Ring width values */
  ringWidth: Record<string, string>;

  /** Rotate values */
  rotate: Record<string, string>;

  /** Saturate values */
  saturate: Record<string, string>;

  /** Scale values */
  scale: Record<string, string>;

  /** Responsive breakpoint values */
  screens: Record<string, string>;

  /** Scroll margin values */
  scrollMargin: Record<string, string>;

  /** Scroll padding values */
  scrollPadding: Record<string, string>;

  /** Sepia values */
  sepia: Record<string, string>;

  /** Size values */
  size: Record<string, string>;

  /** Skew values */
  skew: Record<string, string>;

  /** Space values */
  space: Record<string, string>;

  /** Spacing scale */
  spacing: Record<string, string>;

  /** Stroke values */
  stroke: typeof colors;

  /** Stroke width values */
  strokeWidth: Record<string, string>;

  /** @supports query values */
  supports: Record<string, string>;

  /** Text color values */
  textColor: typeof colors;

  /** Text decoration color values */
  textDecorationColor: typeof colors;

  /** Text decoration thickness values */
  textDecorationThickness: Record<string, string>;

  /** Text indent values */
  textIndent: Record<string, string>;

  /** Text opacity values */
  textOpacity: Record<string, string>;

  /** Text underline offset values */
  textUnderlineOffset: Record<string, string>;

  /** Transform origin values */
  transformOrigin: Record<string, string>;

  /** Transition delay values */
  transitionDelay: Record<string, string>;

  /** Transition duration values */
  transitionDuration: Record<string, string>;

  /** Transition property values */
  transitionProperty: Record<string, string>;

  /** Transition timing function values */
  transitionTimingFunction: Record<string, string>;

  /** Translate values */
  translate: Record<string, string>;

  /** Width values */
  width: Record<string, string>;

  /** Will-change values */
  willChange: Record<string, string>;

  /** Z-index values */
  zIndex: Record<string, string>;
};
```

**Import:**

```typescript
import defaultTheme from 'tailwindcss/defaultTheme';
```

For CommonJS:

```javascript
const defaultTheme = require('tailwindcss/defaultTheme');
```

**Usage Examples:**

```typescript
import defaultTheme from 'tailwindcss/defaultTheme';

// Access default values
console.log(defaultTheme.spacing[4]); // "1rem"
console.log(defaultTheme.screens.md); // "768px"
console.log(defaultTheme.colors.blue[500]); // "#3b82f6"

// Extend font families
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Merriweather', ...defaultTheme.fontFamily.serif],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
    },
  },
};

// Add custom breakpoints
export default {
  theme: {
    extend: {
      screens: {
        xs: '475px',
        ...defaultTheme.screens,
        '3xl': '1920px',
      },
    },
  },
};

// Extend spacing scale
export default {
  theme: {
    extend: {
      spacing: {
        ...defaultTheme.spacing,
        128: '32rem',
        144: '36rem',
      },
    },
  },
};
```

### Flatten Color Palette

Utility for flattening nested color objects.

```typescript { .api }
/**
 * Flattens nested color objects into flat key-value pairs
 * @param colors - Nested color object
 * @returns Flat object with keys like "red-500"
 */
function flattenColorPalette(colors: Colors): Record<string, string>;

type Colors = Record<string, string | Record<string, string>>;
```

**Import:**

```typescript
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
```

For CommonJS:

```javascript
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette');
```

**Usage Examples:**

```typescript
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
import colors from 'tailwindcss/colors';

// Flatten color palette
const flat = flattenColorPalette(colors);

console.log(flat['red-500']); // "#ef4444"
console.log(flat['blue-300']); // "#93c5fd"
console.log(flat.transparent); // "transparent"

// Use in plugin
import plugin from 'tailwindcss/plugin';

const customPlugin = plugin(function ({ matchUtilities, theme }) {
  const colors = flattenColorPalette(theme('colors'));

  matchUtilities(
    {
      'border-t': (value) => ({
        'border-top-color': value,
      }),
    },
    {
      values: colors,
      type: 'color',
    }
  );
});
```

## Key Theme Values

### Spacing Scale

```typescript
defaultTheme.spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};
```

### Breakpoints

**Note:** TailwindCSS v4 uses rem units for breakpoints instead of pixels.

```typescript
defaultTheme.screens = {
  sm: '40rem',   // equivalent to 640px at default font size
  md: '48rem',   // equivalent to 768px
  lg: '64rem',   // equivalent to 1024px
  xl: '80rem',   // equivalent to 1280px
  '2xl': '96rem', // equivalent to 1536px
};
```

### Font Families

```typescript
defaultTheme.fontFamily = {
  sans: [
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ],
  serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace',
  ],
};
```

### Font Sizes

```typescript
defaultTheme.fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
  '7xl': ['4.5rem', { lineHeight: '1' }],
  '8xl': ['6rem', { lineHeight: '1' }],
  '9xl': ['8rem', { lineHeight: '1' }],
};
```

### Border Radius

```typescript
defaultTheme.borderRadius = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};
```

### Box Shadow

```typescript
defaultTheme.boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};
```

