# Transitions

## startTransition

```javascript { .api }
function startTransition(callback: () => void, options?: StartTransitionOptions): void;
```

```javascript
startTransition(() => {
  setState(newValue);  // Non-urgent update
});

// vs useTransition hook:
const [isPending, startTransition] = useTransition();
startTransition(() => setState(value));
```

