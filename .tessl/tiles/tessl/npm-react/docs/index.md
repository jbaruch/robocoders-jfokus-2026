# React

React is a JavaScript library for building user interfaces through a declarative, component-based approach.

## Package Info

- **Installation**: `npm install react`
- **Version**: 19.2.0
- **Documentation**: https://react.dev/
- **License**: MIT
- **Package Type**: npm
- **Language**: JavaScript (TypeScript types via @types/react)

### Entry Points

- `react` - Core React functionality for client-side rendering
- `react/jsx-runtime` - JSX transformation (automatically used by compilers)
- `react/jsx-dev-runtime` - Development-mode JSX (includes additional debugging info)
- `react/compiler-runtime` - React Compiler optimization runtime
- `react.react-server.js` - Server-only APIs for React Server Components

Most apps only import from `react`. JSX runtimes are automatically used by Babel/TypeScript compilers.

## Core Imports

ESM:
```javascript
import { useState, useEffect, useContext, useRef } from 'react';
import { Component, PureComponent, memo, lazy, Suspense } from 'react';
```

CommonJS:
```javascript
const { useState, useEffect } = require('react');
const React = require('react');
```

## Quick Start

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </>
  );
}

// State updates are batched automatically (React 18+)
// Multiple setState calls in event handlers only trigger one re-render
```

## Core Concepts

- **Components**: Function or class components for building UI
- **Hooks**: Functions to use state, effects, and lifecycle features in function components
- **Elements**: Lightweight descriptions of what to render
- **Context**: Avoid prop drilling by passing data through the component tree
- **Suspense**: Declarative loading states for async operations
- **Renderers**: Platform-specific engines (react-dom, react-native)

React is renderer-agnostic and must be paired with a renderer (like `react-dom`) to display UI.

---

## State Hooks

### useState
```javascript { .api }
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
```

Basic state management:
```javascript
const [state, setState] = useState(initialValue);
setState(newValue);              // Direct update
setState(prev => prev + 1);      // Functional update (use when new state depends on old)
const [state] = useState(() => expensiveInit());  // Lazy init (function runs only once)

// Common mistake: using state immediately after setState
setState(count + 1);
console.log(count);  // ❌ Still shows old value (setState is async)
// Use useEffect with [count] to react to changes
```

### useReducer
```javascript { .api }
function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: S,
  init?: (initialArg: S) => S
): [S, Dispatch<A>];
```

Complex state with reducer:
```javascript
const [state, dispatch] = useReducer(reducer, initialValue);
dispatch({ type: 'increment' });
```

### useRef
```javascript { .api }
function useRef<T>(initialValue: T): { current: T };
```

Mutable refs that persist:
```javascript
const ref = useRef(null);  // DOM access
const timerRef = useRef(null);  // Storing timers
```

[Detailed State Hooks](./hooks-state.md)

---

## Effect Hooks

### useEffect
```javascript { .api }
function useEffect(effect: () => (void | (() => void)), deps?: ReadonlyArray<any>): void;
```

Side effects after render:
```javascript
useEffect(() => {
  // Effect runs after render
  return () => cleanup();  // Cleanup function
}, [deps]);  // Run when deps change

// Note: In StrictMode (dev), effects run twice to help find bugs
```

Common patterns:
```javascript
// Data fetching with abort
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });
  return () => controller.abort();  // Cancel on cleanup
}, [url]);

// Subscriptions
useEffect(() => {
  const sub = api.subscribe(onUpdate);
  return () => sub.unsubscribe();
}, []);

