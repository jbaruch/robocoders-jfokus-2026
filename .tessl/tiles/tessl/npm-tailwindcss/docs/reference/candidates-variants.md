# Candidates and Variants

Structured types representing parsed utility class candidates and their variants. These types are primarily used internally and by tooling.

## Capabilities

### Candidate Types

Represents parsed utility class candidates.

```typescript { .api }
/**
 * Union of all candidate types
 */
type Candidate = ArbitraryCandidate | StaticCandidate | FunctionalCandidate;

/**
 * Arbitrary property candidate (e.g., [color:red], [padding:1rem])
 */
interface ArbitraryCandidate {
  kind: 'arbitrary';
  property: string;
  value: string;
  modifier: CandidateModifier | null;
  variants: Variant[];
  important: boolean;
  raw: string;
}

/**
 * Static utility candidate (e.g., flex, block, hidden)
 */
interface StaticCandidate {
  kind: 'static';
  root: string;
  variants: Variant[];
  important: boolean;
  raw: string;
}

/**
 * Functional utility candidate (e.g., bg-blue-500, w-4, p-[10px])
 */
interface FunctionalCandidate {
  kind: 'functional';
  root: string;
  value: UtilityValue | null;
  modifier: CandidateModifier | null;
  variants: Variant[];
  important: boolean;
  raw: string;
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

// Parse static candidate
const flexCandidates = designSystem.parseCandidate('flex');
console.log(flexCandidates[0]);
// {
//   kind: 'static',
//   root: 'flex',
//   variants: [],
//   important: false,
//   raw: 'flex'
// }

// Parse functional candidate
const bgCandidates = designSystem.parseCandidate('bg-blue-500');
console.log(bgCandidates[0]);
// {
//   kind: 'functional',
//   root: 'bg',
//   value: { kind: 'named', value: 'blue-500', fraction: null },
//   modifier: null,
//   variants: [],
//   important: false,
//   raw: 'bg-blue-500'
// }

// Parse with variants and modifier
const complexCandidates = designSystem.parseCandidate('hover:md:bg-blue-500/50');
console.log(complexCandidates[0]);
// {
//   kind: 'functional',
//   root: 'bg',
//   value: { kind: 'named', value: 'blue-500', fraction: null },
//   modifier: { kind: 'named', value: '50' },
//   variants: [
//     { kind: 'static', root: 'hover' },
//     { kind: 'static', root: 'md' }
//   ],
//   important: false,
//   raw: 'hover:md:bg-blue-500/50'
// }

// Parse arbitrary candidate
const arbitraryCandidates = designSystem.parseCandidate('[color:red]');
console.log(arbitraryCandidates[0]);
// {
//   kind: 'arbitrary',
//   property: 'color',
//   value: 'red',
//   modifier: null,
//   variants: [],
//   important: false,
//   raw: '[color:red]'
// }

// Parse important
const importantCandidates = designSystem.parseCandidate('!flex');
console.log(importantCandidates[0]);
// {
//   kind: 'static',
//   root: 'flex',
//   variants: [],
//   important: true,
//   raw: '!flex'
// }
```

### Variant Types

Represents parsed variants (modifiers like hover, md, focus, etc.).

```typescript { .api }
/**
 * Union of all variant types
 */
type Variant = ArbitraryVariant | StaticVariant | FunctionalVariant | CompoundVariant;

/**
 * Arbitrary variant (e.g., [&:hover], [&[data-state="open"]])
 */
interface ArbitraryVariant {
  kind: 'arbitrary';
  selector: string;
  relative: boolean;
}

/**
 * Static variant (e.g., hover, focus, disabled)
 */
interface StaticVariant {
  kind: 'static';
  root: string;
}

/**
 * Functional variant (e.g., group-hover, peer-focus, aria-[disabled])
 */
interface FunctionalVariant {
  kind: 'functional';
  root: string;
  value: UtilityValue | null;
  modifier: CandidateModifier | null;
}

/**
 * Compound variant (e.g., group-hover/name, peer-checked/peer1)
 */
interface CompoundVariant {
  kind: 'compound';
  root: string;
  modifier: string;
  variant: Variant;
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

// Parse static variant
const hoverVariant = designSystem.parseVariant('hover');
console.log(hoverVariant);
// { kind: 'static', root: 'hover' }

// Parse functional variant
const groupHoverVariant = designSystem.parseVariant('group-hover');
console.log(groupHoverVariant);
// { kind: 'functional', root: 'group-hover', value: null, modifier: null }

// Parse arbitrary variant
const arbitraryVariant = designSystem.parseVariant('[&:nth-child(3)]');
console.log(arbitraryVariant);
// { kind: 'arbitrary', selector: '&:nth-child(3)', relative: true }

// Parse compound variant
const compoundVariant = designSystem.parseVariant('group-hover/sidebar');
console.log(compoundVariant);
// {
//   kind: 'compound',
//   root: 'group-hover',
//   modifier: 'sidebar',
//   variant: { kind: 'static', root: 'hover' }
// }
```

### Utility Value Types

Represents values in functional utilities.

