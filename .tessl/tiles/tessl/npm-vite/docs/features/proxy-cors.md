# HTTP Proxy and CORS Configuration

Vite provides built-in HTTP proxy support for development and flexible CORS configuration for handling cross-origin requests. This enables seamless API integration during development and proper security headers configuration.

## Capabilities

### HTTP Proxy Configuration

Proxy API requests to a backend server during development.

```typescript { .api }
/**
 * Proxy configuration for the development server
 * Maps context paths to target servers
 */
type ProxyConfig = Record<string, string | ProxyOptions>;

/**
 * Proxy options extending http-proxy-3 ServerOptions
 */
interface ProxyOptions extends httpProxy.ServerOptions {
  /**
   * Rewrite the request path before proxying
   */
  rewrite?: (path: string) => string;

  /**
   * Configure the proxy server (e.g., listen to events)
   */
  configure?: (proxy: httpProxy.ProxyServer, options: ProxyOptions) => void;

  /**
   * Bypass function to skip proxying for certain requests
   * Return false to skip, string to serve different path, null/undefined to proxy
   */
  bypass?: (
    req: http.IncomingMessage,
    res: http.ServerResponse | undefined,
    options: ProxyOptions
  ) => void | null | undefined | false | string | Promise<void | null | undefined | boolean | string>;

  /**
   * Rewrite the Origin header of WebSocket requests to match target
   * WARNING: This can expose you to CSRF attacks
   */
  rewriteWsOrigin?: boolean;
}
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // String shorthand: /api -> http://localhost:4000/api
      '/api': 'http://localhost:4000',

      // With options
      '/api/v2': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v2/, '')
      },

      // Multiple targets
      '/auth': {
        target: 'http://auth.example.com',
        changeOrigin: true,
        secure: false, // Accept self-signed SSL certificates
      },

      // WebSocket proxying
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
});
```

### Simple Proxy Setup

Quick proxy configuration using string shorthand.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // Proxy all /api requests to backend
      '/api': 'http://localhost:3000',

      // Proxy with changeOrigin automatically enabled
      '/v1': 'http://api.example.com'
    }
  }
});

// Client code - requests are automatically proxied
fetch('/api/users');          // → http://localhost:3000/api/users
fetch('/v1/products');        // → http://api.example.com/v1/products
```

### Path Rewriting

Modify request paths before proxying to the target server.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // Remove /api prefix when proxying
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      // Replace version in path
      '/v1': {
        target: 'http://localhost:4000',
        rewrite: (path) => path.replace(/^\/v1/, '/api/v2')
      },

      // Complex rewriting
      '/legacy/(.*)': {
        target: 'http://legacy-api.com',
        rewrite: (path) => {
          // /legacy/users/123 → /api/v3/users/123
          return path.replace(/^\/legacy/, '/api/v3');
        }
      }
    }
  }
});

// Client requests:
// fetch('/api/users') → proxies to → http://localhost:4000/users
// fetch('/v1/items')  → proxies to → http://localhost:4000/api/v2/items
```

### Conditional Proxying

Use bypass function to conditionally proxy requests.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        bypass(req, res, options) {
          // Don't proxy requests from browser devtools
          const referer = req.headers.referer;
          if (referer?.includes('devtools')) {
            return false; // Don't proxy
          }

          // Serve mock data for specific endpoints
          if (req.url === '/api/mock') {
            return '/mock-data.json'; // Serve local file
          }

          // Proxy based on query parameter
          if (req.url?.includes('?local=true')) {
            return false; // Don't proxy
          }

          // Continue with proxying
          return null;
        }
      }
    }
  }
});
```

### WebSocket Proxying

Proxy WebSocket connections to a backend server.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // Proxy WebSocket connections
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true, // Enable WebSocket proxying
        changeOrigin: true
      },

      // WebSocket with origin rewriting (use with caution)
      '/ws': {
        target: 'wss://api.example.com',
        ws: true,
        rewriteWsOrigin: true, // Rewrite Origin header
        secure: false // For self-signed certs
      }
    }
  }
});

// Client code
const socket = new WebSocket('ws://localhost:5173/socket.io');
// Proxies to: ws://localhost:3000/socket.io
```

### Advanced Proxy Configuration

