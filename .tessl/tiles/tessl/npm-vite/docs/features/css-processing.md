# CSS Processing

Vite provides comprehensive CSS processing capabilities including CSS Modules, preprocessors (Sass, Less, Stylus), PostCSS, and Lightning CSS. All CSS is processed with full Hot Module Replacement support and can be transformed during both development and build.

## Capabilities

### Preprocess CSS

Process CSS with preprocessors and PostCSS transformations.

```typescript { .api }
import { preprocessCSS } from 'vite';

/**
 * Preprocess CSS code with configured preprocessors and PostCSS
 * @param code - CSS source code
 * @param filename - File path (determines preprocessor from extension)
 * @param config - Resolved Vite configuration
 * @returns Preprocessed CSS result with code and source map
 */
function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>;

/**
 * Result of CSS preprocessing
 */
interface PreprocessCSSResult {
  /** Processed CSS code */
  code: string;
  /** Source map */
  map?: SourceMap;
  /** Module dependencies */
  deps?: Set<string>;
  /** Errors encountered during processing */
  errors?: RollupError[];
}
```

**Usage Example:**

```typescript
import { preprocessCSS, resolveConfig } from 'vite';

const config = await resolveConfig({}, 'serve', 'development');

// Process Sass
const result = await preprocessCSS(
  '$color: blue; .title { color: $color; }',
  '/src/styles.scss',
  config
);

console.log(result.code); // Compiled CSS
console.log(result.map);  // Source map
console.log(result.deps); // @import dependencies
```

### Format PostCSS Source Map

Format PostCSS source maps for proper integration with Vite's source map handling.

```typescript { .api }
import { formatPostcssSourceMap } from 'vite';

/**
 * Format a PostCSS source map for Vite consumption
 * @param rawMap - Raw source map from PostCSS
 * @param file - File path for the source map
 * @returns Formatted source map
 */
function formatPostcssSourceMap(
  rawMap: ExistingRawSourceMap,
  file: string
): Promise<ExistingRawSourceMap>;
```

**Usage Example:**

```typescript
import { formatPostcssSourceMap } from 'vite';

// After PostCSS processing
const postcssResult = await postcss(plugins).process(css, {
  from: filename,
  map: { inline: false }
});

// Format the source map
const formattedMap = await formatPostcssSourceMap(
  postcssResult.map.toJSON(),
  filename
);
```

### CSS Options

Configure CSS processing behavior.

```typescript { .api }
/**
 * CSS configuration options
 */
interface CSSOptions {
  /**
   * CSS transformer to use
   * @default 'postcss'
   * @experimental lightningcss support is experimental
   */
  transformer?: 'postcss' | 'lightningcss';

  /**
   * CSS Modules configuration
   * Set to false to disable CSS Modules
   * @default {}
   */
  modules?: CSSModulesOptions | false;

  /**
   * Options for CSS preprocessors
   * Supports additionalData for injecting code into each file
   */
  preprocessorOptions?: {
    /** Sass (Dart Sass) options */
    scss?: SassPreprocessorOptions;
    /** Sass (Dart Sass, indented syntax) options */
    sass?: SassPreprocessorOptions;
    /** Less options */
    less?: LessPreprocessorOptions;
    /** Stylus options */
    styl?: StylusPreprocessorOptions;
    /** Stylus options (alternative key) */
    stylus?: StylusPreprocessorOptions;
  };

  /**
   * Run preprocessors in workers for better performance
   * true means number of CPUs minus 1
   * @default true
   */
  preprocessorMaxWorkers?: number | true;

  /**
   * PostCSS configuration
   * Can be a path to config file or inline config
   */
  postcss?:
    | string
    | (PostCSSProcessOptions & {
        plugins?: PostCSSPlugin[];
      });

  /**
   * Enable CSS code splitting
   * @default true
   */
  devSourcemap?: boolean;

  /**
   * Lightning CSS options (when transformer is 'lightningcss')
   * @experimental
   */
  lightningcss?: LightningCSSOptions;
}
```

**Configuration Example:**

```typescript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    // Use Lightning CSS (experimental)
    transformer: 'postcss',

    // CSS Modules configuration
    modules: {
      localsConvention: 'camelCaseOnly',
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },

    // Preprocessor options
    preprocessorOptions: {
      scss: {
        // Inject variables into every SCSS file
        additionalData: `$primary-color: #333;`,
        api: 'modern-compiler'
      },
      less: {
        math: 'always',
        globalVars: {
          'primary-color': '#333'
        }
      }
    },

    // PostCSS configuration
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')
      ]
    },

    // Enable source maps in development
    devSourcemap: true
  }
});
```

### CSS Modules

Configure CSS Modules behavior and class name generation.

```typescript { .api }
/**
 * CSS Modules configuration
 */