// Event listeners
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// ⚠️ Infinite loop trap
useEffect(() => {
  setData([...data, item]);  // ❌ data in deps causes infinite loop
}, [data]);  // Use functional update or useReducer instead
```

### useLayoutEffect
```javascript { .api }
function useLayoutEffect(effect: () => (void | (() => void)), deps?: ReadonlyArray<any>): void;
```

Synchronous effects before paint (for DOM measurements):
```javascript
useLayoutEffect(() => {
  const height = ref.current.getBoundingClientRect().height;
  setHeight(height);
}, []);
```

### useInsertionEffect
```javascript { .api }
function useInsertionEffect(effect: () => (void | (() => void)), deps?: ReadonlyArray<any>): void;
```

Runs before all DOM mutations (for CSS-in-JS):
```javascript
useInsertionEffect(() => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  return () => style.remove();
}, [css]);
```

[Detailed Effect Hooks](./hooks-effects.md)

---

## Performance Hooks

### useMemo
```javascript { .api }
function useMemo<T>(factory: () => T, deps: ReadonlyArray<any>): T;
```

Memoizes expensive computations:
```javascript
const filtered = useMemo(() =>
  items.filter(item => item.name.includes(filter)),
  [items, filter]
);

// ⚠️ Only use for expensive operations - premature optimization adds overhead
// Profile first, then optimize
```

### useCallback
```javascript { .api }
function useCallback<T>(callback: T, deps: ReadonlyArray<any>): T;
```

Stable function references:
```javascript
const handleClick = useCallback(() => doSomething(id), [id]);
// Prevents child re-renders when passed as prop
```

### useDeferredValue
```javascript { .api }
function useDeferredValue<T>(value: T, initialValue?: T): T;
```

Defers non-urgent updates:
```javascript
const deferredQuery = useDeferredValue(query);
// query updates immediately, deferredQuery lags
```

### useId
```javascript { .api }
function useId(): string;
```

Unique IDs for accessibility:
```javascript
const id = useId();
return <><label htmlFor={id}>Name</label><input id={id} /></>;
```

[Detailed Performance Hooks](./hooks-performance.md)

---

## Transitions & Async

### useTransition
```javascript { .api }
function useTransition(): [boolean, (callback: () => void, options?: StartTransitionOptions) => void];
```

Non-urgent state updates:
```javascript
const [isPending, startTransition] = useTransition();
startTransition(() => setState(newValue));  // Low priority update
```

### use
```javascript { .api }
function use<T>(resource: Promise<T> | Context<T>): T;
```

Unwraps promises (supports Suspense):
```javascript
const user = use(userPromise);  // Suspends until resolved
```

### useOptimistic
```javascript { .api }
function useOptimistic<S, A>(passthrough: S, reducer?: (state: S, action: A) => S): [S, (action: A) => void];
```

Optimistic UI updates:
```javascript
const [optimisticState, addOptimistic] = useOptimistic(state, reducer);
addOptimistic(newItem);  // Immediately updates UI
try { await save(newItem); } catch { /* reverts */ }
```

### useActionState
```javascript { .api }
function useActionState<S, P>(
  action: (state: S, payload: P) => S | Promise<S>,
  initialState: S,
  permalink?: string
): [S, (payload: P) => void, boolean];
```

Server action state management:
```javascript
const [state, formAction, isPending] = useActionState(updateProfile, {success: false});
return <form action={formAction}><button disabled={isPending}>Save</button></form>;
```

[Detailed Transition Hooks](./hooks-transitions.md)

---

## Context & Stores

### useContext
```javascript { .api }
function useContext<T>(context: Context<T>): T;
```

Read context values:
```javascript
const theme = useContext(ThemeContext);
```

### useSyncExternalStore
```javascript { .api }
function useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => (() => void),
  getSnapshot: () => T,
  getServerSnapshot?: () => T
): T;
```

Subscribe to external stores:
```javascript
const isOnline = useSyncExternalStore(
  (cb) => { window.addEventListener('online', cb); window.addEventListener('offline', cb);
            return () => { window.removeEventListener('online', cb); window.removeEventListener('offline', cb); } },
  () => navigator.onLine,
  () => true  // SSR fallback
);
```

[Detailed Context Hooks](./hooks-context.md)

---

## Imperative Hooks

### useImperativeHandle
```javascript { .api }
function useImperativeHandle<T>(ref: Ref<T>, createHandle: () => T, deps?: ReadonlyArray<any>): void;
```

Customize ref value:
```javascript
const Input = forwardRef((props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => inputRef.current.value = ''
  }));
  return <input ref={inputRef} />;
});
```

### useDebugValue
```javascript { .api }
function useDebugValue<T>(value: T, format?: (value: T) => any): void;
```

Label custom hooks in DevTools:
```javascript
useDebugValue(isOnline ? '🟢 Online' : '🔴 Offline');
```

### useEffectEvent
```javascript { .api }
function useEffectEvent<T>(handler: T): T;
```

Stable event handlers for effects:
```javascript
const onMessage = useEffectEvent((msg) => log(msg, theme));  // Always reads latest theme
useEffect(() => connection.on('message', onMessage), [connection]);  // theme not in deps
```

[Detailed Imperative Hooks](./hooks-imperative.md)

---

## Component Classes

### Component & PureComponent
```javascript { .api }
class Component<P = {}, S = {}> {
  constructor(props: P);
  setState(updater: S | ((prevState: S, props: P) => S), callback?: () => void): void;
  forceUpdate(callback?: () => void): void;
  props: Readonly<P>;
  state: Readonly<S>;
}

