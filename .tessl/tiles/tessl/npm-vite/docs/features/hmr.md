# Server-Side HMR System

Vite's server-side Hot Module Replacement (HMR) system provides WebSocket-based communication between the dev server and clients, enabling lightning-fast module updates without full page reloads. The HMR system includes hot channels for broadcasting updates, context objects for plugin hooks, and payload types for different update scenarios.

## Capabilities

### HMR Context

The context object passed to plugin `hotUpdate` and `handleHotUpdate` hooks, providing access to the changed file and affected modules.

```typescript { .api }
/**
 * Context object passed to HMR plugin hooks
 */
interface HmrContext {
  /** The file that changed */
  file: string;
  /** Timestamp of the change */
  timestamp: number;
  /** Affected module nodes (legacy mixed module graph) */
  modules: Array<ModuleNode>;
  /** Function to read the changed file content */
  read: () => string | Promise<string>;
  /** The dev server instance */
  server: ViteDevServer;
}

/**
 * Hot update options passed to environment-specific hotUpdate hooks
 */
interface HotUpdateOptions {
  /** Type of file system change */
  type: 'create' | 'update' | 'delete';
  /** The file that changed */
  file: string;
  /** Timestamp of the change */
  timestamp: number;
  /** Affected environment module nodes */
  modules: Array<EnvironmentModuleNode>;
  /** Function to read the changed file content */
  read: () => string | Promise<string>;
  /** The dev server instance */
  server: ViteDevServer;
}
```

### Server Hot Channel

Create and manage server-side hot channels for broadcasting HMR updates to connected clients.

```typescript { .api }
import { createServerHotChannel } from 'vite';

/**
 * Create a server hot channel for HMR communication
 * @returns ServerHotChannel instance for broadcasting updates
 */
function createServerHotChannel(): ServerHotChannel;

/**
 * Server-side hot channel interface
 */
interface ServerHotChannel {
  /** Broadcast a payload to all connected clients */
  send(payload: HotPayload): void;
  /** Listen for custom events from clients */
  on<T extends string>(event: T, listener: HotChannelListener<T>): void;
  /** Listen for client connections */
  on(event: 'connection', listener: () => void): void;
  /** Remove event listener */
  off(event: string, listener: Function): void;
  /** Start listening for messages */
  listen(): void;
  /** Close all connections */
  close(): Promise<unknown> | void;
}

/**
 * Client connection interface
 */
interface HotChannelClient {
  /** Send a payload to this specific client */
  send(payload: HotPayload): void;
}

/**
 * Listener function for hot channel events
 * @param data - Event data from the client
 * @param client - The client that sent the event
 */
type HotChannelListener<T extends string = string> = (
  data: InferCustomEventPayload<T>,
  client: HotChannelClient,
) => void;
```

**Usage Example:**

```typescript
import { createServerHotChannel } from 'vite';

// Create a custom hot channel
const hotChannel = createServerHotChannel();

// Listen for custom events from clients
hotChannel.on('my-custom-event', (data, client) => {
  console.log('Received custom event:', data);

  // Send response back to the client
  client.send({
    type: 'custom',
    event: 'my-response',
    data: { processed: true }
  });
});

// Broadcast an update to all clients
hotChannel.send({
  type: 'update',
  updates: [{
    type: 'js-update',
    path: '/src/App.jsx',
    acceptedPath: '/src/App.jsx',
    timestamp: Date.now()
  }]
});
```

### Normalized Hot Channel

The normalized hot channel provides a consistent interface with enhanced type safety and convenience methods.

```typescript { .api }
/**
 * Normalized server hot channel with enhanced functionality
 */
interface NormalizedHotChannel<Api = any> {
  /** Broadcast events to all clients */
  send(payload: HotPayload): void;
  /** Send custom event with string event name */
  send<T extends string>(event: T, payload?: InferCustomEventPayload<T>): void;
  /** Handle custom events from clients */
  on<T extends string>(
    event: T,
    listener: (
      data: InferCustomEventPayload<T>,
      client: NormalizedHotChannelClient,
    ) => void,
  ): void;
  /** @deprecated use 'vite:client:connect' event instead */
  on(event: 'connection', listener: () => void): void;
  /** Unregister event listener */
  off(event: string, listener: Function): void;
  /** Start listening for messages */
  listen(): void;
  /** Disconnect all clients */
  close(): Promise<unknown> | void;
  /** Optional API object for custom functionality */
  api?: Api;
}

/**
 * Normalized client interface with overloaded send method
 */
interface NormalizedHotChannelClient {
  /** Send HMR payload to the client */
  send(payload: HotPayload): void;
  /** Send custom event to the client */
  send(event: string, payload?: CustomPayload['data']): void;
}

/**
 * Normalize a hot channel to provide consistent interface
 * @param channel - The hot channel to normalize
 * @param enableHmr - Whether HMR is enabled
 * @param normalizeClient - Whether to normalize client objects
 * @returns Normalized hot channel instance
 */
function normalizeHotChannel(
  channel: HotChannel,
  enableHmr: boolean,
  normalizeClient?: boolean,
): NormalizedHotChannel;
```

