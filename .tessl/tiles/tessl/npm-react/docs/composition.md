# Component Composition

Optimize components with memo (skip re-renders) and lazy (code splitting). Use memo only when profiling shows performance issues.

## memo

Prevent re-renders with shallow prop comparison. Only use when component is expensive to render.

```javascript { .api }
function memo<P>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): ComponentType<P>;
```

```javascript
const ExpensiveComponent = memo(({ data }) => {
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
});

// Custom comparison (advanced)
const User = memo(({ user, theme }) => <div style={{color: theme}}>{user.name}</div>,
  (prev, next) => prev.user.id === next.user.id  // Only re-render if user.id changes
);

// ⚠️ Common mistakes
// - Passing inline objects/arrays as props defeats memo (use useMemo)
// - Don't wrap every component - adds overhead without benefit
// - Profile first, then optimize
```

## lazy

Code splitting.

```javascript { .api }
function lazy<P>(factory: () => Promise<{ default: ComponentType<P> }>): ComponentType<P>;
```

```javascript
const LazyComponent = lazy(() => import('./Component'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <LazyComponent />
    </Suspense>
  );
}

// Named exports
const MyComponent = lazy(() =>
  import('./Components').then(m => ({ default: m.MyComponent }))
);

// Error handling: wrap in ErrorBoundary
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<Loader />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

