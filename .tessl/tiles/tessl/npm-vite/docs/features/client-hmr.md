# Client-Side HMR API

The client-side Hot Module Replacement API is accessed via `import.meta.hot` in browser code, enabling modules to accept hot updates, handle disposal, and communicate with the server. This API allows fine-grained control over how modules respond to changes during development.

## Capabilities

### import.meta.hot

The main HMR API object available in client-side code during development.

```typescript { .api }
/**
 * Client-side HMR context available at import.meta.hot
 * Only available in development mode
 */
interface ViteHotContext {
  /** Persistent data object that survives hot updates */
  readonly data: any;

  /** Accept hot updates for this module */
  accept(): void;
  /** Accept hot updates with callback */
  accept(cb: (mod: ModuleNamespace | undefined) => void): void;
  /** Accept hot updates for a dependency */
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void;
  /** Accept hot updates for multiple dependencies */
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void;

  /** Accept hot updates for specific exports only */
  acceptExports(
    exportNames: string | readonly string[],
    cb?: (mod: ModuleNamespace | undefined) => void,
  ): void;

  /** Register cleanup callback before module is replaced */
  dispose(cb: (data: any) => void): void;

  /** Register cleanup callback when module is removed */
  prune(cb: (data: any) => void): void;

  /** Invalidate this module and trigger full reload */
  invalidate(message?: string): void;

  /** Listen to custom HMR events */
  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void;

  /** Remove HMR event listener */
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void;

  /** Send custom event to server */
  send<T extends string>(
    event: T,
    data?: InferCustomEventPayload<T>,
  ): void;
}

/**
 * Module namespace object
 */
type ModuleNamespace = Record<string, any> & {
  [Symbol.toStringTag]: 'Module';
};
```

**Basic Usage:**

```typescript
// Check if HMR is available
if (import.meta.hot) {
  // Accept updates for this module
  import.meta.hot.accept();
}
```

### Accept Hot Updates

Accept hot updates for the current module or its dependencies.

**Self-Accepting Module:**

```typescript
// Accept updates for this module
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Optional callback when module is updated
    if (newModule) {
      // Re-apply side effects with new module
      newModule.initialize();
    }
  });
}
```

**Accepting Dependencies:**

```typescript
// Accept updates for a single dependency
if (import.meta.hot) {
  import.meta.hot.accept('./dependency.js', (newDep) => {
    // Handle the updated dependency
    console.log('Dependency updated:', newDep);
  });
}

// Accept updates for multiple dependencies
if (import.meta.hot) {
  import.meta.hot.accept(
    ['./dep1.js', './dep2.js'],
    ([newDep1, newDep2]) => {
      // Handle multiple updated dependencies
      console.log('Dependencies updated');
    }
  );
}
```

### Accept Specific Exports

Accept hot updates only when specific exports change, enabling more granular HMR.

```typescript
if (import.meta.hot) {
  // Only trigger HMR when 'count' export changes
  import.meta.hot.acceptExports('count', (newModule) => {
    // Update only when count export changes
    console.log('Count updated:', newModule.count);
  });

  // Accept multiple exports
  import.meta.hot.acceptExports(['count', 'name'], (newModule) => {
    console.log('Exports updated');
  });
}
```

### Persistent Data

Store data that persists across hot updates using `import.meta.hot.data`.

```typescript
// Store state before update
if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // Save current state
    data.count = count;
    data.timestamp = Date.now();
  });

  // Restore state after update
  if (import.meta.hot.data.count !== undefined) {
    count = import.meta.hot.data.count;
    console.log('Restored count:', count);
  }
}
```

### Dispose Callback

Register cleanup logic to run before the module is replaced.

```typescript
if (import.meta.hot) {
  // Setup
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);

  // Cleanup before module replacement
  import.meta.hot.dispose((data) => {
    clearInterval(timer);

    // Optionally save state for next version
    data.savedState = getCurrentState();
  });
}
```

**Framework Integration Example:**

```typescript
// React component with HMR
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

if (import.meta.hot) {
  import.meta.hot.accept('./App', (newApp) => {
    // Re-render with new component
    root.render(<newApp.default />);
  });

  import.meta.hot.dispose(() => {
    // Cleanup before update
    root.unmount();
  });
}
```

### Prune Callback

Register cleanup logic for when the module is no longer imported anywhere.

```typescript
if (import.meta.hot) {
  import.meta.hot.prune((data) => {
    // Module is being removed completely
    console.log('Module no longer used, cleaning up...');

    // Clean up global state, event listeners, etc.
    window.removeEventListener('resize', handleResize);
  });
}
```

### Invalidate Module

Manually invalidate the module and force a full page reload.

```typescript
if (import.meta.hot) {
  // Check some condition
  if (someUnrecoverableError) {
    import.meta.hot.invalidate(
      'Critical error occurred, full reload required'
    );
  }
}
```

**Use Case Example:**

```typescript
// Invalidate when environment changes
const currentEnv = import.meta.env.MODE;

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (import.meta.env.MODE !== currentEnv) {
      // Environment changed, need full reload
      import.meta.hot.invalidate(
        'Environment mode changed'
      );
    }
  });
}
```

