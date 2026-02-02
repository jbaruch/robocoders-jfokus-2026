# JSON File Imports

Vite provides native support for importing JSON files with automatic parsing, named exports, and tree-shaking capabilities. JSON imports are optimized for both development and production builds.

## Capabilities

### Default JSON Import

Import JSON files as JavaScript objects with automatic parsing.

```typescript { .api }
// Import entire JSON file as default export
import data from './config.json';
import package from './package.json';

// Type definition
declare module '*.json' {
  const value: any;
  export default value;
}
```

**Usage Example:**

```typescript
// config.json: { "apiUrl": "https://api.example.com", "timeout": 5000 }
import config from './config.json';

console.log(config.apiUrl); // "https://api.example.com"
console.log(config.timeout); // 5000

// Use in application
fetch(config.apiUrl, {
  timeout: config.timeout
});
```

### Named Exports from JSON

Import specific properties from JSON objects as named exports, enabling tree-shaking for production builds.

```typescript { .api }
// Import specific properties as named exports
import { version, name } from './package.json';
import { apiUrl, timeout } from './config.json';

// Named exports are generated for top-level properties
// when json.namedExports is enabled (default: true)
```

**Usage Example:**

```typescript
// package.json: { "name": "my-app", "version": "1.0.0", "author": "..." }
import { name, version } from './package.json';

console.log(name);    // "my-app"
console.log(version); // "1.0.0"

// Only imports what you need - unused properties are tree-shaken in production
// The "author" property is not included in the bundle
```

### Mixed Default and Named Exports

Combine default and named imports from the same JSON file.

```typescript { .api }
// Import both default and named exports
import config, { apiUrl } from './config.json';

// Default export contains full object
// Named exports provide direct access to properties
```

**Usage Example:**

```typescript
// config.json: { "apiUrl": "...", "timeout": 5000, "retries": 3 }
import config, { apiUrl, timeout } from './config.json';

// Use named import for specific value
fetch(apiUrl);

// Use default import for full config
console.log(config); // { apiUrl: "...", timeout: 5000, retries: 3 }
```

### JSON5 Support

Import JSON5 files with extended syntax support (comments, trailing commas, etc.).

```typescript { .api }
// JSON5 files are parsed and behave like regular JSON imports
import config from './config.json5';

// Type definition
declare module '*.json5' {
  const value: any;
  export default value;
}
```

**Usage Example:**

```typescript
// config.json5 with comments and trailing commas:
// {
//   "apiUrl": "https://api.example.com", // Production API
//   "timeout": 5000,
// }
import config from './config.json5';

console.log(config.apiUrl); // Works like regular JSON
```

### JSON URL Import

Import JSON as a URL instead of parsing it, useful for dynamic loading.

```typescript { .api }
// Use ?url query to get the JSON file URL instead of parsed content
import configUrl from './config.json?url';

// Returns: string (URL to JSON file)
```

**Usage Example:**

```typescript
import configUrl from './large-config.json?url';

// Fetch and parse JSON dynamically
const response = await fetch(configUrl);
const config = await response.json();

// Useful for:
// - Large JSON files that shouldn't be in the main bundle
// - JSON that needs to be fetched conditionally
// - Sharing JSON URLs with Web Workers
```

### JSON Performance Optimization

Vite automatically optimizes JSON imports based on file size.

**Small JSON Files (< 10kb):**
- Directly embedded as JavaScript objects
- No parsing overhead at runtime
- Best performance for frequently accessed data

**Large JSON Files (>= 10kb):**
- Stringified and parsed at runtime using `JSON.parse()`
- Reduces bundle size
- Slightly slower initial access but smaller payload

**Configuration:**

```typescript
// vite.config.ts
export default {
  json: {
    // Generate named exports for every property (default: true)
    namedExports: true,

    // Stringify mode: true, false, or 'auto'
    // 'auto' stringifies files > 10kb (default)
    stringify: 'auto'
  }
}
```

### Tree-Shaking with Named Exports

When using named exports, unused properties are automatically removed in production builds.

**Source JSON:**
```json
{
  "apiUrl": "https://api.example.com",
  "timeout": 5000,
  "retries": 3,
  "verbose": true,
  "debugMode": false
}
```

**Code:**
```typescript
// Only import what you need
import { apiUrl, timeout } from './config.json';

fetch(apiUrl, { timeout });
```

**Production Bundle:**
Only the `apiUrl` and `timeout` properties are included in the final bundle. The other properties (`retries`, `verbose`, `debugMode`) are removed during tree-shaking.

### Legal Identifier Constraints

Only JSON properties that are valid JavaScript identifiers can be exported as named exports.

```typescript { .api }
// Valid named exports (legal identifiers)
import { name, version, apiUrl } from './config.json';

// Invalid named exports (not legal identifiers) - use default import
// Properties like "api-url", "2fa-enabled", "my key" must be accessed via default
import config from './config.json';
console.log(config["api-url"]);
console.log(config["2fa-enabled"]);
```

**Example:**

```typescript
// config.json:
// {
//   "apiUrl": "...",        // Valid identifier ✓
//   "api-url": "...",       // Invalid (contains dash) ✗
//   "timeout": 5000,        // Valid identifier ✓
//   "2fa-enabled": true     // Invalid (starts with number) ✗
// }

// Named exports only work for valid identifiers
import { apiUrl, timeout } from './config.json'; // ✓

// For invalid identifiers, use default import
import config from './config.json';
console.log(config["api-url"]);      // ✓
console.log(config["2fa-enabled"]);  // ✓
```

### JSON Import Configuration

Configure JSON import behavior in `vite.config.ts`:

```typescript { .api }
interface JsonOptions {
  /**
   * Generate a named export for every property of the JSON object
   * @default true
   */
  namedExports?: boolean;

  /**
   * Generate performant output as JSON.parse("stringified").
   * When set to 'auto', data is stringified only if > 10kB.
   * @default 'auto'
   */
  stringify?: boolean | 'auto';
}
```

**Usage Example:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  json: {
    // Disable named exports (only default export)
    namedExports: false,

    // Always stringify (smaller bundle, runtime parsing cost)
    stringify: true
  }
});
```

## Types

```typescript { .api }
/**
 * Configuration options for JSON plugin
 */
interface JsonOptions {
  namedExports?: boolean;
  stringify?: boolean | 'auto';
}

/**
 * JSON import returns any type by default
 * Use type assertions or interfaces for type safety
 */
declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.json5' {
  const value: any;
  export default value;
}
```

### Type-Safe JSON Imports

For type-safe JSON imports, define interfaces:

```typescript
// types/config.d.ts
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

// app.ts
import config from './config.json';
// Type assertion for safety
const typedConfig = config as Config;

// Or use named imports with types
import type { Config } from './types/config';
import { apiUrl, timeout } from './config.json';
```
