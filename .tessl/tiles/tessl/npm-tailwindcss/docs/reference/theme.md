# Theme System

**⚠️ Note:** The Theme class is accessed via the DesignSystem object returned by `__unstable__loadDesignSystem()`. This is an advanced API primarily intended for tooling and may change in future versions.

The Theme class provides programmatic theme management with CSS variable resolution, namespace support, and keyframe handling.

## Capabilities

### Theme Class

Manage theme values programmatically.

```typescript { .api }
/**
 * Theme management class
 */
class Theme {
  /** Configured class prefix */
  prefix: string | null;

  /** Number of theme entries */
  readonly size: number;

  /**
   * Add a theme value
   * @param key - Theme key (CSS variable name)
   * @param value - Theme value
   * @param options - Theme options flags
   * @param src - Optional source location
   */
  add(
    key: string,
    value: string,
    options?: ThemeOptions,
    src?: SourceLocation
  ): void;

  /**
   * Get keys in specified namespaces
   * @param themeKeys - Iterable of theme keys
   * @returns Array of keys found in those namespaces
   */
  keysInNamespaces(themeKeys: Iterable<ThemeKey>): string[];

  /**
   * Get theme value by keys
   * @param themeKeys - Array of theme keys to try
   * @returns First matching value or null
   */
  get(themeKeys: ThemeKey[]): string | null;

  /**
   * Check if theme key has a default value
   * @param key - Theme key
   * @returns True if has default
   */
  hasDefault(key: string): boolean;

  /**
   * Get options for theme key
   * @param key - Theme key
   * @returns Theme options flags
   */
  getOptions(key: string): ThemeOptions;

  /**
   * Iterate theme entries
   * @returns Iterator of [key, {value, options, src}] tuples
   */
  entries(): Iterator<
    [string, { value: string; options: ThemeOptions; src?: SourceLocation }]
  >;

  /**
   * Apply prefix to key
   * @param key - Theme key
   * @returns Prefixed key
   */
  prefixKey(key: string): string;

  /**
   * Clear a namespace
   * @param namespace - Namespace to clear
   * @param clearOptions - Options to match for clearing
   */
  clearNamespace(namespace: string, clearOptions: ThemeOptions): void;

  /**
   * Mark theme variable as used
   * @param themeKey - Theme key to mark
   * @returns True if newly marked, false if already marked
   */
  markUsedVariable(themeKey: string): boolean;

  /**
   * Resolve candidate value with theme
   * @param candidateValue - Value to resolve (may be theme reference)
   * @param themeKeys - Theme keys to try
   * @param options - Resolution options
   * @returns Resolved value or null
   */
  resolve(
    candidateValue: string | null,
    themeKeys: ThemeKey[],
    options?: ThemeOptions
  ): string | null;

  /**
   * Resolve value against theme keys
   * @param candidateValue - Value to resolve
   * @param themeKeys - Theme keys to try
   * @returns Resolved value or null
   */
  resolveValue(candidateValue: string | null, themeKeys: ThemeKey[]): string | null;

  /**
   * Resolve value with nested keys
   * @param candidateValue - Value to resolve
   * @param themeKeys - Theme keys to try
   * @param nestedKeys - Nested keys for complex resolution
   * @returns Tuple of [resolved value, nested values] or null
   */
  resolveWith(
    candidateValue: string,
    themeKeys: ThemeKey[],
    nestedKeys?: string[]
  ): [string, Record<string, string>] | null;

  /**
   * Get namespace map
   * @param namespace - Namespace name
   * @returns Map of keys to values in namespace
   */
  namespace(namespace: string): Map<string | null, string>;

  /**
   * Add keyframes at-rule
   * @param value - Keyframes at-rule node
   */
  addKeyframes(value: AtRule): void;

  /**
   * Get all keyframes
   * @returns Array of keyframes at-rules
   */
  getKeyframes(): AtRule[];
}
```

**Usage Examples:**

