# Web Workers and Shared Workers

Vite provides built-in support for Web Workers and Shared Workers through special import syntax. Workers are automatically bundled and can be imported as constructors or URLs.

## Capabilities

### Web Worker Import

Import a script as a Web Worker constructor using the `?worker` query suffix.

```typescript { .api }
/**
 * Import a script as a Web Worker
 * Returns a constructor that creates a new Worker instance
 */
import WorkerConstructor from './worker.js?worker';

// Type definition
declare module '*?worker' {
  const workerConstructor: {
    new (options?: { name?: string }): Worker;
  };
  export default workerConstructor;
}
```

**Usage Example:**

```typescript
// worker.ts
self.onmessage = (e: MessageEvent) => {
  const result = e.data * 2;
  self.postMessage(result);
};

// main.ts
import MyWorker from './worker.ts?worker';

// Create worker instance
const worker = new MyWorker();

// Send message to worker
worker.postMessage(10);

// Receive message from worker
worker.onmessage = (e) => {
  console.log('Result from worker:', e.data); // 20
};

// Optional: name the worker for debugging
const namedWorker = new MyWorker({ name: 'calculation-worker' });
```

### Shared Worker Import

Import a script as a Shared Worker constructor using the `?sharedworker` query suffix.

```typescript { .api }
/**
 * Import a script as a Shared Worker
 * Returns a constructor that creates a new SharedWorker instance
 */
import SharedWorkerConstructor from './shared.js?sharedworker';

// Type definition
declare module '*?sharedworker' {
  const sharedWorkerConstructor: {
    new (options?: { name?: string }): SharedWorker;
  };
  export default sharedWorkerConstructor;
}
```

**Usage Example:**

```typescript
// shared-worker.ts
const connections: MessagePort[] = [];

self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = (event) => {
    // Broadcast to all connected ports
    connections.forEach(p => {
      if (p !== port) {
        p.postMessage(event.data);
      }
    });
  };

  port.start();
};

// main.ts
import MySharedWorker from './shared-worker.ts?sharedworker';

// Create shared worker instance
const sharedWorker = new MySharedWorker();

// Connect to shared worker
sharedWorker.port.start();

// Send messages
sharedWorker.port.postMessage('Hello from tab 1');

// Receive messages
sharedWorker.port.onmessage = (e) => {
  console.log('Message from shared worker:', e.data);
};
```

### Inline Worker Import

Import a worker as an inline blob URL using the `?worker&inline` query suffix.

```typescript { .api }
/**
 * Import a worker inlined as a blob URL
 * Worker code is embedded in the bundle as a base64 string
 */
import InlineWorker from './worker.js?worker&inline';

// Type definition
declare module '*?worker&inline' {
  const workerConstructor: {
    new (options?: { name?: string }): Worker;
  };
  export default workerConstructor;
}
```

**Usage Example:**

```typescript
// Import worker inlined in the bundle (no separate request)
import InlineWorker from './worker.ts?worker&inline';

// Worker code is embedded as a blob URL
const worker = new InlineWorker();

// Use exactly like regular worker
worker.postMessage({ command: 'start' });
worker.onmessage = (e) => {
  console.log(e.data);
};

// Useful for:
// - Small workers that don't warrant separate file
// - Avoiding additional HTTP requests
// - Ensuring worker code is available offline
```

### Worker URL Import

Import the worker script URL instead of the constructor using the `?worker&url` query suffix.

```typescript { .api }
/**
 * Import worker as a URL string instead of constructor
 * Useful for manually creating workers or passing to libraries
 */
import workerUrl from './worker.js?worker&url';

// Type definition
declare module '*?worker&url' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
// Get worker URL instead of constructor
import workerUrl from './worker.ts?worker&url';

// Create worker manually from URL
const worker = new Worker(workerUrl, { type: 'module' });

// Useful for:
// - Passing worker URL to third-party libraries
// - Custom worker initialization
// - Dynamic worker creation based on conditions

if (useSpecialWorker) {
  const worker = new Worker(workerUrl, {
    type: 'module',
    credentials: 'include',
    name: 'special-worker'
  });
}
```

### Shared Worker URL and Inline

Shared workers also support URL and inline variants.

```typescript { .api }
// Inline shared worker
import InlineSharedWorker from './shared.js?sharedworker&inline';

// Shared worker URL
import sharedWorkerUrl from './shared.js?sharedworker&url';

// Type definitions
declare module '*?sharedworker&inline' {
  const sharedWorkerConstructor: {
    new (options?: { name?: string }): SharedWorker;
  };
  export default sharedWorkerConstructor;
}

declare module '*?sharedworker&url' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
// Inline shared worker
import InlineShared from './shared.ts?sharedworker&inline';
const shared = new InlineShared();

// Shared worker URL
import sharedUrl from './shared.ts?sharedworker&url';
const sharedWorker = new SharedWorker(sharedUrl, { name: 'my-shared' });
```

### Worker with ES Modules

Workers imported via Vite automatically support ES modules (type: 'module').

```typescript
// worker.ts - can use ES module imports
import { calculate } from './utils';
import type { WorkerMessage } from './types';

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const result = calculate(e.data);
  self.postMessage(result);
};

// main.ts
import CalculationWorker from './worker.ts?worker';

const worker = new CalculationWorker();
// Worker automatically created with { type: 'module' }
```

### TypeScript Support in Workers

