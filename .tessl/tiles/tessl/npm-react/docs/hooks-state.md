# State Hooks

Manage component state with useState (simple), useReducer (complex), and useRef (persistent values).

## useState

Simple state management with functional updates and lazy initialization.

```javascript { .api }
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

type SetStateAction<S> = S | ((prevState: S) => S);
type Dispatch<A> = (action: A) => void;
```

```javascript
// Basic
const [count, setCount] = useState(0);
setCount(count + 1);
setCount(prev => prev + 1);  // Functional update (preferred for derived state)

// Lazy init - compute once
const [data] = useState(() => expensiveInitialValue());

// Object state - use spread to avoid mutation
const [user, setUser] = useState({ name: '', age: 0 });
setUser({ ...user, name: 'Alice' });  // ✅ Correct
// setUser(user); user.name = 'Alice';  // ❌ Don't mutate directly

// Multiple state updates - batched automatically in React 18+
const [count, setCount] = useState(0);
const handleClick = () => {
  setCount(c => c + 1);  // Batch these
  setCount(c => c + 1);
  // Result: count increases by 2, single re-render
};

// Common mistakes
const [items, setItems] = useState([1, 2, 3]);
items.push(4);           // ❌ Don't mutate state directly
setItems([...items, 4]); // ✅ Create new array

// When to use functional updates
setCount(count + 1);     // ❌ Stale in closures (setTimeout, etc.)
setCount(c => c + 1);    // ✅ Always uses latest value
```

## useReducer

Complex state with reducer pattern. Better for complex state logic or when next state depends on previous.

```javascript { .api }
function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: S,
  init?: (initialArg: S) => S
): [S, Dispatch<A>];
```

```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'reset': return { count: 0 };
    default: return state;
  }
}

// With lazy initialization
const [state, dispatch] = useReducer(reducer, initialCount, (initialCount) => ({ count: initialCount }));
dispatch({ type: 'increment' });

// Complex form state
function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return action.initialState;
    default:
      return state;
  }
}

const [form, dispatch] = useReducer(formReducer, { name: '', email: '' });
dispatch({ type: 'SET_FIELD', field: 'name', value: 'Alice' });

// Advantages over useState:
// - Centralized state logic
// - Better for related state values
// - Easier to test (pure reducer function)
// - Easier to debug (action logs)
```

## useRef

Mutable refs that persist across renders without causing re-renders. Use for: DOM access, timers, previous values, imperative handles.

```javascript { .api }
function useRef<T>(initialValue: T): { current: T };

interface RefObject<T> {
  readonly current: T;
}
```

```javascript
// DOM access
const inputRef = useRef(null);
<input ref={inputRef} />
inputRef.current?.focus();  // Use optional chaining

// Timers - persists across renders
const timerRef = useRef(null);
useEffect(() => {
  timerRef.current = setInterval(() => {}, 1000);
  return () => clearInterval(timerRef.current);
}, []);

// Storing previous value
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}

// Avoiding stale closures in timeouts
const [count, setCount] = useState(0);
const countRef = useRef(count);

useEffect(() => {
  countRef.current = count;
}, [count]);

setTimeout(() => {
  console.log(countRef.current);  // Always latest
}, 1000);
```

