# Build Manifest Generation

Vite can generate a JSON manifest file that maps original source files to their built output files. This manifest is essential for server-side rendering, asset preloading, and build tooling that needs to know the relationship between source and output files.

## Capabilities

### Enable Manifest Generation

Generate a manifest.json file containing the mapping of source files to build outputs.

```typescript { .api }
/**
 * Enable manifest generation in build configuration
 * Generates a manifest.json file in the output directory
 */
interface BuildOptions {
  /**
   * Generate manifest.json with asset mapping
   * @default false
   */
  manifest?: boolean | string;
}
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Generate manifest.json
    manifest: true,

    // Or specify custom manifest filename
    manifest: 'asset-manifest.json'
  }
});

// Generates: dist/manifest.json or dist/asset-manifest.json
```

### Manifest Structure

The manifest maps input files to their output information including dependencies.

```typescript { .api }
/**
 * Manifest type: Record mapping input files to chunk information
 */
type Manifest = Record<string, ManifestChunk>;

/**
 * Information about a single chunk or asset in the manifest
 */
interface ManifestChunk {
  /**
   * The input file name of this chunk/asset if known
   */
  src?: string;

  /**
   * The output file name of this chunk/asset
   */
  file: string;

  /**
   * The list of CSS files imported by this chunk
   * Only present in JS chunks
   */
  css?: string[];

  /**
   * The list of asset files imported by this chunk (excluding CSS)
   * Only present in JS chunks
   */
  assets?: string[];

  /**
   * Whether this chunk or asset is an entry point
   */
  isEntry?: boolean;

  /**
   * The name of this chunk/asset if known
   */
  name?: string;

  /**
   * Whether this chunk is a dynamic entry point
   * Only present in JS chunks
   */
  isDynamicEntry?: boolean;

  /**
   * The list of statically imported chunks by this chunk
   * Values are keys of the manifest. Only present in JS chunks
   */
  imports?: string[];

  /**
   * The list of dynamically imported chunks by this chunk
   * Values are keys of the manifest. Only present in JS chunks
   */
  dynamicImports?: string[];
}
```

**Example Manifest:**

```json
{
  "src/main.ts": {
    "file": "assets/main.4889e940.js",
    "src": "src/main.ts",
    "isEntry": true,
    "imports": ["_vendor.a4e2e939.js"],
    "css": ["assets/main.b82dbe22.css"]
  },
  "src/utils/helper.ts": {
    "file": "assets/helper.3h4f8d93.js",
    "src": "src/utils/helper.ts",
    "isDynamicEntry": true,
    "imports": ["_vendor.a4e2e939.js"]
  },
  "_vendor.a4e2e939.js": {
    "file": "assets/vendor.a4e2e939.js"
  },
  "src/assets/logo.png": {
    "file": "assets/logo.5d5d9eef.png",
    "src": "src/assets/logo.png"
  },
  "src/styles/main.css": {
    "file": "assets/main.b82dbe22.css",
    "src": "src/styles/main.css"
  }
}
```

### Reading Manifest for SSR

Use the manifest file to generate correct asset URLs in server-side rendering.

**Usage Example:**

```typescript
// server.ts
import fs from 'fs';
import path from 'path';

// Read the manifest
const manifestPath = path.resolve(__dirname, 'dist/manifest.json');
const manifest = JSON.parse(
  fs.readFileSync(manifestPath, 'utf-8')
) as Manifest;

// Get entry point files
function getEntryAssets(entry: string) {
  const chunk = manifest[entry];
  if (!chunk) {
    throw new Error(`Entry ${entry} not found in manifest`);
  }

  const assets = {
    js: [chunk.file],
    css: chunk.css || [],
    preload: chunk.imports || []
  };

  return assets;
}

// Use in HTML generation
const assets = getEntryAssets('src/main.ts');

const html = `
  <!DOCTYPE html>
  <html>
    <head>
      ${assets.css.map(file =>
        `<link rel="stylesheet" href="/${file}">`
      ).join('\n')}
      ${assets.preload.map(file => {
        const preloadChunk = manifest[file];
        return `<link rel="modulepreload" href="/${preloadChunk.file}">`;
      }).join('\n')}
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="/${assets.js[0]}"></script>
    </body>
  </html>
