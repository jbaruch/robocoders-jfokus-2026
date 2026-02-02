# IntelliSense Support

Functions and types for editor integration and autocomplete functionality.

## Capabilities

### Get Class List

Get list of all available utility classes for IntelliSense. This is a method on the DesignSystem object.

```typescript { .api }
/**
 * Class entry tuple: [className, metadata]
 */
type ClassEntry = [string, ClassMetadata];

/**
 * Metadata about a utility class
 */
interface ClassMetadata {
  /** Available modifiers for this class (e.g., opacity values) */
  modifiers: string[];
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');
const classList = designSystem.getClassList();

console.log(`Total utilities: ${classList.length}`);

// Find specific class
const flexClass = classList.find(([name]) => name === 'flex');
if (flexClass) {
  const [name, metadata] = flexClass;
  console.log(`Class: ${name}`);
  console.log(`Modifiers: ${metadata.modifiers.length}`);
}

// Group by prefix
const byPrefix = new Map<string, string[]>();
for (const [className] of classList) {
  const prefix = className.split('-')[0];
  if (!byPrefix.has(prefix)) {
    byPrefix.set(prefix, []);
  }
  byPrefix.get(prefix)!.push(className);
}

console.log('Classes by prefix:');
for (const [prefix, classes] of byPrefix) {
  console.log(`${prefix}: ${classes.length} classes`);
}

// Find classes with modifiers
const classesWithModifiers = classList.filter(
  ([, metadata]) => metadata.modifiers.length > 0
);
console.log(`Classes with modifiers: ${classesWithModifiers.length}`);
```

### Get Variants

Get list of all available variants.

```typescript { .api }
/**
 * Variant entry for IntelliSense
 */
interface VariantEntry {
  /** Variant name */
  name: string;

  /** Whether variant accepts arbitrary values */
  isArbitrary: boolean;

  /** Optional function to generate selectors for preview */
  selectors?: (options?: SelectorOptions) => string[];
}

interface SelectorOptions {
  /** Modifier value for compound variants */
  modifier?: string | null;
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');
const variants = designSystem.getVariants();

console.log(`Total variants: ${variants.length}`);

// List all variants
for (const variant of variants) {
  console.log(
    `${variant.name}${variant.isArbitrary ? ' (arbitrary)' : ''}`
  );
}

// Find pseudo-class variants
const pseudoVariants = variants.filter((v) =>
  ['hover', 'focus', 'active', 'disabled'].includes(v.name)
);
console.log('Pseudo-class variants:', pseudoVariants.map((v) => v.name));

// Find responsive variants
const responsiveVariants = variants.filter((v) =>
  ['sm', 'md', 'lg', 'xl', '2xl'].includes(v.name)
);
console.log('Responsive variants:', responsiveVariants.map((v) => v.name));

// Find arbitrary variants
const arbitraryVariants = variants.filter((v) => v.isArbitrary);
console.log(
  `Arbitrary variants: ${arbitraryVariants.length}`
);

// Generate selectors for preview
const hoverVariant = variants.find((v) => v.name === 'hover');
if (hoverVariant?.selectors) {
  const selectors = hoverVariant.selectors();
  console.log('Hover selectors:', selectors);
}
```

### Canonicalize Candidates

Normalize candidate strings for comparison and deduplication.

```typescript { .api }
/**
 * Normalize candidate strings
 * @param candidates - Array of candidate strings
 * @param options - Canonicalization options
 * @returns Normalized candidate strings
 */
function canonicalizeCandidates(
  candidates: string[],
  options?: CanonicalizeOptions
): string[];

interface CanonicalizeOptions {
  /** Preserve important flag during canonicalization */
  preserveImportant?: boolean;
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

// Normalize variant order
const classes = [
  'hover:bg-blue-500',
  'bg-blue-500:hover', // Different order
  'md:hover:text-white',
  'hover:md:text-white', // Different order
];

const normalized = designSystem.canonicalizeCandidates(classes);
console.log(normalized);
// [
//   'hover:bg-blue-500',
//   'hover:bg-blue-500',  // Normalized to same
//   'md:hover:text-white',
//   'md:hover:text-white'  // Normalized to same
// ]

// Remove duplicates
const unique = [...new Set(normalized)];
console.log(unique);
// ['hover:bg-blue-500', 'md:hover:text-white']

// Preserve important flag
const withImportant = ['!flex', 'flex'];
const canonicalized = designSystem.canonicalizeCandidates(withImportant, {
  preserveImportant: true,
});
console.log(canonicalized); // ['!flex', 'flex']
```

## Complete Example: Autocomplete Implementation

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

