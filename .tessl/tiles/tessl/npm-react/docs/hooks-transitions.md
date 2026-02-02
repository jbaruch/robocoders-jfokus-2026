# Transitions & Async Hooks

Manage non-urgent updates, async operations, and optimistic UI.

## useTransition

Marks updates as non-urgent, keeping UI responsive. React prioritizes urgent updates (typing, clicks) over transitions.

```javascript { .api }
function useTransition(): [boolean, (callback: () => void, options?: StartTransitionOptions) => void];

interface StartTransitionOptions {
  name?: string;  // For React DevTools
}
```

```javascript
const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  setQuery(e.target.value);  // Urgent - updates immediately
  startTransition(() => {
    setResults(filter(e.target.value));  // Non-urgent - can be interrupted
  });
};

return (
  <>
    <input value={query} onChange={handleChange} />
    {isPending && <Spinner />}  {/* Show loading during transition */}
    <Results data={results} />
  </>
);

// Named transitions for debugging
startTransition(() => setTab('posts'), { name: 'switch-tab' });

// Use cases: filtering, sorting, navigation, expensive updates
```

## use

Unwraps promises or reads context. Unique: can be called conditionally (unlike other hooks).

```javascript { .api }
function use<T>(resource: Promise<T> | Context<T>): T;
```

```javascript
function UserProfile({ userPromise }) {
  const user = use(userPromise);  // Suspends until resolved
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <UserProfile userPromise={fetchUser()} />
    </Suspense>
  );
}

// Conditional use (unique to this hook - breaks rules of hooks)
const data = condition ? use(promise) : cachedData;

// Error handling: wrap in ErrorBoundary
// Rejections are thrown and caught by nearest ErrorBoundary
```

## useOptimistic

Optimistic UI updates.

```javascript { .api }
function useOptimistic<S, A>(passthrough: S, reducer?: (state: S, action: A) => S): [S, (action: A) => void];
```

```javascript
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (state, newTodo) => [...state, { ...newTodo, pending: true }]
);

async function handleAdd(newTodo) {
  addOptimistic(newTodo);  // Immediate UI update
  try {
    const saved = await saveTodo(newTodo);
    setTodos([...todos, saved]);  // Replace optimistic with real data
  } catch (error) {
    // Optimistic update auto-reverts
    showError('Failed to save');
  }
}

// Flow: user action → optimistic update → API call → real update or revert
// Perfect for: likes, comments, form submissions
```

## useActionState

Server action state with loading.

```javascript { .api }
function useActionState<S, P>(
  action: (state: S, payload: P) => S | Promise<S>,
  initialState: S,
  permalink?: string
): [S, (payload: P) => void, boolean];
```

```javascript
async function updateProfile(prevState, formData) {
  const name = formData.get('name');
  await saveProfile({ name });
  return { success: true, message: 'Saved!' };
}

function Form() {
  const [state, formAction, isPending] = useActionState(updateProfile, {success: false});
  
  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
```

