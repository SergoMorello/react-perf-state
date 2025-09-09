# react-perf-state

Tiny performance-oriented React hook for coalescing multiple `setState` calls into a single update per animation frame.

> When a component calls `setState` many times in quick succession (e.g., during scroll/gesture/resize or bursty events), React may still perform several renders.  
> `useQueueState` batches those updates per component and applies **exactly once per `requestAnimationFrame`**, cutting down renders and layout thrash.

---

## ✨ Features

- **rAF-batched**: merges all updates issued in the same frame.
- **Per-component queues**: each component gets its own queue; parallel components won’t step on each other.
- **Functional updates compose**: multiple `(prev) => next` calls are applied in order, like a reducer.
- **TypeScript-first**: full generics and strong typing.
- **Drop-in**: same API shape as `useState` (tuple `[state, setState]`).

---

## Installation

```bash
npm i react-perf-state
# or
yarn add react-perf-state
# or
pnpm add react-perf-state
```

No peer deps beyond React.

---

## Quick start

```tsx
import { useQueueState } from 'react-perf-state';

function Counter() {
  const [count, setCount] = useQueueState(0);

  const burst = () => {
    // These three updates will be merged into a single render this frame
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  };

  return (
    <button onClick={burst}>
      Count: {count}
    </button>
  );
}
```

---

## API

### `useQueueState<T>(initial: T | (() => T))`
Returns `[state, queuedSetState]` just like `useState`.

#### Behavior details
- **rAF scheduling**: the first call to `queuedSetState` in a frame schedules a `requestAnimationFrame` that will flush the queue.
- **Composition**: if you call `queuedSetState` multiple times before the rAF flush, they’re **reduced in order**.
- **Per-instance queue**: queue is keyed by the component’s `setState` reference.
- **State ref safety**: ensures correct base state even if queue starts with undefined.

---

## Why not just rely on React 18 batching?

React 18 batches state updates **within the same event**. Many high-frequency scenarios (pointermove, scroll, timers, observers) can still trigger multiple updates/renders across frames.  
`useQueueState` guarantees **at most one render per frame per component** regardless of how many `setState`s you fire.

---

## Examples

### 1) Smooth pointer tracking

```tsx
function PointerTracker() {
  const [pt, setPt] = useQueueState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPt(curr => ({ ...curr, x: e.clientX, y: e.clientY }));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [setPt]);

  return <div>({pt.x}, {pt.y})</div>;
}
```

### 2) Coalescing expensive derived state

```tsx
setFilters(f => ({ ...f, price: 'low' }));
setFilters(f => ({ ...f, rating: 4 }));
setFilters(f => ({ ...f, inStock: true }));
// -> One render with fully combined filters
```

### 3) React Native scrolling

```tsx
<FlatList
  onScroll={e => {
    const y = e.nativeEvent.contentOffset.y;
    setScrollState(s => ({ ...s, y }));
  }}
  scrollEventThrottle={16}
/>
```

---

## Caveats & best practices

- **Not for controlled text inputs**: use plain `useState` for keystroke-bound values.
- **rAF availability (SSR / background tabs)**: provide polyfills if needed.
- **No synchronous reads**: updates apply later, not instantly.
- **Same rules as React state**: don’t throw from update functions.

---

## License

MIT © contributors
