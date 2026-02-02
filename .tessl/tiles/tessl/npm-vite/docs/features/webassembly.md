# WebAssembly Module Imports

Vite provides built-in support for importing WebAssembly modules with automatic initialization. WebAssembly files can be imported directly with a special query parameter that returns an initialization function.

## Capabilities

### WebAssembly Initialization Import

Import WebAssembly modules using the `?init` query suffix to get an initialization function.

```typescript { .api }
/**
 * Import WebAssembly module with initialization function
 * Returns a function that instantiates the WASM module
 * @param imports - Optional WebAssembly imports object
 * @returns Promise resolving to WebAssembly.Instance
 */
import initWasm from './module.wasm?init';

// Type definition
declare module '*.wasm?init' {
  const initWasm: (
    options?: WebAssembly.Imports
  ) => Promise<WebAssembly.Instance>;
  export default initWasm;
}
```

**Usage Example:**

```typescript
// Import WASM module
import initCalculator from './calculator.wasm?init';

// Initialize the module
const instance = await initCalculator();

// Access exported functions
const add = instance.exports.add as (a: number, b: number) => number;
const multiply = instance.exports.multiply as (a: number, b: number) => number;

// Use WASM functions
console.log(add(5, 3));       // 8
console.log(multiply(4, 7));  // 28
```

### WebAssembly with Imports

Pass import objects to the WebAssembly module during initialization.

```typescript { .api }
/**
 * Initialize WASM with custom imports
 * Imports provide JavaScript functions/objects to WASM code
 */
const instance = await initWasm({
  env: {
    // Functions WASM can call
  },
  js: {
    // Additional imports
  }
});
```

**Usage Example:**

```typescript
import initModule from './module.wasm?init';

// Define imports that WASM can use
const imports = {
  env: {
    // Memory import (if WASM expects it)
    memory: new WebAssembly.Memory({ initial: 10, maximum: 100 }),

    // JavaScript function WASM can call
    log: (value: number) => {
      console.log('WASM logged:', value);
    },

    // JavaScript function for printing strings
    print: (ptr: number, len: number) => {
      // Read string from WASM memory
      const memory = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer);
      const str = new TextDecoder().decode(memory.subarray(ptr, ptr + len));
      console.log(str);
    }
  },
  js: {
    // Custom JavaScript utilities
    getCurrentTime: () => Date.now()
  }
};

// Initialize with imports
const instance = await initModule(imports);

// Use exported functions
const result = instance.exports.calculate(42);
```

### Accessing WASM Memory

Access and manipulate WebAssembly linear memory.

**Usage Example:**

```typescript
import initWasm from './memory-module.wasm?init';

const instance = await initWasm();

// Get memory export
const memory = instance.exports.memory as WebAssembly.Memory;
const buffer = new Uint8Array(memory.buffer);

// Write data to WASM memory
const data = new TextEncoder().encode('Hello WASM');
const ptr = (instance.exports.allocate as Function)(data.length) as number;
buffer.set(data, ptr);

// Call WASM function that processes the data
(instance.exports.processString as Function)(ptr, data.length);

// Read result from WASM memory
const resultPtr = (instance.exports.getResult as Function)() as number;
const resultLen = (instance.exports.getResultLen as Function)() as number;
const result = new TextDecoder().decode(
  buffer.subarray(resultPtr, resultPtr + resultLen)
);

console.log(result);

// Free memory when done
(instance.exports.free as Function)(ptr);
```

### TypeScript Type Safety

Add type definitions for WebAssembly exports and imports.

```typescript
// wasm-types.ts
export interface CalculatorExports extends WebAssembly.Exports {
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
  multiply: (a: number, b: number) => number;
  divide: (a: number, b: number) => number;
  memory: WebAssembly.Memory;
}

export interface CalculatorImports extends WebAssembly.Imports {
  env: {
    log: (value: number) => void;
    abort: (msg: number, file: number, line: number, column: number) => void;
  };
}

// main.ts
import initCalculator from './calculator.wasm?init';
import type { CalculatorExports, CalculatorImports } from './wasm-types';

const imports: CalculatorImports = {
  env: {
    log: (value) => console.log('WASM:', value),
    abort: (msg, file, line, column) => {
      throw new Error(`WASM abort at ${file}:${line}:${column} - ${msg}`);
    }
  }
};

const instance = await initCalculator(imports);
const exports = instance.exports as CalculatorExports;

// Type-safe function calls
const sum = exports.add(10, 20);      // number
const diff = exports.subtract(30, 5); // number
```

### WebAssembly URL Import

Import WASM as a URL instead of initialization function (without `?init` query).

```typescript { .api }
/**
 * Import WebAssembly module as URL
 * Use when you want to manually instantiate the module
 */
import wasmUrl from './module.wasm';

// Type definition (without ?init)
declare module '*.wasm' {
  const src: string;
  export default src;
}
```

**Usage Example:**

```typescript
// Get WASM file URL
import wasmUrl from './calculator.wasm';

// Manually fetch and instantiate
const response = await fetch(wasmUrl);
const wasmBuffer = await response.arrayBuffer();

const imports = {
  env: {
    log: console.log
  }
};

const { instance } = await WebAssembly.instantiate(wasmBuffer, imports);

// Use exports
const add = instance.exports.add as (a: number, b: number) => number;
console.log(add(5, 3));

// Or use streaming instantiation for better performance
const { instance: streamInstance } = await WebAssembly.instantiateStreaming(
  fetch(wasmUrl),
  imports
);
```

