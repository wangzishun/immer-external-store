# immer-external-store

A tiny \ faster \ easier react state manager, based immer and useSyncExternalStore, provide two kinds of selector and friendly typescript support.

<a href="https://npmjs.org/package/immer-external-store">
  <img alt="NPM version" src="https://img.shields.io/npm/v/immer-external-store.svg?style=flat-square">
</a>
<a href="https://npmjs.org/package/immer-external-store">
  <img alt="NPM downloads" src="https://img.shields.io/npm/dm/immer-external-store.svg?style=flat-square">
</a>

[![CI](https://github.com/wangzishun/immer-external-store/actions/workflows/ci.yml/badge.svg)](https://github.com/wangzishun/immer-external-store/actions/workflows/ci.yml)

# Summary

- [immer-external-store](#immer-external-store)
- [Summary](#summary)
- [Quick start with two examples](#quick-start-with-two-examples)
  - [Simple Counter example](#simple-counter-example)
  - [Advanced example](#advanced-example)
- [Installation](#installation)
- [API](#api)
  - [`createImmerExternalStore`](#createimmerexternalstore)
  - [`useState`](#usestate)
  - [`dispatch`](#dispatch)
- [Contributing](#contributing)
- [License](#license)

# Quick start with two examples

## Simple Counter example

```tsx
import { createImmerExternalStore } from 'immer-external-store'

// [1]. create store
const CounterStore = createImmerExternalStore({
  count: 0,
  list: ['hallo!', 'bro', 'and', 'sis'],
})

// [2]. selector what you want
function Count() {
  console.log(Count.name, 'render')

  const [count, list, dispatch] = CounterStore.useState('count', (s) => s.list)
  return (
    <>
      <li>count: {count}</li>
      <li>list: {list.join(' ')}</li>
    </>
  )
}

// [3]. dispatch as immer draft
export default function SimpleCounter() {
  console.log(SimpleCounter.name, 'render')
  return (
    <ul>
      <Count />
      <button onClick={() => CounterStore.dispatch((draft) => draft.count++)}>count increment</button>
    </ul>
  )
}
```

## Advanced example

```tsx
import { createImmerExternalStore } from 'immer-external-store'

const AdStore = createImmerExternalStore({
  count: 0,
  hallo: 'hallo-world',
  users: [{ name: 'luffy' }, { name: 'mingo' }, { name: 'zoro' }],
  nested: {
    place: ['Skypiea', 'Water7', 'Fishman Island', 'Dressrosa', 'Shabondy'],
  },
})

function StringPathSelector() {
  console.log(StringPathSelector.name, 'render')

  const [hallo, count, users1Name, dispatch] = AdStore.useState('hallo', 'count', 'users.1.name')
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

  const [usersAndPlace, hallo, dispatch] = AdStore.useState(
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

  const [users1Name, place0, dispatch] = AdStore.useState('users.1.name', (s) => s.nested.place[0])
  return (
    <ul>
      <div>StringPathAndFunctionSelector</div>
      <li>users.1.name: {users1Name}</li>
      <li>place0: {place0}</li>
    </ul>
  )
}

function Textarea() {
  const [state, dispatch] = AdStore.useState() // get all state
  const onBlur = (e) => dispatch((draft) => Object.assign(draft, JSON.parse(e.target.innerHTML)))
  return <pre contentEditable onBlur={onBlur} dangerouslySetInnerHTML={{ __html: JSON.stringify(state, null, 2) }} />
}

export default function AdvancedCounter() {
  console.log(AdvancedCounter.name, 'render')
  return (
    <div>
      <StringPathSelector />
      <FunctionSelector />
      <StringPathAndFunctionSelector />
      <button onClick={() => AdStore.dispatch((draft) => draft.count++)}>click to increment count</button>
      <button onClick={() => AdStore.dispatch((draft) => draft.users.reverse())}>click to reverse users</button>
      <Textarea />
    </div>
  )
}
```

# Installation

```sh
npm i immer immer-external-store
```

```sh
yarn add immer immer-external-store
```

```sh
pnpm add immer immer-external-store
```

# API

## `createImmerExternalStore`

A store must be created before using.

```ts
import { createImmerExternalStore } from 'immer-external-store'
const store = createImmerExternalStore(YourStateObject) // { useState, dispatch }
```

## `useState`

Determine the return tuple according to the input parameters, `[...state, dispatch]`.

1.  If receives empty, return full-state and dispatch

    ```ts
    const [fullState, dispatch] = store.useState()
    ```

2.  If receives `DotPath` string rest, return value rest and dispatch

    ```ts
    const [firstName, lastName, dispatch] = store.useState('path.to.first.name', 'path.to.last.name')
    ```

3.  If receives `Selector` function rest, return selected rest and dispatch

    ```ts
    const [firstName, lastName, dispatch] = store.useState(
      (fullstate) => fullstate.firstName,
      (fullstate) => fullstate.LastName,
    )
    ```

## `dispatch`

It is based on `immer.produce`. [if you don't know what immer is, this way please](https://immerjs.github.io/immer/produce/#example)

```ts
dispatch((draft) => draft.count++) // do anything you want
```

```ts
// unlike immer, it is not possible to perform state replace by return value. only revise draft is effective
dispatch((draft) => ({ hallo: 'world' }))
```

# Contributing

If you find a bug, please [create an issue](https://github.com/wangzishun/immer-external-store/issues/new) providing instructions to reproduce it. It's always very appreciable if you find the time to fix it. In this case, please [submit a PR](https://github.com/wangzishun/immer-external-store/pulls).

If you're a beginner, extremely grateful for your attention and contribution.

When working on this codebase, please use `pnpm`. Run `yarn examples` to run examples.

# License

MIT © [wangzishun](https://github.com/wangzishun)
