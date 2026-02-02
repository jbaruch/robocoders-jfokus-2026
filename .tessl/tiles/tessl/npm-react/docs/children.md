# Children Utilities

Utilities for manipulating opaque children prop.

```javascript { .api }
const Children = {
  map<T, C>(children: C | ReadonlyArray<C>, fn: (child: C, index: number) => T): T[];
  forEach<C>(children: C | ReadonlyArray<C>, fn: (child: C, index: number) => void): void;
  count(children: any): number;
  only<C>(children: C): C;
  toArray<C>(children: C | ReadonlyArray<C>): C[];
};
```

```javascript
// Transform children
<div>
  {Children.map(children, (child, i) => 
    cloneElement(child, { index: i, isFirst: i === 0 })
  )}
</div>

// Count and validate
if (Children.count(children) > max) throw new Error('Too many children');

// Ensure single child
const child = Children.only(children);

// Flatten nested structure
const items = Children.toArray(children);
```