### HMR Options

Configuration options for the HMR system.

```typescript { .api }
/**
 * HMR configuration options
 */
interface HmrOptions {
  /** Protocol to use (ws or wss) */
  protocol?: string;
  /** Host for HMR WebSocket server */
  host?: string;
  /** Port for HMR WebSocket server */
  port?: number;
  /** Client-side port (may differ from server port in proxy scenarios) */
  clientPort?: number;
  /** WebSocket path */
  path?: string;
  /** Timeout for HMR updates in milliseconds */
  timeout?: number;
  /** Show error overlay in browser */
  overlay?: boolean;
  /** HTTP server to attach WebSocket to */
  server?: HttpServer;
}
```

### Hot Update Handler

Main function for handling file changes and triggering HMR updates.

```typescript { .api }
/**
 * Handle HMR updates when files change
 * @param type - Type of file system change
 * @param file - Path to the changed file
 * @param server - Dev server instance
 * @internal
 */
function handleHMRUpdate(
  type: 'create' | 'delete' | 'update',
  file: string,
  server: ViteDevServer,
): Promise<void>;

/**
 * Get short name for file relative to root
 * @param file - Full file path
 * @param root - Project root path
 * @returns Relative path or original path if not under root
 */
function getShortName(file: string, root: string): string;

/**
 * Get plugins sorted by their hotUpdate hook order
 * @param plugins - Array of plugins
 * @returns Sorted plugins array
 * @internal
 */
function getSortedPluginsByHotUpdateHook(
  plugins: readonly Plugin[],
): Plugin[];
```

## Types

### HMR Payload Types

All HMR payloads sent between server and client:

```typescript { .api }
/**
 * Union of all possible HMR payload types
 */
type HotPayload =
  | ConnectedPayload
  | UpdatePayload
  | FullReloadPayload
  | CustomPayload
  | ErrorPayload
  | PrunePayload;

/**
 * Sent when client connects to the server
 */
interface ConnectedPayload {
  type: 'connected';
}

/**
 * Module update payload with list of updates to apply
 */
interface UpdatePayload {
  type: 'update';
  updates: Update[];
}

/**
 * Single module update
 */
interface Update {
  /** Type of module update */
  type: 'js-update' | 'css-update';
  /** Path to the updated module */
  path: string;
  /** Path to the module that accepted the update */
  acceptedPath: string;
  /** Timestamp of the update */
  timestamp: number;
  /** Exported names that changed (for partial HMR) */
  explicitImportRequired?: boolean;
}

/**
 * Trigger full page reload
 */
interface FullReloadPayload {
  type: 'full-reload';
  /** Optional path that triggered the reload */
  path?: string;
  /** Whether to trigger a hard reload */
  triggeredBy?: string;
}

/**
 * Custom event payload for plugin communication
 */
interface CustomPayload {
  type: 'custom';
  /** Custom event name */
  event: string;
  /** Custom event data */
  data?: any;
}

/**
 * Error occurred during HMR
 */
interface ErrorPayload {
  type: 'error';
  /** Error information */
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
 * Prune modules that are no longer imported
 */
interface PrunePayload {
  type: 'prune';
  /** Paths to modules that should be pruned */
  paths: string[];
}

/**
 * Infer custom event payload type from event name
 */
type InferCustomEventPayload<T extends string> =
  T extends keyof CustomEventMap ? CustomEventMap[T] : any;

/**
 * Custom event map for type-safe custom events
 * Can be augmented by plugins
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
 * Invalidate module payload
 */
interface InvalidatePayload {
  path: string;
  message?: string;
}
```

### Generic Hot Channel

Generic hot channel interface that can be customized:

```typescript { .api }
/**
 * Generic hot channel interface
 * Can be implemented by custom transport mechanisms
 */
interface HotChannel<Api = any> {
  /** Broadcast events to all clients */
  send?(payload: HotPayload): void;
  /** Handle custom events from clients */
  on?<T extends string>(event: T, listener: HotChannelListener<T>): void;
  /** Handle connection events */
  on?(event: 'connection', listener: () => void): void;
  /** Unregister event listener */
  off?(event: string, listener: Function): void;
  /** Start listening for messages */
  listen?(): void;
  /** Close all connections */
  close?(): Promise<unknown> | void;
  /** Optional API object */
  api?: Api;
}
```

### Module Node Types

Module node types used in HMR context (see [Module Graph](./module-graph.md) for complete documentation):

```typescript { .api }
/**
 * Environment-specific module node
 */
interface EnvironmentModuleNode {
  url: string;
  id: string | null;
  file: string | null;
  importers: Set<EnvironmentModuleNode>;
  importedModules: Set<EnvironmentModuleNode>;
  transformResult: TransformResult | null;
  lastHMRTimestamp: number;
  isSelfAccepting?: boolean;
}

/**
 * Legacy mixed module node (backward compatibility)
 */
interface ModuleNode {
  url: string;
  id: string | null;
  file: string | null;
  importers: Set<ModuleNode>;
  importedModules: Set<ModuleNode>;
}
```
