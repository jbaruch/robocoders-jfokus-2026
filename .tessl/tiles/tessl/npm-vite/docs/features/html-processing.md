# HTML Processing and Transformation

Vite provides powerful HTML processing capabilities through plugin hooks. HTML files can be transformed during development and build, allowing injection of tags, modification of content, and integration with the build pipeline.

## Capabilities

### HTML Transform Hook

Transform HTML content through plugin hooks with access to the build context.

```typescript { .api }
/**
 * Plugin hook for transforming HTML files
 * @param html - The HTML string to transform
 * @param ctx - Context containing request information and build details
 * @returns Transformed HTML or tag descriptors
 */
type IndexHtmlTransformHook = (
  this: MinimalPluginContextWithoutEnvironment,
  html: string,
  ctx: IndexHtmlTransformContext
) => IndexHtmlTransformResult | void | Promise<IndexHtmlTransformResult | void>;

/**
 * Context provided to HTML transform hooks
 */
interface IndexHtmlTransformContext {
  /**
   * Public path when served
   */
  path: string;

  /**
   * HTML file name
   */
  filename: string;

  /**
   * Vite dev server instance (development only)
   */
  server?: ViteDevServer;

  /**
   * Rollup output bundle (build only)
   */
  bundle?: OutputBundle;

  /**
   * Rollup output chunk (build only)
   */
  chunk?: OutputChunk;

  /**
   * Original URL before rewrites (development only)
   */
  originalUrl?: string;
}
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'html-transform',
    transformIndexHtml(html, ctx) {
      // Add meta tag
      return html.replace(
        '<head>',
        '<head>\n    <meta name="description" content="My App">'
      );
    }
  }]
});
```

### HTML Tag Injection

Inject HTML tags (script, link, meta, etc.) into specific locations in the document.

```typescript { .api }
/**
 * HTML tag descriptor for injection
 */
interface HtmlTagDescriptor {
  /**
   * Tag name (e.g., 'script', 'link', 'meta')
   */
  tag: string;

  /**
   * Tag attributes as key-value pairs
   */
  attrs?: Record<string, string | boolean | undefined>;

  /**
   * Tag children (for non-void elements)
   */
  children?: string | HtmlTagDescriptor[];

  /**
   * Where to inject the tag
   * @default 'head-prepend'
   */
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}

/**
 * Transform result can be:
 * - String: Transformed HTML
 * - Array: Tags to inject
 * - Object: Both HTML and tags
 */
type IndexHtmlTransformResult =
  | string
  | HtmlTagDescriptor[]
  | {
      html: string;
      tags: HtmlTagDescriptor[];
    };
```

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [{
    name: 'inject-tags',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0'
          },
          injectTo: 'head-prepend'
        },
        {
          tag: 'script',
          attrs: {
            src: 'https://cdn.example.com/analytics.js',
            async: true
          },
          injectTo: 'head'
        },
        {
          tag: 'div',
          attrs: {
            id: 'app-root'
          },
          injectTo: 'body-prepend'
        }
      ];
    }
  }]
});
```

### Transform Execution Order

Control when HTML transformations run using the `order` option.

```typescript { .api }
/**
 * HTML transform configuration with execution order
 */
type IndexHtmlTransform =
  | IndexHtmlTransformHook
  | {
      /**
       * Execution order: 'pre' runs before built-in, 'post' runs after
       */
      order?: 'pre' | 'post' | null;

      /**
       * Transform handler function
       */
      handler: IndexHtmlTransformHook;
    };
```

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'pre-transform',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          // Runs before Vite's built-in HTML transforms
          return html.replace('<!-- inject-config -->', '<script>window.config = {}</script>');
        }
      }
    },
    {
      name: 'post-transform',
      transformIndexHtml: {
        order: 'post',
        handler(html, ctx) {
          // Runs after Vite's built-in HTML transforms
          // Has access to final bundle information
          return html.replace(
            '</body>',
            `<script>console.log('Build time: ${new Date().toISOString()}')</script></body>`
          );
        }
      }
    }
  ]
});
```

### Inject Scripts with Attributes

Inject script tags with module type, async, or inline content.

**Usage Example:**

```typescript
export default defineConfig({
  plugins: [{
    name: 'inject-scripts',
    transformIndexHtml() {
      return [
        // External module script
        {
          tag: 'script',
          attrs: {
            type: 'module',
            src: '/src/init.ts'
          },
          injectTo: 'head'
        },
        // Inline script
        {
          tag: 'script',
          children: `
            window.APP_CONFIG = {
              apiUrl: '${process.env.API_URL}',
              version: '${process.env.npm_package_version}'
            };
          `,
          injectTo: 'head-prepend'
        },
        // External async script
        {
          tag: 'script',
          attrs: {
            src: 'https://cdn.example.com/widget.js',
            async: true,
            defer: true
          }
        }
      ];
    }
  }]
});
```

### Inject Links and Stylesheets

Add link tags for stylesheets, preloads, and other resources.

**Usage Example:**

```typescript
export default defineConfig({
  plugins: [{
    name: 'inject-links',
    transformIndexHtml() {
      return [
        // External stylesheet
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Roboto'
          },
          injectTo: 'head'
        },
        // Preload font
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: '/fonts/custom-font.woff2',
            as: 'font',
            type: 'font/woff2',
            crossorigin: true
          }
        },
        // Favicon
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            type: 'image/svg+xml',
            href: '/favicon.svg'
          }
        },
        // Preconnect to API
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://api.example.com'
          }
        }
      ];
    }
  }]
});
```

### Inject Meta Tags

Add meta tags for SEO, social media, and viewport configuration.

**Usage Example:**

