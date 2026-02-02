# Environment Variables

Vite exposes environment variables through the special `import.meta.env` object and provides utilities for loading variables from `.env` files. Environment variables enable configuration across different deployment environments without code changes.

## Capabilities

### import.meta.env

Access environment variables in client-side code through the `import.meta.env` object.

```typescript { .api }
/**
 * Environment variables available in client-side code
 * Only variables prefixed with VITE_ are exposed to client code by default
 */
interface ImportMetaEnv {
  /**
   * Public base URL for the application
   * Corresponds to the 'base' config option
   */
  readonly BASE_URL: string;

  /**
   * Current mode: 'development', 'production', or custom mode
   */
  readonly MODE: string;

  /**
   * Whether the app is running in development mode
   */
  readonly DEV: boolean;

  /**
   * Whether the app is running in production mode
   */
  readonly PROD: boolean;

  /**
   * Whether the app is running on the server (SSR)
   */
  readonly SSR: boolean;

  /**
   * Custom environment variables (string-indexed)
   * Only variables with configured prefix (default: VITE_) are included
   */
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Usage Example:**

```typescript
// Access built-in environment variables
console.log(import.meta.env.MODE);      // 'development' or 'production'
console.log(import.meta.env.BASE_URL);  // '/' or configured base
console.log(import.meta.env.DEV);       // true in development
console.log(import.meta.env.PROD);      // true in production
console.log(import.meta.env.SSR);       // true when rendering on server

// Access custom environment variables (must be prefixed with VITE_)
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_APP_TITLE);

// Use in conditional logic
if (import.meta.env.DEV) {
  console.log('Debug mode enabled');
}

// Configure API endpoint based on environment
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### .env Files

Load environment variables from `.env` files in the project root.

**File Priority (highest to lowest):**
1. `.env.[mode].local` - Local mode-specific overrides (e.g., `.env.production.local`)
2. `.env.[mode]` - Mode-specific variables (e.g., `.env.production`)
3. `.env.local` - Local overrides (not committed to git)
4. `.env` - Default environment variables

```typescript { .api }
/**
 * Vite automatically loads .env files from the project root
 * Files are loaded in priority order, with later files overriding earlier ones
 */

// .env - Default variables for all modes
// VITE_APP_TITLE=My Application
// VITE_API_URL=https://api.example.com

// .env.local - Local overrides (ignored by git)
// VITE_API_URL=http://localhost:3000

// .env.production - Production-specific variables
// VITE_API_URL=https://api.production.com
// VITE_ENABLE_ANALYTICS=true

// .env.development - Development-specific variables
// VITE_API_URL=http://localhost:3000
// VITE_ENABLE_ANALYTICS=false
```

**Usage Example:**

Create `.env` files in project root:

```bash
# .env
VITE_APP_TITLE=My App
VITE_API_URL=https://api.example.com

# .env.local (git-ignored)
VITE_API_URL=http://localhost:3000
VITE_DEBUG_MODE=true

# .env.production
VITE_API_URL=https://api.production.com
VITE_ANALYTICS_ID=UA-12345678-1

# .env.development
VITE_API_URL=http://localhost:3000
VITE_ENABLE_MOCK_DATA=true
```

Access in code:
```typescript
// Values automatically loaded based on current mode
const apiUrl = import.meta.env.VITE_API_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;

// Development-only variable
if (import.meta.env.VITE_DEBUG_MODE) {
  enableDebugLogging();
}
```

### loadEnv Function

Programmatically load environment variables in configuration files or Node.js code.

```typescript { .api }
/**
 * Load environment variables from .env files
 * @param mode - The mode to load variables for (e.g., 'development', 'production')
 * @param envDir - Directory containing .env files (or false to disable)
 * @param prefixes - Prefix or array of prefixes for variables to include (default: 'VITE_')
 * @returns Record of environment variables matching the prefix(es)
 */
function loadEnv(
  mode: string,
  envDir: string | false,
  prefixes?: string | string[]
): Record<string, string>;
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Use env variables in config
    base: env.VITE_BASE_URL || '/',
    server: {
      port: parseInt(env.VITE_PORT || '3000')
    },
    define: {
      // Expose non-VITE_ prefixed variables manually
      __APP_VERSION__: JSON.stringify(env.APP_VERSION)
    }
  };
});

// Load only VITE_ prefixed variables (default)
const env = loadEnv('production', './config');
console.log(env.VITE_API_URL);

// Load all variables
const allEnv = loadEnv('production', './config', '');
console.log(allEnv.NODE_ENV);

// Load multiple prefixes
const multiEnv = loadEnv('production', './config', ['VITE_', 'APP_']);
```

### Environment Variable Prefixes

Configure which environment variables are exposed to client code.