Workers can be written in TypeScript and will be transpiled automatically.

```typescript
// worker.ts
interface WorkerInput {
  operation: 'add' | 'multiply';
  a: number;
  b: number;
}

interface WorkerOutput {
  result: number;
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { operation, a, b } = e.data;
  let result: number;

  switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'multiply':
      result = a * b;
      break;
  }

  const output: WorkerOutput = { result };
  self.postMessage(output);
};

// main.ts
import CalculationWorker from './worker.ts?worker';

const worker = new CalculationWorker();

worker.postMessage({ operation: 'add', a: 5, b: 3 });

worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
  console.log(e.data.result); // 8
};
```

### Worker Dependencies

Workers can import other modules, and Vite will bundle them correctly.

```typescript
// utils.ts
export function processData(data: any[]) {
  return data.map(x => x * 2);
}

// worker.ts
import { processData } from './utils';

self.onmessage = (e) => {
  const result = processData(e.data);
  self.postMessage(result);
};

// main.ts
import DataWorker from './worker.ts?worker';

const worker = new DataWorker();
worker.postMessage([1, 2, 3, 4]);
worker.onmessage = (e) => {
  console.log(e.data); // [2, 4, 6, 8]
};
```

### Worker Hot Module Replacement

Worker modules support HMR in development mode.

```typescript
// worker.ts
import { algorithm } from './algorithm';

self.onmessage = (e) => {
  // Use algorithm
  const result = algorithm(e.data);
  self.postMessage(result);
};

// When algorithm.ts changes, worker code is automatically updated
// Worker instances are terminated and new instances must be created
// to use the updated code
```

### Worker Build Output

In production builds, workers are emitted as separate chunks with hashed filenames.

**Development:**
```
worker.ts?worker → Served as-is with HMR
```

**Production:**
```
worker.ts?worker → dist/assets/worker.abc123.js
```

**Configuration:**

```typescript
// vite.config.ts
export default defineConfig({
  worker: {
    // Worker bundling format
    format: 'es', // 'es' or 'iife'

    // Worker plugin configuration
    plugins: () => [
      // Plugins that should run on worker bundles
    ],

    // Rollup options for worker bundles
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name].[hash].js'
      }
    }
  }
});
```

### Worker Limitations

**What Works:**
- ES module imports/exports
- TypeScript transpilation
- Asset imports (with ?url or ?raw)
- Environment variables (import.meta.env)
- Source maps

**What Doesn't Work:**
- import.meta.hot (HMR API not available in workers)
- import.meta.glob (not supported in workers)
- CSS imports (use ?url to get URL, load manually)
- Plugins that rely on browser-specific features

### Worker Use Cases

**CPU-Intensive Operations:**
```typescript
// prime-worker.ts
self.onmessage = (e: MessageEvent<number>) => {
  const primes = findPrimes(e.data);
  self.postMessage(primes);
};

function findPrimes(max: number): number[] {
  const primes: number[] = [];
  for (let i = 2; i <= max; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}
```

**Background Data Processing:**
```typescript
// data-processor-worker.ts
import { transform, validate } from './data-utils';

self.onmessage = async (e: MessageEvent) => {
  const rawData = e.data;
  const validated = await validate(rawData);
  const transformed = transform(validated);
  self.postMessage(transformed);
};
```

**Shared State Management:**
```typescript
// state-shared-worker.ts
let sharedState = { count: 0 };
const connections: MessagePort[] = [];

self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = (event) => {
    if (event.data.type === 'increment') {
      sharedState.count++;
      // Broadcast to all tabs
      connections.forEach(p => {
        p.postMessage({ count: sharedState.count });
      });
    }
  };

  port.start();
};
```

## Types

```typescript { .api }
/**
 * Web Worker constructor import
 */
declare module '*?worker' {
  const workerConstructor: {
    new (options?: { name?: string }): Worker;
  };
  export default workerConstructor;
}

/**
 * Inline Web Worker import
 */
declare module '*?worker&inline' {
  const workerConstructor: {
    new (options?: { name?: string }): Worker;
  };
  export default workerConstructor;
}

/**
 * Web Worker URL import
 */
declare module '*?worker&url' {
  const src: string;
  export default src;
}

/**
 * Shared Worker constructor import
 */
declare module '*?sharedworker' {
  const sharedWorkerConstructor: {
    new (options?: { name?: string }): SharedWorker;
  };
  export default sharedWorkerConstructor;
}

/**
 * Inline Shared Worker import
 */
declare module '*?sharedworker&inline' {
  const sharedWorkerConstructor: {
    new (options?: { name?: string }): SharedWorker;
  };
  export default sharedWorkerConstructor;
}

/**
 * Shared Worker URL import
 */
declare module '*?sharedworker&url' {
  const src: string;
  export default src;
}

/**
 * Worker configuration options
 */
interface WorkerOptions {
  /**
   * Worker bundling format
   * @default 'es'
   */
  format?: 'es' | 'iife';

  /**
   * Plugins to apply to worker bundles
   */
  plugins?: () => Plugin[];

  /**
   * Rollup options for worker bundles
   */
  rollupOptions?: RollupOptions;
}

/**
 * Resolved worker options
 */
interface ResolvedWorkerOptions extends WorkerOptions {
  format: 'es' | 'iife';
  plugins: Plugin[];
  rollupOptions: RollupOptions;
}
```