`;
```

### Entry Point Information

Identify entry points and their dependencies in the manifest.

**Usage Example:**

```typescript
import manifest from './dist/manifest.json';

// Find all entry points
function getEntryPoints() {
  return Object.entries(manifest)
    .filter(([_, chunk]) => chunk.isEntry)
    .map(([src, chunk]) => ({
      src,
      file: chunk.file,
      name: chunk.name
    }));
}

const entries = getEntryPoints();
// [
//   { src: 'src/main.ts', file: 'assets/main.4889e940.js', name: 'main' },
//   { src: 'index.html', file: 'index.html', name: undefined }
// ]

// Find dynamic entry points (lazy-loaded chunks)
function getDynamicEntries() {
  return Object.entries(manifest)
    .filter(([_, chunk]) => chunk.isDynamicEntry)
    .map(([src, chunk]) => ({ src, file: chunk.file }));
}
```

### CSS Dependencies

Extract CSS files associated with JavaScript chunks.

**Usage Example:**

```typescript
import manifest from './dist/manifest.json';

// Get all CSS files for an entry point
function getCSSForEntry(entry: string): string[] {
  const chunk = manifest[entry];
  if (!chunk) return [];

  const cssFiles = new Set<string>();

  // Add direct CSS imports
  if (chunk.css) {
    chunk.css.forEach(file => cssFiles.add(file));
  }

  // Add CSS from imported chunks
  if (chunk.imports) {
    chunk.imports.forEach(importKey => {
      const importedChunk = manifest[importKey];
      if (importedChunk?.css) {
        importedChunk.css.forEach(file => cssFiles.add(file));
      }
    });
  }

  return Array.from(cssFiles);
}

const allCSS = getCSSForEntry('src/main.ts');
// ['assets/main.b82dbe22.css', 'assets/vendor.d3e5f891.css']
```

### Preload Link Generation

Generate modulepreload links for better performance.

**Usage Example:**

```typescript
import manifest from './dist/manifest.json';

// Generate preload links for an entry
function generatePreloadLinks(entry: string): string {
  const chunk = manifest[entry];
  if (!chunk || !chunk.imports) {
    return '';
  }

  return chunk.imports
    .map(importKey => {
      const importedChunk = manifest[importKey];
      return `<link rel="modulepreload" href="/${importedChunk.file}">`;
    })
    .join('\n');
}

const preloads = generatePreloadLinks('src/main.ts');
// <link rel="modulepreload" href="/assets/vendor.a4e2e939.js">
```

### Asset Reference Resolution

Find all assets referenced by a JavaScript chunk.

**Usage Example:**

```typescript
import manifest from './dist/manifest.json';

// Get all assets for a chunk
function getChunkAssets(entry: string) {
  const chunk = manifest[entry];
  if (!chunk) return [];

  return {
    images: (chunk.assets || []).filter(f => /\.(png|jpg|jpeg|gif|svg|webp|avif)$/.test(f)),
    fonts: (chunk.assets || []).filter(f => /\.(woff|woff2|eot|ttf|otf)$/.test(f)),
    other: (chunk.assets || []).filter(f =>
      !/\.(png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|eot|ttf|otf)$/.test(f)
    )
  };
}

const assets = getChunkAssets('src/main.ts');
// {
//   images: ['assets/logo.5d5d9eef.png'],
//   fonts: ['assets/font.3b4f9a88.woff2'],
//   other: []
// }
```

### Dynamic Import Discovery

Find all dynamically imported chunks for code splitting.

**Usage Example:**

