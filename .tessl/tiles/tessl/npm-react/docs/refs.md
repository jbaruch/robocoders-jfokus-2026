# Refs

Access DOM nodes and customize ref values.

## createRef

Creates a ref object for class components. Returns object with `.current` property.

```javascript { .api }
function createRef<T>(): RefObject<T>;

interface RefObject<T> {
  readonly current: T | null;
}
```

```javascript
class TextInput extends Component {
  inputRef = createRef();
  
  focusInput = () => {
    this.inputRef.current?.focus();  // Use optional chaining
  };
  
  render() {
    return <input ref={this.inputRef} />;
  }
}
```

## forwardRef

Forward ref to child component. Required to pass refs to function components.

```javascript { .api }
function forwardRef<P, T>(
  render: (props: P, ref: Ref<T>) => ReactElement | null
): ComponentType<P & { ref?: Ref<T> }>;

type Ref<T> = RefObject<T> | ((instance: T | null) => void) | null;
```

```javascript
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// Parent uses ref
const inputRef = useRef(null);
<Input ref={inputRef} />
inputRef.current?.focus();

// With useImperativeHandle for custom API
const CustomInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => inputRef.current.value = ''
  }));
  
  return <input ref={inputRef} {...props} />;
});
```