interface CSSModulesOptions {
  /**
   * Determine if a file should be treated as a CSS module
   * @default /\.module\.\w+$/
   */
  getJSON?: (
    cssFileName: string,
    json: Record<string, string>,
    outputFileName: string,
  ) => void;

  /**
   * Configure how CSS Modules are scoped
   * @default 'local'
   */
  scopeBehaviour?: 'global' | 'local';

  /**
   * Pattern for generating scoped class names
   * @default '[name]__[local]___[hash:base64:5]' in dev
   * @default '[hash:base64:5]' in production
   */
  generateScopedName?:
    | string
    | ((
        name: string,
        filename: string,
        css: string,
      ) => string);

  /**
   * Hash prefix for generated class names
   */
  hashPrefix?: string;

  /**
   * Convention for exported class names
   * @default 'camelCaseOnly'
   */
  localsConvention?:
    | 'camelCase'
    | 'camelCaseOnly'
    | 'dashes'
    | 'dashesOnly'
    | null;

  /**
   * Paths to treat as global CSS
   */
  globalModulePaths?: RegExp[];
}
```

**CSS Modules Usage:**

```typescript
// Component.module.css
.container {
  padding: 20px;
}

.titleText {
  font-size: 24px;
  color: blue;
}

// Component.tsx
import styles from './Component.module.css';

export function Component() {
  return (
    <div className={styles.container}>
      <h1 className={styles.titleText}>Hello</h1>
    </div>
  );
}
```

**Custom Class Name Generation:**

```typescript
export default defineConfig({
  css: {
    modules: {
      generateScopedName: (name, filename, css) => {
        const file = path.basename(filename, '.module.css');
        return `${file}_${name}_${hash(css)}`;
      },

      localsConvention: 'camelCaseOnly',

      scopeBehaviour: 'local'
    }
  }
});
```

### Sass/SCSS Preprocessor

Configure Sass compilation with Dart Sass.

```typescript { .api }
/**
 * Sass preprocessor options
 */
interface SassPreprocessorOptions {
  /**
   * Sass API to use
   * @default 'modern-compiler' (recommended)
   */
  api?: 'legacy' | 'modern' | 'modern-compiler';

  /**
   * Data to prepend to every Sass file
   */
  additionalData?:
    | string
    | ((source: string, filename: string) => string | Promise<string>);

  /**
   * Indented syntax (for .sass files)
   */
  indentedSyntax?: boolean;

  /**
   * Import paths
   */
  includePaths?: string[];

  /**
   * Output style
   */
  outputStyle?: 'expanded' | 'compressed';

  /**
   * Source map options
   */
  sourceMap?: boolean;
  sourceMapIncludeSources?: boolean;

  /**
   * Character encoding
   */
  charset?: boolean;

  /**
   * Custom importers
   */
  importers?: Importer[];

  /**
   * Custom functions
   */
  functions?: Record<string, CustomFunction>;
}
```

**Sass Example:**

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `,
        includePaths: ['node_modules'],
        functions: {
          'to-rem($px)': (args) => {
            const px = args[0].assertNumber('px').value;
            return new sass.SassNumber(px / 16, 'rem');
          }
        }
      }
    }
  }
});
```

### Less Preprocessor

Configure Less compilation.

```typescript { .api }
/**
 * Less preprocessor options
 */
interface LessPreprocessorOptions {
  /**
   * Data to prepend to every Less file
   */
  additionalData?:
    | string
    | ((source: string, filename: string) => string | Promise<string>);

  /**
   * Math mode
   * @default 'always'
   */
  math?: 'always' | 'strict' | 'parens-division' | 'parens' | 'strict-legacy';

  /**
   * Include paths
   */
  paths?: string[];

  /**
   * Enable JavaScript
   */
  javascriptEnabled?: boolean;

  /**
   * Global variables
   */
  globalVars?: Record<string, string>;

  /**
   * Modify variables
   */
  modifyVars?: Record<string, string>;

  /**
   * Rewrite URLs
   */
  rewriteUrls?: 'off' | 'local' | 'all';
}
```

**Less Example:**

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
        globalVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius-base': '2px'
        },
        modifyVars: {
          'text-color': '#333'
        },
        javascriptEnabled: true
      }
    }
  }
});
```