```typescript
import { Theme, ThemeOptions } from 'tailwindcss';

const theme = new Theme();

// Add theme values
theme.add('--color-primary', '#3b82f6', ThemeOptions.DEFAULT);
theme.add('--color-secondary', '#8b5cf6', ThemeOptions.DEFAULT);
theme.add('--spacing-4', '1rem', ThemeOptions.DEFAULT);

// Get theme value
const primary = theme.get(['--color-primary']);
console.log(primary); // "#3b82f6"

// Resolve theme reference
const resolved = theme.resolve('primary', [
  '--color-primary',
  '--color-blue-500',
]);
console.log(resolved); // "#3b82f6"

// Mark as used
theme.markUsedVariable('--color-primary');

// Get namespace
const colors = theme.namespace('color');
console.log([...colors.entries()]);
// [['primary', '#3b82f6'], ['secondary', '#8b5cf6'], ...]

// Iterate entries
for (const [key, { value, options }] of theme.entries()) {
  console.log(`${key}: ${value}`);
}

// Check for default
if (theme.hasDefault('--color-primary')) {
  console.log('Has default value');
}
```

## Types

### Theme Options

Flags for theme value properties.

```typescript { .api }
/**
 * Options flags for theme values
 */
enum ThemeOptions {
  /** No options */
  NONE = 0,

  /** Inline value (not CSS variable) */
  INLINE = 1,

  /** Reference value */
  REFERENCE = 2,

  /** Default value */
  DEFAULT = 4,

  /** Static value */
  STATIC = 8,

  /** Marked as used */
  USED = 16,
}
```

**Usage Examples:**

```typescript
import { Theme, ThemeOptions } from 'tailwindcss';

const theme = new Theme();

// Add inline value (not CSS variable)
theme.add('--color-transparent', 'transparent', ThemeOptions.INLINE);

// Add default value
theme.add('--color-primary', '#3b82f6', ThemeOptions.DEFAULT);

// Add static value
theme.add('--spacing-px', '1px', ThemeOptions.STATIC);

// Combine options with bitwise OR
theme.add(
  '--color-current',
  'currentColor',
  ThemeOptions.INLINE | ThemeOptions.STATIC
);

// Check options
const options = theme.getOptions('--color-primary');
if (options & ThemeOptions.DEFAULT) {
  console.log('Is default value');
}
if (options & ThemeOptions.INLINE) {
  console.log('Is inline value');
}
```

### Theme Key

Type for theme keys (CSS variable names).

```typescript { .api }
/**
 * Theme key type (CSS variable name)
 */
type ThemeKey = `--${string}`;
```

**Usage Examples:**

```typescript
import { Theme, type ThemeKey } from 'tailwindcss';

const theme = new Theme();

// Type-safe theme keys
const colorKey: ThemeKey = '--color-primary';
const spacingKey: ThemeKey = '--spacing-4';

theme.add(colorKey, '#3b82f6');
theme.add(spacingKey, '1rem');

// Get with multiple keys (tries in order)
const keys: ThemeKey[] = ['--color-primary', '--color-blue-500'];
const value = theme.get(keys);
```

## Advanced Usage

### Theme Namespaces

```typescript
import { Theme, ThemeOptions } from 'tailwindcss';

const theme = new Theme();

// Add colors
theme.add('--color-red-500', '#ef4444', ThemeOptions.DEFAULT);
theme.add('--color-blue-500', '#3b82f6', ThemeOptions.DEFAULT);
theme.add('--color-green-500', '#10b981', ThemeOptions.DEFAULT);

// Add spacing
theme.add('--spacing-4', '1rem', ThemeOptions.DEFAULT);
theme.add('--spacing-8', '2rem', ThemeOptions.DEFAULT);

// Get all colors
const colors = theme.namespace('color');
console.log('Colors:', [...colors.keys()]);
// ['red-500', 'blue-500', 'green-500']

// Get all spacing
const spacing = theme.namespace('spacing');
console.log('Spacing:', [...spacing.keys()]);
// ['4', '8']

// Clear namespace
theme.clearNamespace('color', ThemeOptions.DEFAULT);
```

