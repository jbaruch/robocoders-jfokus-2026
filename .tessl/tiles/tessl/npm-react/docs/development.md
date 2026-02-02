# Development APIs

Testing, debugging, and internal APIs.

## act

Batches updates for testing.

```javascript { .api }
function act(callback: () => void | Promise<void>): Promise<void>;
```

```javascript
import { act } from 'react';
import { createRoot } from 'react-dom/client';

test('updates state', async () => {
  const root = createRoot(document.createElement('div'));
  
  await act(async () => root.render(<Counter />));
  await act(async () => button.click());
  
  expect(container.textContent).toBe('Count: 1');
});
```

## captureOwnerStack

Debug stack traces (dev only).

```javascript { .api }
function captureOwnerStack(): string | null;
```

```javascript
if (process.env.NODE_ENV === 'development') {
  const stack = captureOwnerStack();
  console.log('Rendered from:', stack);
}
```

## version

React version string.

```javascript { .api }
const version: string;
```

```javascript
console.log('React version:', version);  // "19.2.0"
```

## Internal APIs

- `__COMPILER_RUNTIME` - Used by React Compiler
- `__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE` - React internal state

**Warning**: These are internal only and should not be used in application code.