```typescript
export default defineConfig({
  plugins: [{
    name: 'inject-meta',
    transformIndexHtml() {
      return [
        // Viewport
        {
          tag: 'meta',
          attrs: {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0'
          }
        },
        // Description
        {
          tag: 'meta',
          attrs: {
            name: 'description',
            content: 'My awesome application'
          }
        },
        // Open Graph
        {
          tag: 'meta',
          attrs: {
            property: 'og:title',
            content: 'My App'
          }
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://example.com/og-image.jpg'
          }
        },
        // Twitter Card
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary_large_image'
          }
        },
        // Theme color
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#3498db'
          }
        }
      ];
    }
  }]
});
```

### Conditional Transformations

Apply different transformations based on build mode or environment.

**Usage Example:**

```typescript
export default defineConfig(({ mode }) => ({
  plugins: [{
    name: 'conditional-html',
    transformIndexHtml(html, ctx) {
      const tags: HtmlTagDescriptor[] = [];

      // Development only
      if (ctx.server) {
        tags.push({
          tag: 'script',
          children: 'console.log("Development mode");'
        });
      }

      // Production only
      if (ctx.bundle) {
        tags.push({
          tag: 'script',
          attrs: {
            src: 'https://www.googletagmanager.com/gtag/js',
            async: true
          }
        });
      }

      // Mode-specific
      if (mode === 'staging') {
        tags.push({
          tag: 'meta',
          attrs: {
            name: 'robots',
            content: 'noindex, nofollow'
          }
        });
      }

      return tags;
    }
  }]
}));
```

### Access Build Information

Access bundle and chunk information in production builds.

**Usage Example:**

```typescript
export default defineConfig({
  plugins: [{
    name: 'bundle-info',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        // Find all JS chunks
        const jsChunks = Object.values(ctx.bundle).filter(
          chunk => chunk.type === 'chunk' && chunk.fileName.endsWith('.js')
        );

        // Inject preload hints for chunks
        const preloadTags = jsChunks.map(chunk => ({
          tag: 'link',
          attrs: {
            rel: 'modulepreload',
            href: `/${chunk.fileName}`
          }
        }));

        return {
          html,
          tags: preloadTags
        };
      }
    }
  }]
});
```

### Modify HTML Content

Transform the HTML string directly for complex modifications.

**Usage Example:**

```typescript
export default defineConfig({
  plugins: [{
    name: 'modify-html',
    transformIndexHtml(html, ctx) {
      // Replace placeholders
      html = html.replace(
        '%VITE_APP_TITLE%',
        process.env.VITE_APP_TITLE || 'My App'
      );

      // Add nonce to scripts for CSP
      const nonce = generateNonce();
      html = html.replace(
        /<script/g,
        `<script nonce="${nonce}"`
      );

      // Minify HTML in production
      if (ctx.bundle) {
        html = minifyHTML(html);
      }

      // Inject both modified HTML and tags
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: `script-src 'nonce-${nonce}'`
            }
          }
        ]
      };
    }
  }]
});
```

### Multi-Page Application (MPA) Support

Transform different HTML files with context-aware logic.

**Usage Example:**

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin/index.html',
        login: 'auth/login.html'
      }
    }
  },
  plugins: [{
    name: 'mpa-html',
    transformIndexHtml(html, ctx) {
      const tags: HtmlTagDescriptor[] = [];

      // Different transformations based on page
      if (ctx.path.includes('/admin/')) {
        tags.push({
          tag: 'script',
          attrs: { src: '/admin-bundle.js' }
        });
      } else if (ctx.path.includes('/auth/')) {
        tags.push({
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/auth-styles.css'
          }
        });
      }

      // Add page-specific title
      const title = ctx.filename.includes('admin') ? 'Admin Panel'
        : ctx.filename.includes('login') ? 'Login'
        : 'Home';

      html = html.replace(
        '<title>',
        `<title>${title} - `
      );

      return { html, tags };
    }
  }]
});
```

### Environment Variable Injection

Inject environment variables into HTML at build time.

**Usage Example:**

```typescript
export default defineConfig({
  plugins: [{
    name: 'inject-env',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // Inject environment variables into HTML
        return html.replace(
          '<head>',
          `<head>\n    <script>
            window.ENV = {
              API_URL: '${process.env.VITE_API_URL}',
              APP_VERSION: '${process.env.npm_package_version}',
              BUILD_TIME: '${new Date().toISOString()}'
            };
          </script>`
        );
      }
    }
  }]
});
```

## Types

```typescript { .api }
/**
 * HTML transform hook function
 */
type IndexHtmlTransformHook = (
  this: MinimalPluginContextWithoutEnvironment,
  html: string,
  ctx: IndexHtmlTransformContext
) => IndexHtmlTransformResult | void | Promise<IndexHtmlTransformResult | void>;

/**
 * HTML transform configuration
 */
type IndexHtmlTransform =
  | IndexHtmlTransformHook
  | {
      order?: 'pre' | 'post' | null;
      handler: IndexHtmlTransformHook;
    };

/**
 * Transform context
 */
interface IndexHtmlTransformContext {
  path: string;
  filename: string;
  server?: ViteDevServer;
  bundle?: OutputBundle;
  chunk?: OutputChunk;
  originalUrl?: string;
}

/**
 * Transform result
 */
type IndexHtmlTransformResult =
  | string
  | HtmlTagDescriptor[]
  | {
      html: string;
      tags: HtmlTagDescriptor[];
    };

/**
 * HTML tag descriptor
 */
interface HtmlTagDescriptor {
  tag: string;
  attrs?: Record<string, string | boolean | undefined>;
  children?: string | HtmlTagDescriptor[];
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
}

/**
 * Plugin interface with HTML transform
 */
interface Plugin {
  name: string;
  transformIndexHtml?: IndexHtmlTransform;
}
```
