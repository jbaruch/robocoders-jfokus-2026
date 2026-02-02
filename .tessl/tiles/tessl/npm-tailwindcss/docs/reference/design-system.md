# Design System

**⚠️ Note:** The DesignSystem API is accessed via the `__unstable__loadDesignSystem()` function, which is marked as unstable and may change in future versions. This is an advanced API primarily intended for tooling and editor integrations.

The DesignSystem is the central coordination object that manages theme, utilities, variants, and provides compilation capabilities.

## Capabilities

### DesignSystem Interface

The central object coordinating all TailwindCSS functionality.

```typescript { .api }
/**
 * Design system coordinating theme, utilities, and variants
 */
interface DesignSystem {
  /** Theme instance managing CSS variables and values */
  theme: Theme;

  /** Utilities registry */
  utilities: Utilities;

  /** Variants registry */
  variants: Variants;

  /** Set of known invalid class candidates */
  invalidCandidates: Set<string>;

  /** Whether !important is forced on all utilities */
  important: boolean;

  /** Extensible storage for custom data */
  storage: Record<symbol, unknown>;

  /**
   * Get sort order for class names
   * @param classes - Array of class names
   * @returns Array of [className, order] tuples
   */
  getClassOrder(classes: string[]): [string, bigint | null][];

  /**
   * Get list of all available classes for IntelliSense
   * @returns Array of class entries with metadata
   */
  getClassList(): ClassEntry[];

  /**
   * Get list of all available variants
   * @returns Array of variant entries
   */
  getVariants(): VariantEntry[];

  /**
   * Parse a class candidate into structured representation
   * @param candidate - Class candidate string (e.g., "hover:bg-blue-500")
   * @returns Array of parsed candidates
   */
  parseCandidate(candidate: string): Readonly<Candidate>[];

  /**
   * Parse a variant string
   * @param variant - Variant string (e.g., "hover", "md")
   * @returns Parsed variant or null if invalid
   */
  parseVariant(variant: string): Readonly<Variant> | null;

  /**
   * Compile a candidate to AST nodes
   * @param candidate - Parsed candidate
   * @param flags - Compilation flags
   * @returns Array of AST node arrays
   */
  compileAstNodes(candidate: Candidate, flags?: CompileAstFlags): AstNode[][];

  /**
   * Print candidate back to string
   * @param candidate - Parsed candidate
   * @returns String representation
   */
  printCandidate(candidate: Candidate): string;

  /**
   * Print variant back to string
   * @param variant - Parsed variant
   * @returns String representation
   */
  printVariant(variant: Variant): string;

  /**
   * Get variant sort order
   * @returns Map of variants to their order
   */
  getVariantOrder(): Map<Variant, number>;

  /**
   * Resolve theme value from path
   * @param path - Theme path (e.g., "colors.blue.500")
   * @param forceInline - Force inline value instead of CSS variable
   * @returns Resolved value or undefined
   */
  resolveThemeValue(path: string, forceInline?: boolean): string | undefined;

  /**
   * Track theme variables used in raw CSS
   * @param raw - Raw CSS string
   */
  trackUsedVariables(raw: string): void;

  /**
   * Normalize candidate strings
   * @param candidates - Array of candidate strings
   * @param options - Canonicalization options
   * @returns Normalized candidate strings
   */
  canonicalizeCandidates(
    candidates: string[],
    options?: CanonicalizeOptions
  ): string[];

  /**
   * Convert class candidates to CSS strings
   * @param classes - Array of class names
   * @returns Array of CSS strings (null for invalid classes)
   */
  candidatesToCss(classes: string[]): (string | null)[];

  /**
   * Convert class candidates to AST nodes
   * @param classes - Array of class names
   * @returns Array of AST node arrays
   */
  candidatesToAst(classes: string[]): AstNode[][];
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

// Load design system from CSS
const css = `
  @theme {
    --color-primary: #3b82f6;
    --color-secondary: #8b5cf6;
  }
