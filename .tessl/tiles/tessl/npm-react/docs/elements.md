# Element Creation

Rarely used directly (JSX preferred).

## createElement

Creates React elements (used by JSX).

```javascript { .api }
function createElement<P>(
  type: string | ComponentType<P>,
  props?: (P & { key?: Key; ref?: Ref<any> }) | null,
  ...children: ReactNode[]
): ReactElement<P>;
```

```javascript
createElement('div', { className: 'container' }, 'Hello');
// JSX: <div className="container">Hello</div>
```

## cloneElement

Clone and modify element props.

```javascript { .api }
function cloneElement<P>(
  element: ReactElement<P>,
  props?: Partial<P> & { key?: Key; ref?: Ref<any> },
  ...children: ReactNode[]
): ReactElement<P>;
```

```javascript
// Add props to children
<div>
  {Children.map(children, child => cloneElement(child, { className: 'enhanced' }))}
</div>
```

## isValidElement

Type guard for React elements.

```javascript { .api }
function isValidElement(object: any): boolean;
```

```javascript
if (isValidElement(content)) {
  return content;
}
return <div>{String(content)}</div>;
```

