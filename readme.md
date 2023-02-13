# react-event-context

<a href="https://npmjs.org/package/react-event-context">
  <img alt="NPM version" src="https://img.shields.io/npm/v/react-event-context.svg?style=flat-square">
</a>
<a href="https://npmjs.org/package/react-event-context">
  <img alt="NPM downloads" src="https://img.shields.io/npm/dm/react-event-context.svg?style=flat-square">
</a>

[![CI](https://github.com/wangzishun/react-event-context/actions/workflows/ci.yml/badge.svg)](https://github.com/wangzishun/react-event-context/actions/workflows/ci.yml)

tiny state manager based on `publish-subscribe` \ [React Context](https://reactjs.org/docs/context.html) \ [immer](https://immerjs.github.io/immer/produce/#example). Four kinds of selectors are available, can be used in most scenarios,

# Quick start with two examples

## Simple Counter example

```tsx
import { createEventContext } from 'react-event-context'

// [1]. create event context
const CounterEvtCtx = createEventContext({
  count: 0,
  hallo: 'hallo-world',
})

// [2]. Button use dispatch to change `count`
function Button() {
  const [dispatch] = CounterEvtCtx.useConsumer(null) // null means subscribe nothing
  const increment = () => dispatch((draft) => draft.count++)

  return <button onClick={increment}>count increment</button>
}

// [3]. Count subscribe `count`, and rerender when count changed
function Count() {
  const [count, dispatch] = CounterEvtCtx.useConsumer('count') // subscribe count
  return <span>{count}</span>
}

// [4]. HalloWorld subscribe hallo, and rerender when hallo changed
function HalloWorld() {
  console.log('HalloWorld will not rerender when count changed')

  const [hallo, dispatch] = CounterEvtCtx.useConsumer('hallo')
  return <b>{hallo}</b>
}

export default function SimpleCounter() {
  return (
    <CounterEvtCtx.Provider>
      <Count />
      <Button />
      <HalloWorld />
    </CounterEvtCtx.Provider>
  )
}
```

## Advanced example

```tsx
import { createEventContext } from 'react-event-context'

const CounterEvtCtx = createEventContext({
  count: 0,
  hallo: 'hallo-world',
  list: [{ name: 'luffy' }, { name: 'mingo' }, { name: 'zoro' }],
  nested: {
    place: ['Skypiea', 'Water7', 'Fishman Island', 'Dressrosa', 'Shabondy'],
  },
})

// [*] use `StringPath` subscribe multiple state
function Count() {
  console.log(Count.name)

  // try ts intellicense on `StringPath` `data`
  const [state, dispatch] = CounterEvtCtx.useConsumer('hallo', 'count', 'list.2.name')
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}

// [*] dispatch based on immer.produce
function Increment() {
  const [dispatch] = CounterEvtCtx.useConsumer(null)
  const increment = () => dispatch((draft) => draft.count++)

  return <button onClick={increment}>click to increment count</button>
}

// [*] use `Selector` to subscribe partial state
function OnePiece() {
  console.log(OnePiece.name)

  // try ts intellicense on `state` `data`
  const [data, dispatch] = CounterEvtCtx.useConsumer((state) => ({
    list: state.list,
    place: state.nested.place,
  }))
  return (
    <ul>
      {data.list.map((item) => (
        <li key={item.name}>{item.name}</li>
      ))}
      {data.place.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function OnePieceSorter() {
  const [dispatch] = CounterEvtCtx.useConsumer(null)
  return <button onClick={() => dispatch((draft) => draft.list.reverse())}>click to reverse list</button>
}

// [*] subscribe all state
function AllState() {
  const [state] = CounterEvtCtx.useConsumer()
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}

export default function AdvancedCounter() {
  return (
    <CounterEvtCtx.Provider>
      <Count />
      <Increment />
      <OnePiece />
      <OnePieceSorter />
      <AllState />
    </CounterEvtCtx.Provider>
  )
}
```

## Installation

```sh
npm i react-event-context
```

```sh
yarn add react-event-context
```

```sh
pnpm add react-event-context
```

## API

### `createEventContext`

```ts
import { createEventContext } from 'react-event-context'
const { Provider, useConsumer } = createEventContext(YourStateObject)
```

### `Provider`

Please use provider to wrap your component !!! I have tried to give up the provider, but the hot update during development will have closure problems.

### `useConsumer`

It overload four times and returns a tuple of `[...state, dispatch]`.

1.  It receives empty; It return fullstate and dispatch

    ```ts
    function useConsumer(): [S, DispatchRecipe<S>]
    ```

2.  It receives `null`; It return dispatch

    ```ts
    function useConsumer<Selector extends null>(sel: null): [DispatchRecipe<S>]
    ```

3.  It receives `Selector` function; It return PartialState and dispatch

    ```ts
    function useConsumer<Selector extends (v: S) => any>(sel?: Selector): [Unpacked<Selector>, DispatchRecipe<S>]
    ```

4.  It receives `Path` rest; It return PathValues and dispatch

    ```ts
    function useConsumer<P extends Path<S>[]>(...sel: readonly [...P]): [[...FieldPathValues<S, P>], DispatchRecipe<S>]
    ```

### `dispatch`

It is based on `immer.produce`. [if you don't know what immer is, this way please](https://immerjs.github.io/immer/produce/#example)

```ts
dispatch((draft) => draft.count++) // do anything you want
```

```ts
// unlike immer, it is not possible to perform state replace by return value. only revise draft is effective
dispatch((draft) => ({ hallo: 'world' }))
```

## Contributing

If you find a bug, please [create an issue](https://github.com/wangzishun/react-event-context/issues/new) providing instructions to reproduce it. It's always very appreciable if you find the time to fix it. In this case, please [submit a PR](https://github.com/wangzishun/react-event-context/pulls).

If you're a beginner, extremely grateful for your attention and contribution.

When working on this codebase, please use `pnpm`. Run `yarn examples` to run examples.

## License

MIT © [wangzishun](https://github.com/wangzishun)
