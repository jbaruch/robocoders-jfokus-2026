# Component Classes

Class-based components with lifecycle and state.

## Component

Base class with setState and lifecycle methods.

```javascript { .api }
class Component<P = {}, S = {}> {
  constructor(props: P);
  setState(updater: S | ((prevState: S, props: P) => S), callback?: () => void): void;
  forceUpdate(callback?: () => void): void;
  props: Readonly<P>;
  state: Readonly<S>;
}
```

```javascript
class Counter extends Component {
  state = { count: 0 };
  
  increment = () => {
    this.setState({ count: this.state.count + 1 });
    // Functional update
    this.setState(prev => ({ count: prev.count + 1 }));
    // With callback
    this.setState({ count: 1 }, () => console.log('Updated'));
  };
  
  componentDidMount() { this.fetchData(); }
  componentDidUpdate(prevProps) { if (prevProps.id !== this.props.id) this.fetchData(); }
  componentWillUnmount() { this.cleanup(); }
  
  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}
```

## PureComponent

Shallow comparison to prevent unnecessary re-renders. Automatically implements shouldComponentUpdate with shallow prop/state comparison.

```javascript { .api }
class PureComponent<P = {}, S = {}> extends Component<P, S> {}
```

```javascript
// Optimized list item
class ListItem extends PureComponent {
  render() {
    return <li>{this.props.item.name}</li>;  // Only re-renders if props change
  }
}

// ❌ Warning: Doesn't help if parent creates new objects
<BadExample config={{ theme: 'dark' }} />  // New object every render

// ✅ Correct: Pass primitives or stable references
<GoodExample theme="dark" />  // PureComponent works correctly
```

