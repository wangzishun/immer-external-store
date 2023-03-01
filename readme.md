# immer-external-store

A tiny faster easier react state manager, based immer and useSyncExternalStore, provide two kinds of selector and friendly typescript support.

<a href="https://npmjs.org/package/immer-external-store">
  <img alt="NPM version" src="https://badgen.net/npm/v/immer-external-store">
</a>
<a href="https://npmjs.org/package/immer-external-store">
  <img alt="NPM downloads" src="https://badgen.net/npm/dm/immer-external-store">
</a>

# Examples

- [**SimpleCounterDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/SimpleCounterDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/SimpleCounterDemo/index.tsx)

- [**ComplexDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/ComplexDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/ComplexDemo/index.tsx)

- [**AsyncDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/AsyncDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/AsyncDemo/index.tsx)

- [**TodoUndoRedoDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/TodoUndoRedoDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/TodoUndoRedoDemo/index.tsx)

# Summary

- [immer-external-store](#immer-external-store)
- [Examples](#examples)
- [Summary](#summary)
- [Quick start with two examples](#quick-start-with-two-examples)
  - [SimpleCounterDemo](#simplecounterdemo)
  - [ComplexDemo](#complexdemo)
- [Installation](#installation)
- [API](#api)
  - [`createImmerExternalStore`](#createimmerexternalstore)
  - [`useState`](#usestate)
  - [`dispatch`](#dispatch)
  - [`getSnapshot`](#getsnapshot)
  - [`refresh`](#refresh)
- [Contributing](#contributing)
- [License](#license)

# Quick start with two examples

## <a href="https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/SimpleCounterDemo" target="_blank">SimpleCounterDemo</a>

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createImmerExternalStore } from 'immer-external-store'

// [1]. create store
const Store = createImmerExternalStore({
  count: 0,
  list: ['hallo!', 'bro', 'and', 'sis'],
  increment: () => Store.dispatch((draft) => draft.count++),
})

// [2]. selector what you want
function Count() {
  console.log(Count.name, 'render')

  const [count, list, dispatch] = Store.useState('count', (s) => s.list)
  return (
    <>
      <li>count: {count}</li>
      <li>list: {list.join(' ')}</li>
    </>
  )
}

// [3]. dispatch as immer draft
function SimpleCounterDemo() {
  console.log(SimpleCounterDemo.name, 'render')
  const [increment, dispatch] = Store.useState('increment')
  return (
    <ul>
      <h1>SimpleCounterDemo</h1>
      <Count />
      <button onClick={() => Store.dispatch((draft) => draft.count++)}>count increment</button>
      <button onClick={increment}>count increment(from store)</button>
    </ul>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<SimpleCounterDemo />)
```

## <a href="https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/ComplexDemo" target="_blank">ComplexDemo</a>

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createImmerExternalStore } from 'immer-external-store'

const Store = createImmerExternalStore(() => {
  return {
    count: 0,
    hallo: 'hallo-world',
    users: [{ name: 'luffy' }, { name: 'mingo' }, { name: 'zoro' }],
    nested: {
      place: ['Skypiea', 'Water7', 'Fishman Island', 'Dressrosa', 'Shabondy'],
    },
  }
})

function StringPathSelector() {
  console.log(StringPathSelector.name, 'render')

  const [hallo, count, users1Name, dispatch] = Store.useState('hallo', 'count', 'users.1.name')
  return (
    <ul>
      <div>StringPathSelector</div>
      <li>hallo: {hallo}</li>
      <li>count: {count}</li>
      <li>users.1.name: {users1Name}</li>
    </ul>
  )
}

function FunctionSelector() {
  console.log(FunctionSelector.name, 'render')

  const [usersAndPlace, hallo, dispatch] = Store.useState(
    (s) => ({
      users: s.users,
      place: s.nested.place,
    }),
    (s) => s.hallo,
  )
  return (
    <ul>
      <div>FunctionSelecrot</div>
      <li>users: {usersAndPlace.users.map((u, i) => i + ':' + u.name).join('\t')}</li>
      <li>place:{usersAndPlace.place.join('->')}</li>
      <li>hallo: {hallo}</li>
    </ul>
  )
}

function StringPathAndFunctionSelector() {
  console.log(StringPathAndFunctionSelector.name, 'render')

  const [users1Name, place0, dispatch] = Store.useState('users.1.name', (s) => s.nested.place[0])
  return (
    <ul>
      <div>StringPathAndFunctionSelector</div>
      <li>users.1.name: {users1Name}</li>
      <li>place0: {place0}</li>
    </ul>
  )
}

function Textarea() {
  const [state, dispatch] = Store.useState() // get all state
  const onBlur = (e) => dispatch((draft) => Object.assign(draft, JSON.parse(e.target.innerHTML)))
  return <pre contentEditable onBlur={onBlur} dangerouslySetInnerHTML={{ __html: JSON.stringify(state, null, 2) }} />
}

function ComplexDemo() {
  console.log(ComplexDemo.name, 'render')
  return (
    <div>
      <h1>ComplexDemo</h1>
      <StringPathSelector />
      <FunctionSelector />
      <StringPathAndFunctionSelector />
      <button onClick={() => Store.dispatch((draft) => draft.count++)}>click to increment count</button>
      <button onClick={() => Store.dispatch((draft) => draft.users.reverse())}>click to reverse users</button>
      <Textarea />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<ComplexDemo />)
```

# Installation

```sh
npm i immer-external-store
```

```sh
yarn add immer-external-store
```

```sh
pnpm add immer-external-store
```

# API

## `createImmerExternalStore`

A store must be created before using. `createImmerExternalStore` accept two types of parameters for `initialState`, and return store instance.

1. If received common object

   ```ts
   import { createImmerExternalStore } from 'immer-external-store'
   const instance = createImmerExternalStore(YourStateObject)
   ```

2. If received function or async/await promise, will be executed and updated nextTick, it means there is "undefined" before update.
   <a href="https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/AsyncDemo" target="_blank">AsyncDemo</a>

   ```ts
   import { createImmerExternalStore } from 'immer-external-store'
   const instance1 = createImmerExternalStore(() => YourStateObject)

   const instance2 = createImmerExternalStore(async () => YourStateObject)
   ```

## `useState`

Determine the return tuple according to the input parameters, `[...state, dispatch]`.

1.  If received empty, return full-state and dispatch

    ```ts
    const [fullState, dispatch] = instance.useState()
    ```

2.  If received `DotPath` string rest, return value rest and dispatch

    ```ts
    const [firstName, lastName, dispatch] = instance.useState('path.to.first.name', 'path.to.last.name')
    ```

3.  If received `Selector` function rest, return selected rest and dispatch

    ```ts
    const [firstName, lastName, dispatch] = instance.useState(
      (fullstate) => fullstate.firstName,
      (fullstate) => fullstate.LastName,
    )
    ```

## `dispatch`

It is based `immer.produce`, . [if you don't know what immer is, this way please](https://immerjs.github.io/immer/produce/#example)

```ts
instance.dispatch((draft) => draft.count++) // do anything you want, recommend this way

instance.dispatch({ count: 11 }) // based Object.assign, only 1 depth
```

```ts
instance.dispatch(async (draft) => {
  await Promise.resolve() // support async/await
  draft.hallo = 'world'
})
```

```ts
// unlike immer, it is not possible to perform state replace by return value. only revise draft is effective
instance.dispatch((draft) => ({ hallo: 'world' }))
```

## `getSnapshot`

Return full state

```ts
store.getSnapshot()
```

## `refresh`

Refresh whole state, the `initialState` is used by default. PS: you can give a new initialState if you want

```ts
store.refresh() // store.refresh(anotherInitialState)
```

# Contributing

If you find a bug, please [create an issue](https://github.com/wangzishun/immer-external-store/issues/new) providing instructions to reproduce it. It's always very appreciable if you find the time to fix it. In this case, please [submit a PR](https://github.com/wangzishun/immer-external-store/pulls).

If you're a beginner, extremely grateful for your attention and contribution.

When working on this codebase, please use `pnpm`. Run `yarn examples` to run examples.

# License

MIT © [wangzishun](https://github.com/wangzishun)
