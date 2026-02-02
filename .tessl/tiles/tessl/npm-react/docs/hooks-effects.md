# Effect Hooks

Side effects: data fetching, subscriptions, DOM manipulation. Effects run after render (useEffect), before paint (useLayoutEffect), or before mutations (useInsertionEffect).

## useEffect

Runs after render completes (asynchronous). Cleanup runs before effect or on unmount.

```javascript { .api }
function useEffect(effect: () => (void | (() => void)), deps?: ReadonlyArray<any>): void;
```

```javascript
// Data fetching with AbortController (modern approach)
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Fetch failed:', err);
        setError(err);
      }
    });

  return () => controller.abort();  // Cancel fetch on cleanup
}, [url]);

// Alternative: boolean flag (older approach)
useEffect(() => {
  let cancelled = false;
  fetch(url)
    .then(res => res.json())
    .then(data => !cancelled && setData(data));
  return () => { cancelled = true; };
}, [url]);

// Subscriptions - cleanup prevents leaks
useEffect(() => {
  const sub = api.subscribe(onUpdate);
  return () => sub.unsubscribe();
}, [id]);

// Event listeners
useEffect(() => {
  const handleResize = () => setSize(getWindowSize());
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);  // Empty deps = mount/unmount only

// Issue: Missing deps causes stale closures
useEffect(() => {
  fetchData(id);  // ❌ id not in deps
}, []);  // Add [id] to deps or use ESLint plugin

// Correct: include all reactive values
useEffect(() => {
  fetchData(id);  // ✅ All deps listed
}, [id]);

// Empty deps vs no deps
useEffect(() => {}, []);   // Runs once on mount
useEffect(() => {});       // Runs after every render (rarely needed)

// StrictMode behavior (dev only)
// In React 18+ StrictMode, effects run twice to surface bugs:
// mount → cleanup → mount
// This helps find missing cleanup logic
```

## useLayoutEffect

Synchronous effect before browser paint (blocks visual update). Use sparingly for DOM measurements.

```javascript { .api }
function useLayoutEffect(effect: () => (void | (() => void)), deps?: ReadonlyArray<any>): void;
```

```javascript
// DOM measurements - prevents flicker
useLayoutEffect(() => {
  if (ref.current) {
    const height = ref.current.getBoundingClientRect().height;
    setHeight(height);
  }
}, [content]);

// Animation setup - must run before paint
useLayoutEffect(() => {
  element.style.transform = 'translateX(0)';
  requestAnimationFrame(() => {
    element.style.transform = 'translateX(100px)';
  });
}, []);

// Scroll restoration
useLayoutEffect(() => {
  window.scrollTo(0, savedScrollPosition);
}, []);

// ⚠️ Use useLayoutEffect sparingly - it blocks visual updates
// Prefer useEffect unless you specifically need synchronous DOM measurements
// SSR: useLayoutEffect warns on server - use useEffect or conditional logic
```

## useInsertionEffect

Runs before all DOM mutations (before useLayoutEffect). Primarily for CSS-in-JS libraries.

```javascript { .api }
function useInsertionEffect(effect: () => (void | (() => void)), deps?: ReadonlyArray<any>): void;
```

```javascript
// CSS-in-JS - must inject before layout
useInsertionEffect(() => {
  const style = document.createElement('style');
  style.textContent = cssRule;
  document.head.appendChild(style);
  return () => style.remove();
}, [cssRule]);

// Priority order:
// 1. useInsertionEffect (CSS injection)
// 2. useLayoutEffect (DOM measurements/animations)
// 3. useEffect (side effects)
```

