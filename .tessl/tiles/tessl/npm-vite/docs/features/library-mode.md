# Library Mode

Vite provides a specialized library mode for building reusable JavaScript/TypeScript libraries. Library mode optimizes the build for distribution as npm packages with support for multiple output formats, proper externalization, and flexible entry points.

## Capabilities

### Enable Library Mode

Configure Vite to build a library instead of an application.

```typescript { .api }
/**
 * Library mode configuration options
 */
interface LibraryOptions {
  /**
   * Path of library entry point(s)
   * Can be a single entry or multiple entries
   */
  entry: string | string[] | Record<string, string>;

  /**
   * Library name (required for UMD/IIFE formats)
   * Used as the global variable name
   */
  name?: string;

  /**
   * Output formats to generate
   * @default ['es', 'umd'] (can be inferred from package.json)
   */
  formats?: LibraryFormats[];

  /**
   * Output file name(s)
   * Can be a string or function
   */
  fileName?: string | ((format: LibraryFormats, entryName: string) => string);

  /**
   * CSS file name for library
   * Falls back to package.json name
   */
  cssFileName?: string;
}

/**
 * Supported library output formats
 */
type LibraryFormats = 'es' | 'cjs' | 'umd' | 'iife' | 'system';
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // Entry point(s) for the library
      entry: resolve(__dirname, 'src/index.ts'),

      // Library name (for UMD/IIFE global variable)
      name: 'MyLib',

      // Output formats
      formats: ['es', 'cjs', 'umd'],

      // Output file naming
      fileName: (format) => `my-lib.${format}.js`
    },

    rollupOptions: {
      // Externalize dependencies
      external: ['react', 'react-dom'],

      output: {
        // Globals for UMD build
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

### Output Formats

Generate library builds in different module formats.

**ES Modules (es):**
Modern standard format, tree-shakeable, best for modern bundlers.

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es']
    }
  }
});

// Output: dist/my-lib.es.js
// Usage: import { func } from 'my-lib';
```

**CommonJS (cjs):**
Node.js standard format, compatible with older tools.

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['cjs']
    }
  }
});

// Output: dist/my-lib.cjs.js
// Usage: const { func } = require('my-lib');
```

**UMD (umd):**
Universal format, works in browsers, Node.js, and AMD loaders.

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib', // Required for UMD
      formats: ['umd']
    }
  }
});

// Output: dist/my-lib.umd.js
// Usage in browser: <script src="my-lib.umd.js"></script>
// Access via: window.MyLib
```

**IIFE (iife):**
Immediately Invoked Function Expression, for browser script tags.

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib', // Required for IIFE
      formats: ['iife']
    }
  }
});

// Output: dist/my-lib.iife.js
// Usage: <script src="my-lib.iife.js"></script>
// Access via: window.MyLib
```

**SystemJS (system):**
System module format for dynamic module loading.

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['system']
    }
  }
});

// Output: dist/my-lib.system.js
// Usage with SystemJS loader
```

### Multiple Entry Points

Build a library with multiple entry points for modular exports.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      // Multiple entries as object
      entry: {
        main: resolve(__dirname, 'src/index.ts'),
        utils: resolve(__dirname, 'src/utils.ts'),
        components: resolve(__dirname, 'src/components/index.ts')
      },
      formats: ['es', 'cjs']
    }
  }
});

// Outputs:
// dist/main.es.js, dist/main.cjs.js
// dist/utils.es.js, dist/utils.cjs.js
// dist/components.es.js, dist/components.cjs.js

// package.json
{
  "exports": {
    ".": {
      "import": "./dist/main.es.js",
      "require": "./dist/main.cjs.js"
    },
    "./utils": {
      "import": "./dist/utils.es.js",
      "require": "./dist/utils.cjs.js"
    },
    "./components": {
      "import": "./dist/components.es.js",
      "require": "./dist/components.cjs.js"
    }
  }
}
```

### Custom File Naming

Control output file names with custom patterns.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'umd'],

      // Simple string pattern
      fileName: 'my-library',
      // Output: my-library.es.js, my-library.cjs.js, my-library.umd.js

      // Or function for dynamic naming
      fileName: (format, entryName) => {
        if (format === 'es') {
          return `${entryName}.mjs`;
        }
        if (format === 'cjs') {
          return `${entryName}.cjs`;
        }
        return `${entryName}.${format}.js`;
      }
    }
  }
});

// Output:
// dist/index.mjs (ES)
// dist/index.cjs (CommonJS)
// dist/index.umd.js (UMD)
```

### Externalize Dependencies

