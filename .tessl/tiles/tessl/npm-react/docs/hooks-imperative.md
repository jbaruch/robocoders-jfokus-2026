# Imperative & Debug Hooks

Specialized hooks for ref handling, debugging, and event extraction. Use sparingly - prefer declarative patterns.

## useImperativeHandle

Customize exposed ref value.

```javascript { .api }
function useImperativeHandle<T>(ref: Ref<T>, createHandle: () => T, deps?: ReadonlyArray<any>): void;
```

```javascript
const Input = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => inputRef.current.value = '',
    getValue: () => inputRef.current.value
  }));
  
  return <input ref={inputRef} {...props} />;
});

// Parent uses custom API
const inputRef = useRef();
<Input ref={inputRef} />
inputRef.current.focus();
inputRef.current.clear();

// Use cases: focus management, animation triggers, measurement
// ⚠️ Breaks encapsulation - use sparingly, prefer props
// Must be used with forwardRef
```

## useDebugValue

Label hooks in DevTools.

```javascript { .api }
function useDebugValue<T>(value: T, format?: (value: T) => any): void;
```

```javascript
function useFetch(url) {
  const [data, loading] = useState(null, true);
  
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, [url]);
  
  useDebugValue(loading ? 'Loading...' : 'Loaded');
  // Shows in DevTools custom hook inspection
  
  return { data, loading };
}

// With formatter (lazy evaluation)
useDebugValue(isOnline, online => online ? '🟢 Online' : '🔴 Offline');
```

## useEffectEvent

Stable event handlers for effects.

```javascript { .api }
function useEffectEvent<T extends Function>(handler: T): T;
```

```javascript
// Avoid stale closures
const onMessage = useEffectEvent((msg) => {
  // Always reads latest theme without adding to deps
  log(msg, theme);
});

useEffect(() => {
  connection.on('message', onMessage);
  return () => connection.off('message', onMessage);
}, [connection]);  // theme not needed

// Analytics with latest user
const trackView = useEffectEvent(() => {
  analytics.track({ userId: user?.id, pageId });  // Always latest
});

useEffect(() => trackView(), [pageId]);  // Only track page changes

// ⚠️ Experimental - may change
// Solves: reading latest props/state in effects without re-running effect
// Alternative: use refs to store latest values
```

