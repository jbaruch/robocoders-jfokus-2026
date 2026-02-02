# Module Graph

Vite's module graph system tracks module dependencies, importers, and transformations for each environment. The module graph enables efficient Hot Module Replacement (HMR), incremental builds, and dependency analysis by maintaining a comprehensive map of all modules and their relationships.

## Capabilities

### EnvironmentModuleGraph

The environment-specific module graph tracks modules for a single build environment (client, SSR, or custom).

```typescript { .api }
import type { EnvironmentModuleGraph } from 'vite';

/**
 * Environment-specific module graph
 * Tracks all modules and their relationships within one environment
 */
class EnvironmentModuleGraph {
  /** The environment name this graph belongs to */
  environment: string;

  /** Map from module URL to module node */
  urlToModuleMap: Map<string, EnvironmentModuleNode>;

  /** Map from resolved module ID to module node */
  idToModuleMap: Map<string, EnvironmentModuleNode>;

  /** Map from file path to set of modules */
  fileToModulesMap: Map<string, Set<EnvironmentModuleNode>>;

  /**
   * Get module by its URL
   * @param rawUrl - The module URL (may include queries)
   * @returns Module node if found
   */
  getModuleByUrl(
    rawUrl: string
  ): Promise<EnvironmentModuleNode | undefined>;

  /**
   * Get module by its resolved ID
   * @param id - The resolved module ID
   * @returns Module node if found
   */
  getModuleById(id: string): EnvironmentModuleNode | undefined;

  /**
   * Get all modules associated with a file
   * @param file - The file path
   * @returns Set of module nodes for this file
   */
  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined;

  /**
   * Handle file change event
   * @param file - The changed file path
   */
  onFileChange(file: string): void;

  /**
   * Handle file deletion event
   * @param file - The deleted file path
   */
  onFileDelete(file: string): void;

  /**
   * Invalidate a module and its importers
   * @param mod - The module to invalidate
   * @param seen - Set of already invalidated modules
   * @param timestamp - Timestamp of invalidation
   * @param isHmr - Whether this is an HMR invalidation
   * @param softInvalidate - Whether to soft-invalidate (timestamp-only update)
   */
  invalidateModule(
    mod: EnvironmentModuleNode,
    seen?: Set<EnvironmentModuleNode>,
    timestamp?: number,
    isHmr?: boolean,
    softInvalidate?: boolean,
  ): void;

  /**
   * Invalidate all modules in the graph
   */
  invalidateAll(): void;
}
```

**Usage Example:**

```typescript
// In a plugin or dev server
const moduleGraph = environment.moduleGraph;

// Get a module by URL
const mod = await moduleGraph.getModuleByUrl('/src/App.jsx');
if (mod) {
  console.log('Module importers:', mod.importers.size);
  console.log('Module dependencies:', mod.importedModules.size);
}

// Invalidate a module
if (mod) {
  moduleGraph.invalidateModule(mod);
}

// Handle file change
moduleGraph.onFileChange('/src/utils.js');
```

### EnvironmentModuleNode

Individual module node containing metadata, dependencies, and transformation results.

```typescript { .api }
/**
 * Individual module node in the environment module graph
 */
class EnvironmentModuleNode {
  /** Environment name this module belongs to */
  environment: string;

  /** Public served URL path (starts with /) */
  url: string;

  /** Resolved file system path + query */
  id: string | null;

  /** Resolved file system path without query */
  file: string | null;

  /** Module type */
  type: 'js' | 'css' | 'asset';

  /** Rollup module info */
  info?: ModuleInfo;

  /** Custom metadata from plugins */
  meta?: Record<string, any>;

  /** Set of modules that import this module */
  importers: Set<EnvironmentModuleNode>;

  /** Set of modules imported by this module */
  importedModules: Set<EnvironmentModuleNode>;

  /** Set of modules this module accepts for HMR */
  acceptedHmrDeps: Set<EnvironmentModuleNode>;

  /** Specific exports accepted for HMR, or null for all */
  acceptedHmrExports: Set<string> | null;

  /** Map of imported bindings from dependencies */
  importedBindings: Map<string, Set<string>> | null;

  /** Whether this module accepts updates to itself */
  isSelfAccepting?: boolean;

  /** Transform result (code, map, etc.) */
  transformResult: TransformResult | null;

  /** Timestamp of last HMR update */
  lastHMRTimestamp: number;

  /** Timestamp of last invalidation */
  lastInvalidationTimestamp: number;

  /**
   * Invalidation state tracking
   * - undefined: not invalidated
   * - TransformResult: soft-invalidated (reuse transform, update timestamps)
   * - 'HARD_INVALIDATED': hard-invalidated (re-transform required)
   */
  invalidationState: TransformResult | 'HARD_INVALIDATED' | undefined;

  /** URLs that are statically imported */
  staticImportedUrls?: Set<string>;

  /**
   * Create a new module node
   * @param url - Module URL
   * @param environment - Environment name
   * @param setIsSelfAccepting - Whether to initialize isSelfAccepting
   */
  constructor(
    url: string,
    environment: string,
    setIsSelfAccepting?: boolean
  );
}
```

**Usage Example:**

```typescript
// Access module node properties
const mod = await moduleGraph.getModuleByUrl('/src/App.jsx');

if (mod) {
  // Check module type
  console.log('Type:', mod.type); // 'js' | 'css' | 'asset'

  // Traverse importers
  for (const importer of mod.importers) {
    console.log('Imported by:', importer.url);
  }

  // Traverse dependencies
  for (const dep of mod.importedModules) {
    console.log('Imports:', dep.url);
  }

  // Check HMR acceptance
  if (mod.isSelfAccepting) {
    console.log('Module accepts its own updates');
  }

  // Check specific export acceptance
  if (mod.acceptedHmrExports) {
    console.log('Accepts exports:', Array.from(mod.acceptedHmrExports));
  }

  // Access transform result
  if (mod.transformResult) {
    console.log('Transformed code length:', mod.transformResult.code.length);
  }
}
```