Exclude dependencies from the library bundle.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts'
    },

    rollupOptions: {
      // Externalize all dependencies
      external: [
        'react',
        'react-dom',
        'lodash',
        '@emotion/react'
      ],

      // Or use regex
      external: /^(react|lodash)/,

      // Or function for dynamic logic
      external: (id) => {
        // Externalize all node_modules
        return id.includes('node_modules');
      }
    }
  }
});

// Dependencies won't be bundled in output
// Users must install them separately
```

### UMD Globals

Define global variable names for UMD dependencies.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd']
    },

    rollupOptions: {
      external: ['react', 'react-dom', 'lodash'],

      output: {
        // Map external dependencies to global variables
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          lodash: '_'
        }
      }
    }
  }
});

// In UMD build:
// import React from 'react' → window.React
// import _ from 'lodash' → window._
```

### CSS Handling in Libraries

Configure CSS extraction and naming for library builds.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',

      // Custom CSS file name
      cssFileName: 'my-lib-styles'
    },

    // CSS code splitting
    cssCodeSplit: false, // Combine all CSS into one file

    rollupOptions: {
      output: {
        // Ensure CSS assets have consistent names
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'my-lib.css';
          }
          return assetInfo.name;
        }
      }
    }
  }
});

// Output: dist/my-lib-styles.css
```

### Package.json Configuration

Configure package.json for library distribution.

**Usage Example:**

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-library.cjs.js",
  "module": "./dist/my-library.es.js",
  "exports": {
    ".": {
      "import": "./dist/my-library.es.js",
      "require": "./dist/my-library.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/my-library.css"
  },
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "vite": "^5.0.0"
  }
}
```

### TypeScript Declarations

Generate TypeScript declaration files for the library.

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs']
    }
  },

  plugins: [
    // Generate .d.ts files
    dts({
      insertTypesEntry: true
    })
  ]
});

// Or use tsc directly:
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": true
  }
}

// package.json scripts
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

### React Component Library

Build a React component library with proper externalization.

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyComponents',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },

    rollupOptions: {
      // Externalize React
      external: ['react', 'react-dom', 'react/jsx-runtime'],

      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        }
      }
    }
  }
});

// package.json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

### Vue Component Library

Build a Vue component library.

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyVueLib',
      formats: ['es', 'cjs'],
      fileName: (format) => `my-vue-lib.${format}.js`
    },

    rollupOptions: {
      // Externalize Vue
      external: ['vue'],

      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});

// package.json
{
  "peerDependencies": {
    "vue": "^3.0.0"
  }
}
```

### Utility Library

Build a framework-agnostic utility library.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'umd', 'iife'],
      name: 'MyUtils',
      fileName: (format) => {
        const ext = format === 'es' ? 'mjs' : 'js';
        return `my-utils.${format}.${ext}`;
      }
    },

    rollupOptions: {
      // No externals - bundle everything
      external: []
    },

    // Minify for production
    minify: 'terser',

    // Generate source maps
    sourcemap: true
  }
});
```

### Multi-Format Publishing

Publish library with all formats for maximum compatibility.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLibrary',
      formats: ['es', 'cjs', 'umd', 'iife']
    }
  }
});

// package.json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "./dist/my-library.cjs.js",
  "module": "./dist/my-library.es.js",
  "browser": "./dist/my-library.umd.js",
  "unpkg": "./dist/my-library.iife.js",
  "jsdelivr": "./dist/my-library.iife.js",
  "exports": {
    ".": {
      "import": "./dist/my-library.es.js",
      "require": "./dist/my-library.cjs.js",
      "browser": "./dist/my-library.umd.js"
    }
  }
}
```

## Types

```typescript { .api }
/**
 * Library mode configuration
 */
interface LibraryOptions {
  entry: string | string[] | Record<string, string>;
  name?: string;
  formats?: LibraryFormats[];
  fileName?: string | ((format: LibraryFormats, entryName: string) => string);
  cssFileName?: string;
}

/**
 * Library output formats
 */
type LibraryFormats = 'es' | 'cjs' | 'umd' | 'iife' | 'system';

/**
 * Build options with library mode
 */
interface BuildOptions {
  /**
   * Library mode configuration
   */
  lib?: LibraryOptions;

  /**
   * Rollup options for advanced configuration
   */
  rollupOptions?: {
    external?: string | RegExp | (string | RegExp)[] | ((id: string) => boolean);
    output?: {
      globals?: Record<string, string>;
      assetFileNames?: string | ((chunkInfo: any) => string);
    };
  };
}
```
