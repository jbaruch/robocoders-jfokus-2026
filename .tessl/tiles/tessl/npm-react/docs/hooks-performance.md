# Performance Hooks

Optimize rendering with memoization, callbacks, and deferred values. Only use when you have measured a performance problem.

## useMemo

Memoize expensive computations. Returns cached value until deps change.

```javascript { .api }
function useMemo<T>(factory: () => T, deps: ReadonlyArray<any>): T;
```

```javascript
// Expensive calculation - prevents recalculation
const filtered = useMemo(() => 
  items.filter(item => item.name.includes(search)), 
  [items, search]
);

// Object identity - prevents child re-renders
const options = useMemo(() => ({ theme, lang }), [theme, lang]);
<Child options={options} />  // Child only re-renders when options identity changes

// ❌ Overuse - not all values need memoization
const doubled = useMemo(() => count * 2, [count]);  // Unnecessary, simple calculation

// ✅ Correct - truly expensive operations
const sorted = useMemo(() => largeArray.sort(), [largeArray]);
```

## useCallback

Stable function references to prevent child re-renders or effect re-runs.

```javascript { .api }
function useCallback<T extends Function>(callback: T, deps: ReadonlyArray<any>): T;
```

```javascript
// Prevent child re-renders
const handleClick = useCallback(() => doSomething(id), [id]);
const MemoizedChild = memo(Child);
<MemoizedChild onClick={handleClick} />  // Only re-renders when id changes

// With useEffect - avoids infinite loops
const fetchData = useCallback(async () => {
  const res = await fetch(url);
  setData(await res.json());
}, [url]);
useEffect(() => { fetchData(); }, [fetchData]);

// ❌ Overuse - only needed for memo children or effect deps
const handler = useCallback(() => doSomething(), []);  // Often unnecessary without memo
```

## useDeferredValue

Defers non-urgent updates to keep UI responsive. Shows stale indicator while updating.

```javascript { .api }
function useDeferredValue<T>(value: T, initialValue?: T): T;
```

```javascript
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);  // Updates with lower priority
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {isStale && <div>Loading...</div>}
      <ExpensiveList query={deferredQuery} />  // Updates after urgent updates
    </>
  );
}

// With initial value for SSR
const deferredItems = useDeferredValue(items, []);  // Uses [] initially
```

## useId

Stable IDs for accessibility and SSR safety (stable across client/server).

```javascript { .api }
function useId(): string;
```

```javascript
// Form accessibility
const id = useId();
return (
  <>
    <label htmlFor={id}>Name</label>
    <input id={id} type="text" />
  </>
);

// Multiple related IDs
const checkboxId = useId();
const descriptionId = `${checkboxId}-description`;
<input id={checkboxId} aria-describedby={descriptionId} />
<p id={descriptionId}>Help text</p>

// React 19+: ID prefixing
const id = useId();  // Returns ":r1:"
```

