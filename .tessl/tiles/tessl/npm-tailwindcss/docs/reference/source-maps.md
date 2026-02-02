# Source Maps

TailwindCSS v4 includes built-in source map generation for debugging compiled CSS.

## Capabilities

### Create Source Map

Generate source map from AST.

```typescript { .api }
/**
 * Creates source map from AST nodes
 * @param options - Options with AST
 * @returns Decoded source map
 */
function createSourceMap(options: { ast: AstNode[] }): DecodedSourceMap;
```

**Usage Examples:**

```typescript
import { compile, createSourceMap } from 'tailwindcss';

const result = await compile(css, {
  from: 'styles.css',
});

// Generate source map from compile result
const sourceMap = result.buildSourceMap();
console.log(sourceMap);

// Or create from AST directly
import { parse, createSourceMap } from 'tailwindcss';

const ast = parse(css, { from: 'styles.css' });
const sourceMap = createSourceMap({ ast });
console.log(sourceMap);
```

## Types

### Decoded Source Map

Complete source map structure.

```typescript { .api }
/**
 * Decoded source map structure
 */
interface DecodedSourceMap {
  /** Output file name */
  file: string | null;

  /** Array of source files */
  sources: DecodedSource[];

  /** Array of position mappings */
  mappings: DecodedMapping[];
}

/**
 * Source file in source map
 */
interface DecodedSource {
  /** Source file URL */
  url: string | null;

  /** Source file content (embedded) */
  content: string | null;

  /** Whether to ignore this source */
  ignore: boolean;
}

/**
 * Source map mapping between generated and original positions
 */
interface DecodedMapping {
  /** Position in original source */
  originalPosition: OriginalPosition | null;

  /** Position in generated output */
  generatedPosition: Position;

  /** Optional name at this position */
  name: string | null;
}

/**
 * Position in source file
 */
interface Position {
  /** Line number (0-indexed) */
  line: number;

  /** Column number (0-indexed) */
  column: number;
}

/**
 * Original position with source reference
 */
interface OriginalPosition extends Position {
  /** Source file reference */
  source: DecodedSource;
}
```

## Usage Examples

### Generate Source Map from Compilation

```typescript
import { compile } from 'tailwindcss';
import { writeFile } from 'fs/promises';

const css = `
  @theme {
    --color-primary: #3b82f6;
  }

  .button {
    @apply bg-primary text-white px-4 py-2 rounded;
  }
`;

const result = await compile(css, {
  from: 'styles.css',
});

// Build CSS
const output = result.build();

// Generate source map
const sourceMap = result.buildSourceMap();

// Write output files
await writeFile('output.css', output);
await writeFile('output.css.map', JSON.stringify(sourceMap));

// Add source map comment to CSS
const withComment = `${output}\n/*# sourceMappingURL=output.css.map */`;
await writeFile('output.css', withComment);
```

### Inspect Source Map

```typescript
import { compile } from 'tailwindcss';

const result = await compile(css, { from: 'styles.css' });
const sourceMap = result.buildSourceMap();

console.log('Source map:');
console.log(`File: ${sourceMap.file}`);
console.log(`Sources: ${sourceMap.sources.length}`);
console.log(`Mappings: ${sourceMap.mappings.length}`);

// List sources
for (const source of sourceMap.sources) {
  console.log(`Source: ${source.url}`);
  console.log(`Has content: ${source.content !== null}`);
  console.log(`Ignore: ${source.ignore}`);
}

// Inspect mappings
for (const mapping of sourceMap.mappings.slice(0, 10)) {
  console.log('Mapping:');
  console.log(
    `  Generated: line ${mapping.generatedPosition.line}, col ${mapping.generatedPosition.column}`
  );
  if (mapping.originalPosition) {
    const source = sourceMap.sources[mapping.originalPosition.source];
    console.log(
      `  Original: ${source.url} line ${mapping.originalPosition.line}, col ${mapping.originalPosition.column}`
    );
  }
  if (mapping.name) {
    console.log(`  Name: ${mapping.name}`);
  }
}
```

### Convert to Standard Source Map Format

```typescript
import { compile } from 'tailwindcss';

const result = await compile(css, { from: 'input.css' });
const decoded = result.buildSourceMap();

// Convert to standard source map format
interface StandardSourceMap {
  version: number;
  file: string | null;
  sources: string[];
  sourcesContent: (string | null)[];
  mappings: string;
  names: string[];
}

function encodeSourceMap(decoded: DecodedSourceMap): StandardSourceMap {
  const sources = decoded.sources.map((s) => s.url || '');
  const sourcesContent = decoded.sources.map((s) => s.content);

  // Encode mappings to Base64 VLQ format
  const mappings = encodeMappings(decoded.mappings);

  // Extract unique names
  const names = Array.from(
    new Set(
      decoded.mappings
        .map((m) => m.name)
        .filter((n): n is string => n !== null)
    )
  );

  return {
    version: 3,
    file: decoded.file,
    sources,
    sourcesContent,
    mappings,
    names,
  };
}

function encodeMappings(mappings: DecodedMapping[]): string {
  // Implementation of Base64 VLQ encoding
  // This is simplified - real implementation would be more complex
  return '';
}

const standardMap = encodeSourceMap(decoded);
console.log(JSON.stringify(standardMap, null, 2));
```

### Debug with Source Maps

```typescript
import { compile } from 'tailwindcss';

// Compile with source tracking
const result = await compile(css, {
  from: 'input.css',
});

const sourceMap = result.buildSourceMap();

// Find source location for generated line
function findSourceLocation(generatedLine: number, generatedColumn: number) {
  for (const mapping of sourceMap.mappings) {
    if (
      mapping.generatedPosition.line === generatedLine &&
      mapping.generatedPosition.column === generatedColumn
    ) {
      if (mapping.originalPosition) {
        const source = sourceMap.sources[mapping.originalPosition.source];
        return {
          file: source.url,
          line: mapping.originalPosition.line,
          column: mapping.originalPosition.column,
        };
      }
    }
  }
  return null;
}

// Debug specific line in output
const location = findSourceLocation(10, 5);
if (location) {
  console.log(
    `Generated line 10, col 5 comes from ${location.file} line ${location.line}, col ${location.column}`
  );
}
```

### Embed Source Content

```typescript
import { compile } from 'tailwindcss';
import { readFile } from 'fs/promises';

const css = await readFile('styles.css', 'utf-8');

const result = await compile(css, {
  from: 'styles.css',
});

const sourceMap = result.buildSourceMap();

// Sources already have content embedded
for (const source of sourceMap.sources) {
  console.log(`Source: ${source.url}`);
  console.log('Content:');
  console.log(source.content);
  console.log('---');
}

// This allows debugging without access to original source files
```

## Integration with Build Tools

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'tailwindcss-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  devtool: 'source-map',
};
```

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    devSourcemap: true,
  },
  build: {
    sourcemap: true,
  },
});
```

### PostCSS

```javascript
// postcss.config.js
module.exports = {
  map: {
    inline: false,
    annotation: true,
  },
  plugins: {
    tailwindcss: {},
  },
};
```

## Browser DevTools Usage

When source maps are enabled:

1. **Chrome DevTools**: CSS styles show original source file and line number
2. **Firefox DevTools**: Click on CSS rule to jump to original source
3. **Safari DevTools**: Hover over style to see source file location

Example CSS with source map comment:

```css
.button {
  background-color: #3b82f6;
  color: #fff;
  padding: 1rem;
}

/*# sourceMappingURL=output.css.map */
```

In DevTools, clicking on this rule will show `styles.css:5` instead of `output.css:1`.