```typescript
import manifest from './dist/manifest.json';

// Get all dynamic imports for an entry
function getDynamicImports(entry: string): string[] {
  const chunk = manifest[entry];
  if (!chunk || !chunk.dynamicImports) {
    return [];
  }

  return chunk.dynamicImports.map(key => manifest[key].file);
}

const dynamicChunks = getDynamicImports('src/main.ts');
// ['assets/LazyComponent.8d9f3b2a.js', 'assets/admin.4f8e9c3d.js']

// Recursively get all dependencies
function getAllDependencies(entry: string, visited = new Set<string>()): string[] {
  if (visited.has(entry)) return [];
  visited.add(entry);

  const chunk = manifest[entry];
  if (!chunk) return [];

  const deps: string[] = [];

  // Static imports
  if (chunk.imports) {
    chunk.imports.forEach(key => {
      deps.push(manifest[key].file);
      deps.push(...getAllDependencies(key, visited));
    });
  }

  // Dynamic imports
  if (chunk.dynamicImports) {
    chunk.dynamicImports.forEach(key => {
      deps.push(manifest[key].file);
      deps.push(...getAllDependencies(key, visited));
    });
  }

  return deps;
}
```

### Multi-Page Application Manifest

Handle manifest for multi-page applications with multiple entry points.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin/index.html',
        mobile: 'mobile/index.html'
      }
    }
  }
});

// server.ts
import manifest from './dist/manifest.json';

// Get assets for specific page
function getPageAssets(htmlFile: string) {
  // Find the HTML entry in manifest
  const htmlEntry = manifest[htmlFile];
  if (!htmlEntry) return null;

  // The HTML file references JS entry points
  const jsEntries = Object.entries(manifest)
    .filter(([_, chunk]) => chunk.isEntry && chunk.file.endsWith('.js'));

  // Match based on naming convention or path
  const pageEntry = jsEntries.find(([src]) =>
    src.includes(htmlFile.replace('/index.html', ''))
  );

  if (!pageEntry) return null;

  return {
    js: pageEntry[1].file,
    css: pageEntry[1].css || [],
    imports: pageEntry[1].imports || []
  };
}

const mainAssets = getPageAssets('index.html');
const adminAssets = getPageAssets('admin/index.html');
```

### Custom Manifest Processing

Process the manifest for custom use cases like service worker generation.

**Usage Example:**

```typescript
import manifest from './dist/manifest.json';
import fs from 'fs';

// Generate service worker with all assets to cache
function generateServiceWorker() {
  // Get all output files
  const allFiles = Object.values(manifest).map(chunk => chunk.file);

  // Filter by type
  const jsFiles = allFiles.filter(f => /\.js$/.test(f));
  const cssFiles = allFiles.filter(f => /\.css$/.test(f));
  const assetFiles = allFiles.filter(f => !/\.(js|css)$/.test(f));

  const swContent = `
    const CACHE_NAME = 'v1';
    const urlsToCache = ${JSON.stringify([
      '/',
      ...jsFiles.map(f => `/${f}`),
      ...cssFiles.map(f => `/${f}`),
      ...assetFiles.map(f => `/${f}`)
    ], null, 2)};

    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => cache.addAll(urlsToCache))
      );
    });
  `;

  fs.writeFileSync('dist/sw.js', swContent);
}

generateServiceWorker();
```

## Types

```typescript { .api }
/**
 * Manifest type: maps input files to output information
 */
type Manifest = Record<string, ManifestChunk>;

/**
 * Chunk/asset information in the manifest
 */
interface ManifestChunk {
  src?: string;
  file: string;
  css?: string[];
  assets?: string[];
  isEntry?: boolean;
  name?: string;
  isDynamicEntry?: boolean;
  imports?: string[];
  dynamicImports?: string[];
}

/**
 * Build configuration for manifest
 */
interface BuildOptions {
  /**
   * Generate manifest.json
   * @default false
   */
  manifest?: boolean | string;
}
```