class PureComponent<P = {}, S = {}> extends Component<P, S> {}
```

Class component:
```javascript
class Counter extends Component {
  state = { count: 0 };
  increment = () => this.setState({ count: this.state.count + 1 });
  render() { return <button onClick={this.increment}>{this.state.count}</button>; }
}
```

[Detailed Component Classes](./components.md)

---

## Built-in Components

```javascript { .api }
const Fragment: ComponentType<{ children?: ReactNode; key?: Key }>;
const StrictMode: ComponentType<{ children?: ReactNode }>;
const Suspense: ComponentType<{ children?: ReactNode; fallback?: ReactNode }>;
const Profiler: ComponentType<{
  id: string;
  onRender?: (id, phase, actualDuration, baseDuration, startTime, commitTime) => void;
  children?: ReactNode;
}>;
```

Usage:
```javascript
<Fragment><Child /></Fragment>  // or <>
<StrictMode><App /></StrictMode>
<Suspense fallback={<Loader />}><LazyComponent /></Suspense>
<Profiler id="App" onRender={logMetrics}><App /></Profiler>
```

[Detailed Built-in Components](./built-in-components.md)

---

## Element Creation

```javascript { .api }
function createElement<P>(
  type: string | ComponentType<P>,
  props?: (P & { key?: Key; ref?: Ref<any> }) | null,
  ...children: ReactNode[]
): ReactElement<P>;

function cloneElement<P>(
  element: ReactElement<P>,
  props?: Partial<P> & { key?: Key; ref?: Ref<any> },
  ...children: ReactNode[]
): ReactElement<P>;

function isValidElement(object: any): boolean;
```

Rarely used directly (JSX preferred):
```javascript
createElement('div', { className: 'container' }, 'Hello');
cloneElement(child, { className: 'enhanced' });
isValidElement(value);  // Type guard
```

[Detailed Element Creation](./elements.md)

---

## Refs

```javascript { .api }
function createRef<T>(): RefObject<T>;
function forwardRef<P, T>(render: (props: P, ref: Ref<T>) => ReactElement | null): ComponentType<P & { ref?: Ref<T> }>;
```

Usage:
```javascript
const ref = createRef();
<input ref={ref} />
ref.current.focus();