`;

const designSystem = await __unstable__loadDesignSystem(css, {
  base: process.cwd(),
});

// Get class order for sorting
const classes = ['p-4', 'hover:bg-blue-500', 'mt-2', 'flex'];
const ordered = designSystem.getClassOrder(classes);
console.log(ordered); // [[class, order], ...]

// Parse candidate
const candidates = designSystem.parseCandidate('hover:bg-blue-500/50');
console.log(candidates);
// [{
//   kind: 'functional',
//   root: 'bg',
//   value: { kind: 'named', value: 'blue-500' },
//   modifier: { kind: 'named', value: '50' },
//   variants: [{ kind: 'static', root: 'hover' }],
//   important: false,
//   raw: 'hover:bg-blue-500/50'
// }]

// Convert candidates to CSS
const css = designSystem.candidatesToCss(['flex', 'p-4', 'hover:bg-blue-500']);
console.log(css);
// ['.flex{display:flex}', '.p-4{padding:1rem}', '.hover\\:bg-blue-500:hover{...}']

// Get IntelliSense data
const classList = designSystem.getClassList();
const variants = designSystem.getVariants();

// Resolve theme value
const primary = designSystem.resolveThemeValue('colors.primary');
console.log(primary); // "var(--color-primary)"

const primaryInline = designSystem.resolveThemeValue('colors.primary', true);
console.log(primaryInline); // "#3b82f6"

// Canonicalize candidates
const normalized = designSystem.canonicalizeCandidates([
  'hover:bg-blue-500',
  'bg-blue-500:hover', // Different order
]);
console.log(normalized); // ['hover:bg-blue-500', 'hover:bg-blue-500']
```

## Types

### Utilities and Variants

```typescript { .api }
/**
 * Utilities registry (internal type)
 */
interface Utilities {
  // Internal implementation details
}

/**
 * Variants registry (internal type)
 */
interface Variants {
  // Internal implementation details
}
```

### AST Node Type

```typescript { .api }
/**
 * Internal AST node type (opaque - for advanced use only)
 * These are internal representations not meant for direct manipulation
 */
type AstNode = object;
```

### Compilation Flags

```typescript { .api }
/**
 * Flags for AST compilation
 */
enum CompileAstFlags {
  None = 0,
  RespectImportant = 1,
}
```

### Canonicalize Options

```typescript { .api }
/**
 * Options for candidate canonicalization
 */
interface CanonicalizeOptions {
  /** Preserve important flag */
  preserveImportant?: boolean;
}
```

### Class Entry

```typescript { .api }
/**
 * Class entry for IntelliSense
 */
type ClassEntry = [string, ClassMetadata];

interface ClassMetadata {
  /** Available modifiers for this class */
  modifiers: string[];
}
```

### Variant Entry

```typescript { .api }
/**
 * Variant entry for IntelliSense
 */
interface VariantEntry {
  /** Variant name */
  name: string;

  /** Whether variant accepts arbitrary values */
  isArbitrary: boolean;

  /** Optional function to generate selectors */
  selectors?: (options?: SelectorOptions) => string[];
}

interface SelectorOptions {
  modifier?: string | null;
}
```

## Advanced Use Cases

### Custom Tooling

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';
import { readFile } from 'fs/promises';

async function analyzeProject() {
  const css = await readFile('styles.css', 'utf-8');
  const designSystem = await __unstable__loadDesignSystem(css);

  // Extract all classes from HTML
  const html = await readFile('index.html', 'utf-8');
  const classes = html.match(/class="([^"]*)"/g) || [];

  // Validate classes
  const invalid: string[] = [];
  for (const className of classes) {
    const result = designSystem.candidatesToCss([className]);
    if (result[0] === null) {
      invalid.push(className);
    }
  }

  console.log('Invalid classes:', invalid);
}
```

### Class Sorting

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

async function sortClasses(classes: string[]) {
  const designSystem = await __unstable__loadDesignSystem('');

  const withOrder = designSystem.getClassOrder(classes);

  // Sort by order
  withOrder.sort((a, b) => {
    if (a[1] === null) return 1;
    if (b[1] === null) return -1;
    return Number(a[1] - b[1]);
  });

  return withOrder.map(([cls]) => cls);
}

const sorted = await sortClasses([
  'hover:bg-blue-500',
  'p-4',
  'flex',
  'mt-2',
]);
console.log(sorted); // ['flex', 'mt-2', 'p-4', 'hover:bg-blue-500']
```

### Generate Documentation

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

async function generateDocs() {
  const designSystem = await __unstable__loadDesignSystem('');

  const classList = designSystem.getClassList();
  const variants = designSystem.getVariants();

  console.log(`Available utilities: ${classList.length}`);
  console.log(`Available variants: ${variants.length}`);

  // Group by category
  const byCategory = new Map<string, string[]>();
  for (const [className] of classList) {
    const category = className.split('-')[0];
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(className);
  }

  // Generate markdown
  let markdown = '# Available Utilities\n\n';
  for (const [category, classes] of byCategory) {
    markdown += `## ${category}\n\n`;
    for (const cls of classes.slice(0, 10)) {
      markdown += `- \`${cls}\`\n`;
    }
    markdown += '\n';
  }

  return markdown;
}
```

