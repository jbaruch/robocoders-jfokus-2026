# Experimental APIs

**Warning**: Use with caution - may change or be unavailable.

## Activity

State preservation across navigations.

```javascript { .api }
const Activity: ComponentType<{
  mode?: "hidden" | "visible";
  name?: string;
  children?: ReactNode;
}>;
```

```javascript
<Activity mode="visible" name="chat">
  <ChatRoom />
</Activity>
```

## unstable_useCacheRefresh

Refresh cache entries.

```javascript { .api }
function unstable_useCacheRefresh(): <T>(fn?: () => T, seed?: T) => void;
```

```javascript
const refresh = unstable_useCacheRefresh();
refresh(getUser, userId);  // Refresh specific cache
```

## Server-Only Taint APIs

Prevent sensitive data from leaking to client.

```javascript { .api }
function experimental_taintUniqueValue(message: string | undefined, lifetime: object, value: string | bigint | ArrayBufferView): void;
function experimental_taintObjectReference(message: string | undefined, object: object | Function): void;
function unstable_postpone(reason: string): void;
```

```javascript
// Prevent API key leakage
experimental_taintUniqueValue('API key secret', user, user.apiKey);

// Prevent object leakage
experimental_taintObjectReference('Config secret', config);

// Postpone rendering
if (!data.ready) unstable_postpone('Data not ready');
```

**Note**: Many experimental APIs are disabled by default in published builds.