interface AutocompleteResult {
  label: string;
  detail?: string;
  documentation?: string;
  modifiers?: string[];
}

async function getAutocompleteResults(
  input: string
): Promise<AutocompleteResult[]> {
  const designSystem = await __unstable__loadDesignSystem('');
  const classList = designSystem.getClassList();
  const variants = designSystem.getVariants();

  // Check if input contains variant prefix
  const lastColon = input.lastIndexOf(':');
  let variantPrefix = '';
  let utilityInput = input;

  if (lastColon !== -1) {
    variantPrefix = input.slice(0, lastColon + 1);
    utilityInput = input.slice(lastColon + 1);
  }

  const results: AutocompleteResult[] = [];

  // Match utilities
  for (const [className, metadata] of classList) {
    if (className.startsWith(utilityInput)) {
      const fullClassName = variantPrefix + className;

      results.push({
        label: fullClassName,
        detail: 'utility',
        modifiers: metadata.modifiers,
      });

      // Add modifier suggestions
      for (const modifier of metadata.modifiers.slice(0, 5)) {
        results.push({
          label: `${fullClassName}/${modifier}`,
          detail: 'utility with modifier',
        });
      }
    }
  }

  // Match variants (only if no variant prefix yet)
  if (!variantPrefix) {
    for (const variant of variants) {
      if (variant.name.startsWith(input)) {
        results.push({
          label: `${variant.name}:`,
          detail: variant.isArbitrary ? 'arbitrary variant' : 'variant',
          documentation: variant.isArbitrary
            ? 'Accepts arbitrary values'
            : undefined,
        });
      }
    }
  }

  return results.slice(0, 50); // Limit results
}

// Example usage
const results = await getAutocompleteResults('bg-');
console.log(`Found ${results.length} results`);
for (const result of results.slice(0, 10)) {
  console.log(`- ${result.label} (${result.detail})`);
}
```

## Example: Class Validation

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

async function validateClasses(classes: string[]): Promise<{
  valid: string[];
  invalid: string[];
}> {
  const designSystem = await __unstable__loadDesignSystem('');

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const className of classes) {
    const css = designSystem.candidatesToCss([className]);

    if (css[0] !== null) {
      valid.push(className);
    } else {
      invalid.push(className);
    }
  }

  return { valid, invalid };
}

// Example usage
const { valid, invalid } = await validateClasses([
  'flex',
  'bg-blue-500',
  'invalid-class',
  'hover:text-white',
  'made-up-utility',
]);

console.log('Valid classes:', valid);
console.log('Invalid classes:', invalid);
```

## Example: Class Sorting for Formatter

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

async function sortClasses(classes: string[]): Promise<string[]> {
  const designSystem = await __unstable__loadDesignSystem('');

  // Get order for each class
  const withOrder = designSystem.getClassOrder(classes);

  // Sort by order (nulls last)
  withOrder.sort(([, orderA], [, orderB]) => {
    if (orderA === null) return 1;
    if (orderB === null) return -1;
    return Number(orderA - orderB);
  });

  // Return sorted class names
  return withOrder.map(([className]) => className);
}

// Example usage
const unsorted = [
  'hover:bg-blue-500',
  'p-4',
  'flex',
  'mt-2',
  'text-white',
  'md:flex-col',
];

const sorted = await sortClasses(unsorted);
console.log('Sorted:', sorted.join(' '));
// Output: "flex mt-2 p-4 text-white hover:bg-blue-500 md:flex-col"
```

## Example: Generate Class Documentation

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

async function generateClassDocs() {
  const designSystem = await __unstable__loadDesignSystem('');
  const classList = designSystem.getClassList();

  // Group by category
  const categories = new Map<string, Array<[string, ClassMetadata]>>();

  for (const entry of classList) {
    const [className] = entry;
    const category = className.split('-')[0];

    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(entry);
  }

  // Generate markdown
  let markdown = '# Tailwind CSS Utilities\n\n';

  for (const [category, classes] of categories) {
    markdown += `## ${category}\n\n`;
    markdown += `${classes.length} utilities\n\n`;

    // Show first 10 as examples
    for (const [className, metadata] of classes.slice(0, 10)) {
      markdown += `- \`${className}\``;
      if (metadata.modifiers.length > 0) {
        markdown += ` (${metadata.modifiers.length} modifiers)`;
      }
      markdown += '\n';
    }

    if (classes.length > 10) {
      markdown += `- ... and ${classes.length - 10} more\n`;
    }

    markdown += '\n';
  }

  return markdown;
}

const docs = await generateClassDocs();
console.log(docs);
```