### Custom Events

Listen to and send custom HMR events for plugin communication.

**Built-in Events:**

```typescript
if (import.meta.hot) {
  // Before HMR update is applied
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('About to update:', payload);
  });

  // After HMR update is applied
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('Update complete:', payload);
  });

  // Before full page reload
  import.meta.hot.on('vite:beforeFullReload', (payload) => {
    console.log('About to reload:', payload);
  });

  // When error occurs
  import.meta.hot.on('vite:error', (payload) => {
    console.error('HMR error:', payload);
  });

  // WebSocket connection established
  import.meta.hot.on('vite:ws:connect', () => {
    console.log('Connected to HMR server');
  });

  // WebSocket disconnected
  import.meta.hot.on('vite:ws:disconnect', () => {
    console.log('Disconnected from HMR server');
  });
}
```

**Custom Events:**

```typescript
if (import.meta.hot) {
  // Listen for custom event from server
  import.meta.hot.on('my-plugin:update', (data) => {
    console.log('Custom event:', data);
  });

  // Send custom event to server
  import.meta.hot.send('my-plugin:action', {
    action: 'refresh',
    timestamp: Date.now()
  });

  // Remove event listener
  const handler = (data) => console.log(data);
  import.meta.hot.on('my-event', handler);
  // Later...
  import.meta.hot.off('my-event', handler);
}
```

### Advanced Patterns

**Conditional HMR:**

```typescript
if (import.meta.hot) {
  let hmrEnabled = true;

  import.meta.hot.accept((newModule) => {
    if (!hmrEnabled) {
      import.meta.hot.invalidate('HMR disabled');
      return;
    }

    // Apply update
    applyUpdate(newModule);
  });

  // Export function to disable HMR
  window.disableHMR = () => {
    hmrEnabled = false;
  };
}
```

**Cascading Updates:**

```typescript
// In a parent component
if (import.meta.hot) {
  import.meta.hot.accept(['./Child1.jsx', './Child2.jsx'],
    ([newChild1, newChild2]) => {
      // Update child components
      updateChild1(newChild1);
      updateChild2(newChild2);

      // Trigger re-render
      forceUpdate();
    }
  );
}
```

**State Preservation:**

```typescript
// Store manager state across HMR
let store = createStore();

if (import.meta.hot) {
  if (import.meta.hot.data.store) {
    // Restore previous store state
    store = import.meta.hot.data.store;
  }

  import.meta.hot.accept();

  import.meta.hot.dispose((data) => {
    // Preserve store for next update
    data.store = store;
  });
}

export { store };
```

## Types

### Custom Event Types

Type-safe custom event definitions:

```typescript { .api }
/**
 * Infer custom event payload type from event name
 */
type InferCustomEventPayload<T extends string> =
  T extends keyof CustomEventMap ? CustomEventMap[T] : any;

/**
 * Custom event map for type-safe events
 * Extend this interface to add your own custom events
 */
interface CustomEventMap {
  'vite:beforeUpdate': UpdatePayload;
  'vite:afterUpdate': UpdatePayload;
  'vite:beforePrune': PrunePayload;
  'vite:beforeFullReload': FullReloadPayload;
  'vite:error': ErrorPayload;
  'vite:invalidate': InvalidatePayload;
  'vite:ws:connect': ConnectedPayload;
  'vite:ws:disconnect': never;
}

/**
 * Update payload
 */
interface UpdatePayload {
  type: 'update';
  updates: Array<{
    type: 'js-update' | 'css-update';
    path: string;
    acceptedPath: string;
    timestamp: number;
  }>;
}

/**
 * Full reload payload
 */
interface FullReloadPayload {
  type: 'full-reload';
  path?: string;
  triggeredBy?: string;
}

/**
 * Error payload
 */
interface ErrorPayload {
  type: 'error';
  err: {
    message: string;
    stack: string;
    id?: string;
    frame?: string;
    plugin?: string;
    pluginCode?: string;
    loc?: {
      file?: string;
      line: number;
      column: number;
    };
  };
}

/**
 * Prune payload
 */
interface PrunePayload {
  type: 'prune';
  paths: string[];
}

/**
 * Connected payload
 */
interface ConnectedPayload {
  type: 'connected';
}

/**
 * Invalidate payload
 */
interface InvalidatePayload {
  path: string;
  message?: string;
}
```

### Augmenting Custom Events

Extend the custom event map for type safety:

```typescript
// In your plugin or app code
declare module 'vite/types/customEvent' {
  interface CustomEventMap {
    'my-plugin:refresh': { timestamp: number };
    'my-plugin:error': { message: string; code: number };
  }
}

// Now these are type-safe
if (import.meta.hot) {
  import.meta.hot.on('my-plugin:refresh', (payload) => {
    // payload is typed as { timestamp: number }
    console.log(payload.timestamp);
  });

  import.meta.hot.send('my-plugin:refresh', {
    timestamp: Date.now()
  });
}
```