```typescript { .api }
/**
 * Resolve environment variable prefix configuration
 * @param config - User configuration object
 * @returns Array of valid prefixes
 */
function resolveEnvPrefix(config: { envPrefix?: string | string[] }): string[];
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // Customize which variables are exposed to client
  envPrefix: 'APP_',  // Only expose APP_* variables

  // Or multiple prefixes
  envPrefix: ['VITE_', 'APP_', 'PUBLIC_']
});

// Now these variables are accessible in client code:
// - APP_API_URL
// - APP_TITLE
// - PUBLIC_KEY
// But these are NOT accessible (no matching prefix):
// - DATABASE_URL
// - SECRET_KEY
```

**Security Note:**
```typescript
// Invalid: empty string prefix exposes all variables (security risk)
export default defineConfig({
  envPrefix: ''  // ❌ Throws error - could expose sensitive variables
});

// Valid: specific prefixes only
export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_']  // ✓ Only exposes safe variables
});
```

### Environment Variable Expansion

Environment variables support expansion syntax for referencing other variables.

```bash
# .env
BASE_URL=https://api.example.com
VITE_API_URL=${BASE_URL}/v1
VITE_AUTH_URL=${BASE_URL}/auth
VITE_FULL_URL=${VITE_API_URL}/users
```

```typescript
// Expanded values:
console.log(import.meta.env.VITE_API_URL);
// Output: "https://api.example.com/v1"

console.log(import.meta.env.VITE_FULL_URL);
// Output: "https://api.example.com/v1/users"
```

### Mode-Specific Loading

Run Vite with different modes to load different environment files.

```bash
# Development mode (default)
vite
# Loads: .env, .env.local, .env.development, .env.development.local

# Production mode
vite build
# Loads: .env, .env.local, .env.production, .env.production.local

# Custom mode
vite --mode staging
# Loads: .env, .env.local, .env.staging, .env.staging.local

# Custom mode for build
vite build --mode staging
```

**Usage Example:**

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  console.log('Current mode:', mode);

  const env = loadEnv(mode, process.cwd());

  return {
    define: {
      __MODE__: JSON.stringify(mode)
    }
  };
});
```

### TypeScript IntelliSense

Add type definitions for custom environment variables.

```typescript { .api }
/**
 * Extend ImportMetaEnv interface for custom variables
 * Add to env.d.ts or vite-env.d.ts
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_SENTRY_DSN?: string;
}

/**
 * Extend ImportMeta interface
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Usage Example:**

```typescript
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_MAX_UPLOAD_SIZE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Now get full TypeScript support
const apiUrl: string = import.meta.env.VITE_API_URL; // ✓ Type-safe
const title: string = import.meta.env.VITE_APP_TITLE; // ✓ Auto-complete

// TypeScript will error on typos
const wrong = import.meta.env.VITE_API_ULR; // ❌ Property does not exist
```

### .env File Syntax

Environment files support standard dotenv syntax with Vite-specific features.

```bash
# Comments start with #
# This is a comment

# Simple key=value pairs
VITE_API_URL=https://api.example.com
VITE_PORT=3000

# Quotes are optional but recommended for values with spaces
VITE_APP_TITLE="My Application"
VITE_DESCRIPTION='A cool app'

# Multi-line values (not standard, use with caution)
VITE_LONG_TEXT="Line 1
Line 2
Line 3"

# Variable expansion
BASE_URL=https://example.com
VITE_API_URL=${BASE_URL}/api
VITE_CDN_URL=${BASE_URL}/cdn

# Empty values
VITE_OPTIONAL_FEATURE=

# Special characters (use quotes)
VITE_SPECIAL="value with spaces & special chars!"
```

### Server-Only Variables

Variables without the VITE_ prefix are only available in Node.js (server-side) code.

```bash
# .env
DATABASE_URL=postgres://localhost/mydb     # Server-only
SECRET_KEY=super-secret-key                 # Server-only
VITE_API_URL=https://api.example.com       # Client-accessible
```

```typescript
// vite.config.ts (Node.js environment)
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Server-only variables accessible here
  console.log(env.DATABASE_URL);  // ✓ Available
  console.log(env.SECRET_KEY);    // ✓ Available

  return {};
});

// Client-side code
console.log(import.meta.env.DATABASE_URL);  // ❌ undefined (not exposed)
console.log(import.meta.env.SECRET_KEY);    // ❌ undefined (not exposed)
console.log(import.meta.env.VITE_API_URL);  // ✓ Available (VITE_ prefix)
```

## Types

```typescript { .api }
/**
 * Environment variable interface
 */
interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  [key: string]: any;
}

/**
 * Load environment variables from .env files
 */
function loadEnv(
  mode: string,
  envDir: string | false,
  prefixes?: string | string[]
): Record<string, string>;

/**
 * Resolve environment variable prefix configuration
 */
function resolveEnvPrefix(config: {
  envPrefix?: string | string[];
}): string[];

/**
 * User configuration with environment options
 */
interface UserConfig {
  /**
   * Prefix for environment variables exposed to client
   * @default 'VITE_'
   */
  envPrefix?: string | string[];

  /**
   * Directory to load .env files from
   * Set to false to disable .env loading
   * @default root
   */
  envDir?: string;
}
```
