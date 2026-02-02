# Caching

Server-side caching with request scoping.

## cache

```javascript { .api }
function cache<A extends ReadonlyArray<any>, T>(fn: (...args: A) => T): (...args: A) => T;
```

```javascript
// Request-scoped cache on server
const getUser = cache(async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// Multiple components share cached result
function UserProfile({ userId }) {
  const user = use(getUser(userId));  // Uses cache
  return <div>{user.name}</div>;
}
```

## cacheSignal

```javascript { .api }
function cacheSignal(): AbortSignal | null;
```

```javascript
const fetchUser = cache(async (id) => {
  const signal = cacheSignal();
  return fetch(`/api/users/${id}`, { signal });
});
```