### Theme Resolution with Fallbacks

```typescript
import { Theme, ThemeOptions } from 'tailwindcss';

const theme = new Theme();

theme.add('--color-primary', '#3b82f6', ThemeOptions.DEFAULT);
theme.add('--color-blue-500', '#3b82f6', ThemeOptions.DEFAULT);

// Try multiple keys (uses first match)
const value = theme.resolve('custom', [
  '--color-custom', // Try custom first
  '--color-primary', // Fallback to primary
  '--color-blue-500', // Final fallback
]);

console.log(value); // "#3b82f6" (from --color-primary)

// With inline option
const inlineValue = theme.resolve(
  'primary',
  ['--color-primary'],
  ThemeOptions.INLINE
);
```

### Keyframes Management

```typescript
import { Theme, atRule, rule, decl } from 'tailwindcss';

const theme = new Theme();

// Add keyframes
const spin = atRule('keyframes', 'spin', [
  rule('from', [decl('transform', 'rotate(0deg)', false)]),
  rule('to', [decl('transform', 'rotate(360deg)', false)]),
]);

theme.addKeyframes(spin);

const bounce = atRule('keyframes', 'bounce', [
  rule('0%, 100%', [
    decl('transform', 'translateY(-25%)', false),
    decl('animation-timing-function', 'cubic-bezier(0.8,0,1,1)', false),
  ]),
  rule('50%', [
    decl('transform', 'translateY(0)', false),
    decl('animation-timing-function', 'cubic-bezier(0,0,0.2,1)', false),
  ]),
]);

theme.addKeyframes(bounce);

// Get all keyframes
const allKeyframes = theme.getKeyframes();
console.log(`Total keyframes: ${allKeyframes.length}`);
```

### Track Used Variables

```typescript
import { Theme, ThemeOptions } from 'tailwindcss';

const theme = new Theme();

// Add theme values
theme.add('--color-primary', '#3b82f6', ThemeOptions.DEFAULT);
theme.add('--color-secondary', '#8b5cf6', ThemeOptions.DEFAULT);
theme.add('--spacing-4', '1rem', ThemeOptions.DEFAULT);

// Track usage from raw CSS
const css = `
  .button {
    color: var(--color-primary);
    padding: var(--spacing-4);
  }
`;

theme.trackUsedVariables(css);

// Check which were used
const primaryOptions = theme.getOptions('--color-primary');
if (primaryOptions & ThemeOptions.USED) {
  console.log('Primary color is used');
}

const secondaryOptions = theme.getOptions('--color-secondary');
if (!(secondaryOptions & ThemeOptions.USED)) {
  console.log('Secondary color is unused');
}
```

### Complex Resolution

```typescript
import { Theme, ThemeOptions } from 'tailwindcss';

const theme = new Theme();

// Add nested theme values
theme.add('--color-blue-50', '#eff6ff', ThemeOptions.DEFAULT);
theme.add('--color-blue-100', '#dbeafe', ThemeOptions.DEFAULT);
theme.add('--color-blue-500', '#3b82f6', ThemeOptions.DEFAULT);

// Resolve with nested keys
const result = theme.resolveWith('blue', ['--color'], ['50', '100', '500']);

if (result) {
  const [baseValue, nestedValues] = result;
  console.log('Base:', baseValue);
  console.log('Nested:', nestedValues);
  // Nested: { '50': '#eff6ff', '100': '#dbeafe', '500': '#3b82f6' }
}
```

### Prefixed Themes

```typescript
import { Theme, ThemeOptions } from 'tailwindcss';

const theme = new Theme();
theme.prefix = 'tw-';

// Add values (automatically prefixed)
theme.add('--color-primary', '#3b82f6', ThemeOptions.DEFAULT);

// Get prefixed key
const prefixed = theme.prefixKey('color-primary');
console.log(prefixed); // "tw-color-primary"

// Keys in storage are prefixed
for (const [key, { value }] of theme.entries()) {
  console.log(`${key}: ${value}`);
  // --tw-color-primary: #3b82f6
}
```