### Module Resolution

Resolve module URLs and track resolution results.

```typescript { .api }
/**
 * Resolved URL tuple
 * [url, resolvedId, meta]
 */
type ResolvedUrl = [
  url: string,
  resolvedId: string,
  meta: object | null | undefined,
];
```

### Legacy Module Graph (Backward Compatibility)

The mixed module graph provides backward compatibility with Vite's older API.

```typescript { .api }
/**
 * Legacy mixed module graph
 * @deprecated Use environment.moduleGraph instead
 */
class ModuleGraph {
  /** Get module by URL across all environments */
  getModuleByUrl(
    rawUrl: string
  ): Promise<ModuleNode | undefined>;

  /** Get module by ID across all environments */
  getModuleById(id: string): ModuleNode | undefined;

  /** Get modules by file across all environments */
  getModulesByFile(file: string): Set<ModuleNode> | undefined;

  /** Invalidate module across all environments */
  invalidateModule(
    mod: ModuleNode,
    seen?: Set<ModuleNode>,
    timestamp?: number,
    isHmr?: boolean,
  ): void;

  /** Invalidate all modules in all environments */
  invalidateAll(): void;
}

/**
 * Legacy module node
 * @deprecated Use EnvironmentModuleNode instead
 */
interface ModuleNode {
  url: string;
  id: string | null;
  file: string | null;
  type: 'js' | 'css';
  importers: Set<ModuleNode>;
  importedModules: Set<ModuleNode>;
  acceptedHmrDeps: Set<ModuleNode>;
  isSelfAccepting?: boolean;
  transformResult: TransformResult | null;
  lastHMRTimestamp: number;
}
```

### Dependency Analysis

Analyze module dependencies and import relationships.

**Finding Circular Dependencies:**

```typescript
function findCircularDeps(
  mod: EnvironmentModuleNode,
  chain: Set<EnvironmentModuleNode> = new Set()
): boolean {
  if (chain.has(mod)) {
    console.log('Circular dependency found!');
    return true;
  }

  chain.add(mod);

  for (const dep of mod.importedModules) {
    if (findCircularDeps(dep, new Set(chain))) {
      return true;
    }
  }

  return false;
}
```

**Finding All Importers:**

```typescript
function getAllImporters(
  mod: EnvironmentModuleNode,
  seen: Set<EnvironmentModuleNode> = new Set()
): Set<EnvironmentModuleNode> {
  if (seen.has(mod)) {
    return seen;
  }

  seen.add(mod);

  for (const importer of mod.importers) {
    getAllImporters(importer, seen);
  }

  return seen;
}
```

**Finding Entry Points:**

```typescript
function findEntryPoints(
  moduleGraph: EnvironmentModuleGraph
): EnvironmentModuleNode[] {
  const entries: EnvironmentModuleNode[] = [];

  for (const mod of moduleGraph.urlToModuleMap.values()) {
    // Entry points have no importers
    if (mod.importers.size === 0 && mod.importedModules.size > 0) {
      entries.push(mod);
    }
  }

  return entries;
}
```

### HMR Boundary Detection

Determine HMR propagation boundaries.

```typescript
function canAcceptUpdate(
  mod: EnvironmentModuleNode
): boolean {
  // Check if module accepts its own updates
  if (mod.isSelfAccepting) {
    return true;
  }

  // Check if any importer accepts this module
  for (const importer of mod.importers) {
    if (importer.acceptedHmrDeps.has(mod)) {
      return true;
    }
  }

  return false;
}

function findHMRBoundaries(
  mod: EnvironmentModuleNode,
  boundaries: Set<EnvironmentModuleNode> = new Set()
): Set<EnvironmentModuleNode> {
  if (mod.isSelfAccepting) {
    boundaries.add(mod);
    return boundaries;
  }

  for (const importer of mod.importers) {
    if (importer.acceptedHmrDeps.has(mod)) {
      boundaries.add(importer);
    } else {
      // Propagate up
      findHMRBoundaries(importer, boundaries);
    }
  }

  return boundaries;
}
```

## Types

### Transform Result

```typescript { .api }
/**
 * Transform result containing code and source map
 */
interface TransformResult {
  /** Transformed code */
  code: string;
  /** Source map */
  map: SourceMap | null;
  /** ETag for caching */
  etag?: string;
  /** Module dependencies */
  deps?: string[];
  /** Dynamic import dependencies */
  dynamicDeps?: string[];
}

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
```

### Module Info (from Rollup)

```typescript { .api }
/**
 * Rollup module info
 */
interface ModuleInfo {
  id: string;
  isEntry: boolean;
  isExternal: boolean;
  importedIds: string[];
  importedIdResolutions: Array<{
    id: string;
    external: boolean;
  }>;
  dynamicallyImportedIds: string[];
  importers: string[];
  code: string | null;
  ast: any | null;
  hasModuleSideEffects: boolean;
  meta: Record<string, any>;
}
```

### Invalidation States

```typescript { .api }
/**
 * Module invalidation state
 */
type InvalidationState =
  | undefined // Not invalidated
  | TransformResult // Soft-invalidated (reuse transform)
  | 'HARD_INVALIDATED'; // Hard-invalidated (re-transform)
```
