# Context

Share data without prop drilling. Prefer context for truly global data; for frequent updates, consider state management libraries or split contexts for performance. See useContext hook for consumption.

## createContext

```javascript { .api }
function createContext<T>(defaultValue: T): Context<T>;

interface Context<T> {
  Provider: ComponentType<{ value: T; children?: ReactNode }>;
  Consumer: ComponentType<{ children: (value: T) => ReactNode }>;
}
```

```javascript
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);  // "dark"
  return <button className={theme}>Click</button>;
}

// ⚠️ All consumers re-render when context value changes
// Use memo or split contexts to optimize
```

## Custom Context Pattern

```javascript
// Context + Provider component
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    const user = await authenticate(credentials);
    setUser(user);
  };
  
  return <AuthContext.Provider value={{ user, login, logout }}>
    {children}
  </AuthContext.Provider>;
}

// Custom hook with error checking (best practice)
function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used within AuthProvider');
  return auth;
}

// Memoize context value to prevent unnecessary re-renders
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

## Split Contexts (Performance)

```javascript
const UserStateContext = createContext(null);
const UserDispatchContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserStateContext.Provider value={user}>
      <UserDispatchContext.Provider value={setUser}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}
// Components only re-render when their specific context changes
```