### WebAssembly with Shared Memory

Use shared memory for communication between JavaScript and WASM.

**Usage Example:**

```typescript
import initModule from './threaded.wasm?init';

// Create shared memory
const memory = new WebAssembly.Memory({
  initial: 10,
  maximum: 100,
  shared: true  // Enable shared memory
});

// Initialize WASM with shared memory
const instance = await initModule({
  env: {
    memory
  }
});

// Both JavaScript and WASM can access the shared memory
const sharedArray = new Int32Array(memory.buffer);

// Write from JavaScript
sharedArray[0] = 42;

// WASM can read and modify the same location
(instance.exports.processSharedData as Function)();

// Read result from JavaScript
console.log(sharedArray[0]);
```

### WebAssembly SIMD

WebAssembly SIMD (Single Instruction, Multiple Data) for vectorized operations.

**Usage Example:**

```typescript
import initSimd from './simd-operations.wasm?init';

// Check SIMD support
const simdSupported = typeof WebAssembly.validate === 'function' &&
  WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));

if (!simdSupported) {
  console.warn('SIMD not supported, falling back to scalar operations');
}

const instance = await initSimd();

// Use SIMD-accelerated operations
const exports = instance.exports as {
  vectorAdd: (aPtr: number, bPtr: number, resultPtr: number, len: number) => void;
  memory: WebAssembly.Memory;
};

// Prepare data
const memory = new Float32Array(exports.memory.buffer);
const length = 1000;

// Vector A
for (let i = 0; i < length; i++) memory[i] = i;
// Vector B
for (let i = 0; i < length; i++) memory[length + i] = i * 2;

// SIMD vector addition (much faster than scalar)
exports.vectorAdd(0, length * 4, length * 2 * 4, length);

// Read results
const results = memory.slice(length * 2, length * 3);
```

### Error Handling

Handle WebAssembly initialization and runtime errors.

**Usage Example:**

```typescript
import initModule from './module.wasm?init';

try {
  const instance = await initModule({
    env: {
      abort: (msg: number, file: number, line: number, col: number) => {
        throw new Error(`WASM abort: ${msg} at ${file}:${line}:${col}`);
      }
    }
  });

  // Use instance
  const result = (instance.exports.compute as Function)(100);

} catch (error) {
  if (error instanceof WebAssembly.RuntimeError) {
    console.error('WASM Runtime Error:', error.message);
  } else if (error instanceof WebAssembly.CompileError) {
    console.error('WASM Compile Error:', error.message);
  } else if (error instanceof WebAssembly.LinkError) {
    console.error('WASM Link Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Performance Considerations

**Best Practices:**
- Use `?init` for convenient initialization
- Use streaming instantiation for large WASM files
- Reuse WASM instances when possible
- Pass typed arrays for bulk data transfer
- Use shared memory for worker communication
- Enable SIMD for vectorized operations

**Optimization Example:**

```typescript
import initWasm from './optimized.wasm?init';

// Initialize once, reuse multiple times
const instance = await initWasm();
const exports = instance.exports as {
  processData: (ptr: number, len: number) => number;
  memory: WebAssembly.Memory;
  allocate: (size: number) => number;
  free: (ptr: number) => void;
};

// Process multiple data sets efficiently
async function processMany(datasets: number[][]) {
  const memory = new Float32Array(exports.memory.buffer);

  for (const data of datasets) {
    // Allocate once
    const ptr = exports.allocate(data.length * 4);
    const offset = ptr / 4;

    // Write data
    memory.set(data, offset);

    // Process in WASM
    const result = exports.processData(ptr, data.length);

    console.log('Result:', result);

    // Free memory
    exports.free(ptr);
  }
}
```

### Build Configuration

Configure WebAssembly handling in Vite.

```typescript
// vite.config.ts
export default defineConfig({
  // WASM is handled automatically by default

  // Ensure WASM files are treated as assets
  assetsInclude: ['**/*.wasm'],

  // Optimize for production
  build: {
    // Ensure WASM files are copied to output
    copyPublicDir: true
  }
});
```

## Types

```typescript { .api }
/**
 * WebAssembly initialization function import
 */
declare module '*.wasm?init' {
  const initWasm: (
    options?: WebAssembly.Imports
  ) => Promise<WebAssembly.Instance>;
  export default initWasm;
}

/**
 * WebAssembly URL import (without ?init)
 */
declare module '*.wasm' {
  const src: string;
  export default src;
}

/**
 * WebAssembly Imports interface
 */
interface WebAssembly.Imports {
  [namespace: string]: {
    [name: string]: WebAssembly.ImportValue;
  };
}

/**
 * WebAssembly Import value types
 */
type WebAssembly.ImportValue =
  | Function
  | WebAssembly.Global
  | WebAssembly.Memory
  | WebAssembly.Table
  | number;

/**
 * WebAssembly Instance interface
 */
interface WebAssembly.Instance {
  readonly exports: WebAssembly.Exports;
}

/**
 * WebAssembly Exports interface (extend for your module)
 */
interface WebAssembly.Exports {
  [name: string]: WebAssembly.ExportValue;
}

/**
 * WebAssembly Export value types
 */
type WebAssembly.ExportValue =
  | Function
  | WebAssembly.Global
  | WebAssembly.Memory
  | WebAssembly.Table;

/**
 * WebAssembly Memory interface
 */
interface WebAssembly.Memory {
  readonly buffer: ArrayBuffer;
  grow(delta: number): number;
}
```
