# Static Asset Query Parameters

Vite supports special query parameters that modify how static assets are imported. These queries control whether assets are inlined, returned as URLs, or imported as raw content.

## Capabilities

### URL Query

Explicitly import an asset as a URL, bypassing default inlining behavior for small files.

```typescript { .api }
// Import with ?url suffix to always get a URL string
import assetUrl from './asset.png?url';

// Type definition
declare module '*?url' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
import imageUrl from './large-image.png?url';
import dataUrl from './data.json?url';

// Always returns a URL, never inlined
console.log(imageUrl); // "/assets/large-image.a3b4c5d6.png"

// Useful for fetch operations
const response = await fetch(dataUrl);
const data = await response.json();
```

### Raw Query

Import file contents as a raw string, useful for reading file content directly.

```typescript { .api }
// Import with ?raw suffix to get file contents as string
import shaderSource from './shader.glsl?raw';
import textContent from './template.html?raw';

// Type definition
declare module '*?raw' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
import shaderSource from './shader.glsl?raw';
import svgContent from './icon.svg?raw';
import sqlQuery from './query.sql?raw';

// Get file contents as string
console.log(shaderSource); // "void main() { ... }"

// Use with WebGL
const shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(shader, shaderSource);

// Manipulate raw SVG
const parser = new DOMParser();
const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
```

### Inline Query

Force small assets to be inlined as base64 data URLs, regardless of size threshold.

```typescript { .api }
// Import with ?inline suffix to force base64 inlining
import inlinedImage from './icon.png?inline';

// Type definition
declare module '*?inline' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
import smallIcon from './icon.png?inline';
import tinyImage from './pixel.gif?inline';

// Returns base64 data URL
console.log(smallIcon); // "data:image/png;base64,iVBORw0KG..."

// Useful for critical assets that should never require HTTP request
const img = document.createElement('img');
img.src = smallIcon; // No network request
```

### No-Inline Query

Prevent automatic inlining of small assets, always emit as separate file.

```typescript { .api }
// Import with ?no-inline suffix to prevent inlining
import alwaysExternalAsset from './small-logo.png?no-inline';

// Type definition
declare module '*?no-inline' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
import smallImage from './thumbnail.jpg?no-inline';

// Even if file is small, it will be emitted as separate file
console.log(smallImage); // "/assets/thumbnail.a3b4c5d6.jpg"

// Useful when you want consistent asset loading behavior
```

### Combined URL Queries

Combine URL query with inline/no-inline modifiers for explicit control.

```typescript { .api }
// Combine ?url with inline control
import urlAndInline from './asset.png?url&inline';
import urlNoInline from './asset.png?url&no-inline';

// Type definitions
declare module '*?url&inline' {
  const src: string;
  export default src;
}

declare module '*?url&no-inline' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
// Force URL format with inline as base64
import iconBase64 from './icon.png?url&inline';
console.log(iconBase64); // "data:image/png;base64,..."

// Force URL format but never inline
import logoUrl from './logo.png?url&no-inline';
console.log(logoUrl); // "/assets/logo.a3b4c5d6.png"
```

### Query Parameter Behavior Matrix

Different query combinations produce different asset handling:

| Import                       | Small File (&lt;4kb) | Large File (&gt;4kb) |
|------------------------------|---------------------|---------------------|
| `import x from './a.png'`    | Inlined base64      | URL to file         |
| `import x from './a.png?url'`| URL to file         | URL to file         |
| `import x from './a.png?raw'`| Raw content string  | Raw content string  |
| `import x from './a.png?inline'` | Inlined base64  | Inlined base64      |
| `import x from './a.png?no-inline'` | URL to file | URL to file         |

**Note:** Default inline threshold is 4096 bytes (4kb), configurable via `build.assetsInlineLimit`.

### JSON URL Import

Special case for JSON files - using `?url` returns the URL instead of parsed JSON.

```typescript { .api }
// Import JSON as URL instead of parsed object
import dataUrl from './data.json?url';

// Without query, JSON is parsed
import data from './data.json'; // Returns: { ... }

// With ?url query, returns URL string
import dataPath from './data.json?url'; // Returns: "/assets/data.json"
```

**Usage Example:**

```typescript
// Normal JSON import (parsed)
import config from './config.json';
console.log(config.version); // Direct access to JSON properties

// JSON URL import (for dynamic loading)
import configUrl from './config.json?url';
const response = await fetch(configUrl);
const config = await response.json();

// Useful when JSON should be fetched dynamically or by external libraries
```

### Configuration

Asset query behavior can be configured in `vite.config.ts`:

```typescript
export default {
  build: {
    // Set inline threshold (bytes)
    assetsInlineLimit: 4096, // 4kb default

    // Can also be a function for conditional logic
    assetsInlineLimit: (filePath, content) => {
      if (filePath.endsWith('.svg')) {
        return 1024; // Inline SVGs up to 1kb
      }
      return 4096; // Other assets up to 4kb
    }
  }
}
```

## Types

All query parameters modify how the asset is returned:

```typescript { .api }
// All query parameter imports return strings
type AssetURL = string;
type RawContent = string;
type InlinedDataURL = string;
```