Configure proxy server with event listeners and custom behavior.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Listen to proxy events
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });

          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Modify request before sending to target
            console.log('Proxying request:', req.url);

            // Add custom headers
            proxyReq.setHeader('X-Custom-Header', 'value');

            // Add authentication token
            const token = getAuthToken();
            if (token) {
              proxyReq.setHeader('Authorization', `Bearer ${token}`);
            }
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Modify response from target
            console.log('Proxy response:', proxyRes.statusCode);

            // Add custom response headers
            proxyRes.headers['X-Proxy'] = 'vite';
          });
        }
      }
    }
  }
});
```

### CORS Configuration

Configure Cross-Origin Resource Sharing for the development server.

```typescript { .api }
/**
 * CORS configuration options
 */
interface CorsOptions {
  /**
   * Allowed origins
   * @default true (allow all origins)
   */
  origin?: CorsOrigin;

  /**
   * Allowed HTTP methods
   * @default ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
   */
  methods?: string | string[];

  /**
   * Allowed headers
   */
  allowedHeaders?: string | string[];

  /**
   * Exposed headers
   */
  exposedHeaders?: string | string[];

  /**
   * Credentials support
   * @default false
   */
  credentials?: boolean;

  /**
   * Max age for preflight cache
   */
  maxAge?: number;

  /**
   * Pass preflight request to next handler
   */
  preflightContinue?: boolean;

  /**
   * Status code for successful OPTIONS request
   * @default 204
   */
  optionsSuccessStatus?: number;
}

/**
 * CORS origin configuration
 */
type CorsOrigin =
  | boolean
  | string
  | RegExp
  | (string | RegExp)[]
  | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
```

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // Enable CORS for all origins
    cors: true,

    // Or with specific options
    cors: {
      origin: ['http://localhost:3000', 'https://app.example.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  }
});
```

### Dynamic CORS Origin

Use a function to dynamically determine allowed origins.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) {
          callback(null, true);
          return;
        }

        // Allow specific domains
        const allowedOrigins = [
          'http://localhost:3000',
          'https://app.example.com',
          /\.example\.com$/
        ];

        const allowed = allowedOrigins.some(pattern => {
          if (typeof pattern === 'string') {
            return origin === pattern;
          }
          return pattern.test(origin);
        });

        callback(null, allowed);
      },
      credentials: true
    }
  }
});
```

### Disable CORS

Disable CORS entirely (not recommended for production).

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // Disable CORS
    cors: false
  }
});
```

### Combine Proxy and CORS

Use proxy and CORS together for complex setups.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    // CORS for frontend origins
    cors: {
      origin: ['http://localhost:3000', 'https://app.example.com'],
      credentials: true
    },

    // Proxy for backend APIs
    proxy: {
      '/api': {
        target: 'http://backend.example.com',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Forward cookies to backend
            const cookies = req.headers.cookie;
            if (cookies) {
              proxyReq.setHeader('Cookie', cookies);
            }
          });
        }
      }
    }
  }
});
```

### Multiple Backend Proxies

Proxy different paths to different backend services.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      // User service
      '/api/users': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      // Product service
      '/api/products': {
        target: 'http://localhost:4002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      // Auth service
      '/api/auth': {
        target: 'http://localhost:4003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },

      // Default API fallback
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});
```

### Proxy with SSL/TLS

Handle HTTPS backends and self-signed certificates.

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://secure-backend.example.com',
        changeOrigin: true,
        secure: false, // Accept self-signed certificates

        // Or provide custom SSL options
        agent: new https.Agent({
          rejectUnauthorized: false, // Ignore SSL errors
          // Or provide custom CA
          ca: fs.readFileSync('./ca-cert.pem')
        })
      }
    }
  }
});
```

## Types

```typescript { .api }
/**
 * Proxy configuration type
 */
type ProxyConfig = Record<string, string | ProxyOptions>;

/**
 * Proxy options
 */
interface ProxyOptions extends httpProxy.ServerOptions {
  rewrite?: (path: string) => string;
  configure?: (proxy: httpProxy.ProxyServer, options: ProxyOptions) => void;
  bypass?: (
    req: http.IncomingMessage,
    res: http.ServerResponse | undefined,
    options: ProxyOptions
  ) => void | null | undefined | false | string | Promise<void | null | undefined | boolean | string>;
  rewriteWsOrigin?: boolean;
}

/**
 * CORS configuration options
 */
interface CorsOptions {
  origin?: CorsOrigin;
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

/**
 * CORS origin type
 */
type CorsOrigin =
  | boolean
  | string
  | RegExp
  | (string | RegExp)[]
  | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);

/**
 * Server options with proxy and CORS
 */
interface ServerOptions {
  proxy?: ProxyConfig;
  cors?: boolean | CorsOptions;
}
```