```typescript { .api }
/**
 * Union of utility value types
 */
type UtilityValue = ArbitraryUtilityValue | NamedUtilityValue;

/**
 * Arbitrary value (e.g., [12px], [#abc123], [calc(100%-2rem)])
 */
interface ArbitraryUtilityValue {
  kind: 'arbitrary';
  dataType: string | null;
  value: string;
}

/**
 * Named value (e.g., 4, red-500, lg, 1/2)
 */
interface NamedUtilityValue {
  kind: 'named';
  value: string;
  fraction: string | null;
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

// Named value
const w4 = designSystem.parseCandidate('w-4');
console.log(w4[0].value);
// { kind: 'named', value: '4', fraction: null }

// Fraction value
const w12 = designSystem.parseCandidate('w-1/2');
console.log(w12[0].value);
// { kind: 'named', value: '1', fraction: '2' }

// Arbitrary value
const wArbitrary = designSystem.parseCandidate('w-[200px]');
console.log(wArbitrary[0].value);
// { kind: 'arbitrary', dataType: 'length', value: '200px' }

// Arbitrary value with type hint
const bgArbitrary = designSystem.parseCandidate('bg-[color:#abc]');
console.log(bgArbitrary[0].value);
// { kind: 'arbitrary', dataType: 'color', value: '#abc' }
```

### Candidate Modifier Types

Represents modifiers on utilities (e.g., opacity modifiers).

```typescript { .api }
/**
 * Union of modifier types
 */
type CandidateModifier = ArbitraryModifier | NamedModifier;

/**
 * Arbitrary modifier (e.g., /[0.5], /[35%])
 */
interface ArbitraryModifier {
  kind: 'arbitrary';
  value: string;
}

/**
 * Named modifier (e.g., /50, /dark)
 */
interface NamedModifier {
  kind: 'named';
  value: string;
}
```

**Usage Examples:**

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

// Named modifier
const bgWithModifier = designSystem.parseCandidate('bg-blue-500/50');
console.log(bgWithModifier[0].modifier);
// { kind: 'named', value: '50' }

// Arbitrary modifier
const bgArbitraryModifier = designSystem.parseCandidate('bg-blue-500/[0.35]');
console.log(bgArbitraryModifier[0].modifier);
// { kind: 'arbitrary', value: '0.35' }
```

## Working with Candidates

### Print Candidate

Convert candidate back to string.

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

const candidates = designSystem.parseCandidate('hover:bg-blue-500/50');
const candidate = candidates[0];

// Print back to string
const str = designSystem.printCandidate(candidate);
console.log(str); // "hover:bg-blue-500/50"
```

### Print Variant

Convert variant back to string.

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

const designSystem = await __unstable__loadDesignSystem('');

const variant = designSystem.parseVariant('group-hover/sidebar');

// Print back to string
const str = designSystem.printVariant(variant);
console.log(str); // "group-hover/sidebar"
```

## Complete Example: Candidate Analysis

```typescript
import { __unstable__loadDesignSystem } from 'tailwindcss';

async function analyzeCandidate(candidateStr: string) {
  const designSystem = await __unstable__loadDesignSystem('');

  const candidates = designSystem.parseCandidate(candidateStr);

  for (const candidate of candidates) {
    console.log(`Analyzing: ${candidate.raw}`);
    console.log(`Kind: ${candidate.kind}`);

    if (candidate.kind === 'static') {
      console.log(`Utility: ${candidate.root}`);
    } else if (candidate.kind === 'functional') {
      console.log(`Utility: ${candidate.root}`);
      if (candidate.value) {
        if (candidate.value.kind === 'named') {
          console.log(
            `Value: ${candidate.value.value}${candidate.value.fraction ? `/${candidate.value.fraction}` : ''}`
          );
        } else {
          console.log(`Arbitrary value: ${candidate.value.value}`);
        }
      }
      if (candidate.modifier) {
        console.log(
          `Modifier: ${candidate.modifier.kind === 'named' ? candidate.modifier.value : `[${candidate.modifier.value}]`}`
        );
      }
    } else if (candidate.kind === 'arbitrary') {
      console.log(`Property: ${candidate.property}`);
      console.log(`Value: ${candidate.value}`);
    }

    if (candidate.variants.length > 0) {
      console.log('Variants:');
      for (const variant of candidate.variants) {
        if (variant.kind === 'static') {
          console.log(`  - ${variant.root}`);
        } else if (variant.kind === 'functional') {
          console.log(`  - ${variant.root} (functional)`);
        } else if (variant.kind === 'arbitrary') {
          console.log(`  - ${variant.selector} (arbitrary)`);
        } else if (variant.kind === 'compound') {
          console.log(`  - ${variant.root}/${variant.modifier} (compound)`);
        }
      }
    }

    if (candidate.important) {
      console.log('Important: true');
    }
  }
}

// Example usage
await analyzeCandidate('hover:md:bg-blue-500/50');
await analyzeCandidate('group-hover/sidebar:opacity-50');
await analyzeCandidate('[&:nth-child(3)]:flex');
await analyzeCandidate('!w-[200px]');
```

