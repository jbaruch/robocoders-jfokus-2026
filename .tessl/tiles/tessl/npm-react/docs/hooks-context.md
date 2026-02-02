# Context & Store Hooks

Consume context and subscribe to external data.

## useContext

Read context value.

```javascript { .api }
function useContext<T>(context: Context<T>): T;
```

```javascript
const theme = useContext(ThemeContext);

// Custom hook wrapper
function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used within AuthProvider');
  return auth;
}
```

## useSyncExternalStore

Subscribe to external data sources.

```javascript { .api }
function useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => (() => void),
  getSnapshot: () => T,
  getServerSnapshot?: () => T
): T;
```

```javascript
// Browser API
const isOnline = useSyncExternalStore(
  (cb) => {
    window.addEventListener('online', cb);
    window.addEventListener('offline', cb);
    return () => {
      window.removeEventListener('online', cb);
      window.removeEventListener('offline', cb);
    };
  },
  () => navigator.onLine,
  () => true  // SSR fallback
);

// Custom store
const [count, setCount] = useSyncExternalStore(
  (cb) => store.subscribe(cb),
  () => store.getState(),
  () => 0
);

// Media query
const isMobile = useSyncExternalStore(
  (cb) => {
    const mq = window.matchMedia('(max-width: 768px)');
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  },
  () => window.matchMedia('(max-width: 768px)').matches,
  () => false
);
```