const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
```

[Detailed Refs](./refs.md)

---

## Context Creation

```javascript { .api }
function createContext<T>(defaultValue: T): Context<T>;
```

Usage:
```javascript
const ThemeContext = createContext('light');
function App() {
  return <ThemeContext.Provider value="dark"><Children /></ThemeContext.Provider>;
}
function Child() {
  const theme = useContext(ThemeContext);  // "dark"
}
```

[Detailed Context](./context.md)

---

## Composition

### memo
```javascript { .api }
function memo<P>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): ComponentType<P>;
```

Prevent re-renders:
```javascript
const Memoized = memo(({ data }) => <div>{data.map(...)}</div>);
```

### lazy
```javascript { .api }
function lazy<P>(factory: () => Promise<{ default: ComponentType<P> }>): ComponentType<P>;
```

Code splitting:
```javascript
const LazyComponent = lazy(() => import('./Component'));
<Suspense fallback={<Loader />}><LazyComponent /></Suspense>
```

[Detailed Composition](./composition.md)

---

## Children Utilities

```javascript { .api }
const Children = {
  map<T, C>(children: C | ReadonlyArray<C>, fn: (child: C, index: number) => T): T[];
  forEach<C>(children: C | ReadonlyArray<C>, fn: (child: C, index: number) => void): void;
  count(children: any): number;
  only<C>(children: C): C;
  toArray<C>(children: C | ReadonlyArray<C>): C[];
};
```

Usage:
```javascript
Children.map(children, (child, i) => cloneElement(child, { index: i }));
Children.count(children);  // Number of children
Children.only(children);    // Asserts exactly one child
Children.toArray(children);  // Flatten to array
```

[Detailed Children](./children.md)

---

## Transitions

```javascript { .api }
function startTransition(callback: () => void, options?: StartTransitionOptions): void;
```

Mark updates as non-urgent:
```javascript
startTransition(() => setState(newValue));
// Useful when you don't have useTransition hook available
```

[Detailed Transitions](./transitions.md)

---

## Caching

```javascript { .api }
function cache<A extends ReadonlyArray<any>, T>(fn: (...args: A) => T): (...args: A) => T;
function cacheSignal(): AbortSignal | null;
```

Server-side caching (request-scoped):
```javascript
const getUser = cache(async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});
// Multiple calls in same request share result
```

[Detailed Caching](./caching.md)

---

## Development APIs

```javascript { .api }
function act(callback: () => void | Promise<void>): Promise<void>;
function captureOwnerStack(): string | null;
const version: string;
```

Testing and debugging:
```javascript
await act(() => render(<Component />));  // Testing
const stack = captureOwnerStack();       // Debug (dev only)
const version = version;                 // "19.2.0"
```

[Detailed Development APIs](./development.md)

---

## Experimental APIs

**Warning**: Use with caution, may change:
- `Activity` - Activity boundaries for state preservation
- `unstable_useCacheRefresh` - Cache invalidation
- `experimental_taintUniqueValue` - Prevent data leakage (server-only)
- `experimental_taintObjectReference` - Taint objects (server-only)
- `unstable_postpone` - Postpone rendering (server-only)

See [Experimental APIs](./experimental.md) for details.

---

## Types

```javascript { .api }
type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNode[];
type ReactElement<P = any> = { type: string | ComponentType<P>; props: P; key: Key | null };
type Key = string | number;
type Ref<T> = { current: T | null } | ((instance: T | null) => void) | null;
type ComponentType<P = {}> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P>);
type Dispatch<A> = (action: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);
```

---

## Common Patterns

### Custom Hooks
```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, [url]);
  return data;
}
```

### Error Boundaries (class component)
```javascript
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}

// Note: No function component equivalent yet
// Catches errors in: rendering, lifecycle methods, constructors
// Doesn't catch: event handlers, async code, SSR errors
```

### Controlled vs Uncontrolled
```javascript
// Controlled
const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)} />

// Uncontrolled
const inputRef = useRef();
// Access via inputRef.current.value
```

### Conditional Rendering
```javascript
{condition && <Component />}
{condition ? <True /> : <False />}
{items.map(item => <Item key={item.id} {...item} />)}
```

### Form Handling
```javascript
const [form, setForm] = useState({ name: '', email: '' });
<form onSubmit={e => { e.preventDefault(); handleSubmit(form); }}>
  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
</form>
```

### Lists & Keys
```javascript
// Always provide stable keys
{items.map(item => <Item key={item.id} {...item} />)}

// Keys help React identify which items changed
// ✅ Use stable IDs from data (item.id)
// ❌ Don't use array indices (causes bugs when list changes)
// ❌ Don't use random values (Math.random(), Date.now())

// Keys must be unique among siblings (not globally)
```

### Fragments
```javascript
// Avoid wrapper divs
<>
  <Header />
  <Content />
</>

// or
import { Fragment } from 'react';
<Fragment key={id}>{children}</Fragment>
```

