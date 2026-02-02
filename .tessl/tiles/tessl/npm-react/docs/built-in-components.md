# Built-in Components

Special components: Fragment, StrictMode, Suspense, Profiler.

## Fragment

Render multiple children without a wrapper.

```javascript { .api }
const Fragment: ComponentType<{ children?: ReactNode; key?: Key }>;
```

```javascript
// Long form
<Fragment><Child1 /><Child2 /></Fragment>

// Short syntax
<><Child1 /><Child2 /></>

// With key (required when mapping)
{todos.map(todo => (
  <Fragment key={todo.id}>
    <Title>{todo.title}</Title>
    <Body>{todo.body}</Body>
  </Fragment>
))}
```

## StrictMode

Development checks for its descendants.

```javascript { .api }
const StrictMode: ComponentType<{ children?: ReactNode }>;
```

```javascript
<StrictMode>
  <App />  {/* Detects unsafe lifecycles, unexpected side effects, etc. */}
</StrictMode>
```

## Suspense

Declarative loading states.

```javascript { .api }
const Suspense: ComponentType<{ children?: ReactNode; fallback?: ReactNode }>;
```

```javascript
<Suspense fallback={<Loader />}>
  <LazyComponent />
</Suspense>

// Nested boundaries
<Suspense fallback={<AppShell />}>
  <Nav />
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</Suspense>
```

## Profiler

Performance monitoring.

```javascript { .api }
const Profiler: ComponentType<{
  id: string;
  onRender?: (id, phase, actualDuration, baseDuration, startTime, commitTime) => void;
  children?: ReactNode;
}>;
```

```javascript
<Profiler id="App" onRender={(id, phase, duration) => {
  console.log(`${id} took ${duration}ms`);
}}>
  <App />
</Profiler>
```