### Stylus Preprocessor

Configure Stylus compilation.

```typescript { .api }
/**
 * Stylus preprocessor options
 */
interface StylusPreprocessorOptions {
  /**
   * Data to prepend to every Stylus file
   */
  additionalData?:
    | string
    | ((source: string, filename: string) => string | Promise<string>);

  /**
   * Import paths
   */
  imports?: string[];

  /**
   * Include paths
   */
  paths?: string[];

  /**
   * Define variables
   */
  define?: Record<string, any>;

  /**
   * Enable CSS literals
   */
  includeCSS?: boolean;

  /**
   * Resolve relative URLs
   */
  resolveURL?: boolean | { nocheck?: boolean; paths?: string[] };
}
```

**Stylus Example:**

```typescript
export default defineConfig({
  css: {
    preprocessorOptions: {
      stylus: {
        imports: ['@/styles/variables.styl'],
        define: {
          '$primary-color': '#3498db',
          '$secondary-color': '#2ecc71'
        },
        includeCSS: true
      }
    }
  }
});
```

### PostCSS Configuration

Configure PostCSS plugins and options.

```typescript { .api }
/**
 * PostCSS process options
 */
interface PostCSSProcessOptions {
  /** PostCSS plugins */
  plugins?: PostCSSPlugin[];

  /** Parser to use */
  parser?: string | PostCSSParser;

  /** Syntax to use */
  syntax?: string | PostCSSSyntax;

  /** Stringifier to use */
  stringifier?: string | PostCSSStringifier;

  /** Process options */
  map?: false | {
    inline?: boolean;
    annotation?: boolean | string;
    sourcesContent?: boolean;
  };
}
```

**PostCSS Example:**

```typescript
// vite.config.js
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('postcss-nested'),
        require('postcss-custom-media'),
        require('autoprefixer')({
          overrideBrowserslist: ['last 2 versions']
        })
      ]
    }
  }
});

// Or use postcss.config.js
// postcss.config.js
export default {
  plugins: {
    'postcss-nested': {},
    'autoprefixer': {}
  }
};
```

### Lightning CSS (Experimental)

Use Lightning CSS as an alternative CSS transformer.

```typescript { .api }
/**
 * Lightning CSS options
 * @experimental
 */
interface LightningCSSOptions {
  /** Target browsers */
  targets?: {
    android?: number;
    chrome?: number;
    edge?: number;
    firefox?: number;
    ie?: number;
    ios_saf?: number;
    opera?: number;
    safari?: number;
    samsung?: number;
  };

  /** Include browser prefixes */
  include?: Features;

  /** Exclude features */
  exclude?: Features;

  /** Enable drafts */
  drafts?: {
    nesting?: boolean;
    customMedia?: boolean;
  };

  /** Analyze dependencies */
  analyzeDependencies?: boolean;

  /** Pseudo classes */
  pseudoClasses?: Record<string, string>;

  /** Minify output */
  minify?: boolean;

  /** Source map */
  sourceMap?: boolean;
}

type Features = number;
```

**Lightning CSS Example:**

```typescript
export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 90,
        firefox: 88,
        safari: 14
      },
      drafts: {
        nesting: true,
        customMedia: true
      },
      minify: true
    }
  }
});
```


## Types

### Resolved CSS Options

```typescript { .api }
/**
 * Resolved CSS options (internal)
 */
interface ResolvedCSSOptions {
  transformer: 'postcss' | 'lightningcss';
  modules: CSSModulesOptions | false;
  preprocessorOptions: Record<string, any>;
  preprocessorMaxWorkers: number;
  postcss: PostCSSProcessOptions | string;
  devSourcemap: boolean;
  lightningcss?: LightningCSSOptions;
}
```

### Source Map Types

```typescript { .api }
/**
 * Source map
 */
interface SourceMap {
  version: number;
  sources: string[];
  names: string[];
  mappings: string;
  file?: string;
  sourcesContent?: string[];
}

/**
 * Existing raw source map (from Rollup)
 */
interface ExistingRawSourceMap {
  version: number;
  sources: string[];
  names: string[];
  mappings: string;
  file?: string;
  sourceRoot?: string;
  sourcesContent?: string[];
}
```

### CSS Module Classes

```typescript { .api }
/**
 * CSS Module classes object
 * Maps original class names to generated scoped names
 */
type CSSModuleClasses = {
  readonly [key: string]: string;
};

// Usage in TypeScript
declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}
```
