# immer-external-store

<div align="center">

一个更简单的 react 状态管理器，基于 immer 和 useSyncExternalStore，提供两种选择器以及友好的 typescript 类型支持。

[English](./readme.zh-CN.md) · 简体中文

<a href="https://npmjs.org/package/immer-external-store">
  <img alt="NPM version" src="https://badgen.net/npm/v/immer-external-store">
</a>
<a href="https://npmjs.org/package/immer-external-store">
  <img alt="NPM downloads" src="https://badgen.net/npm/dm/immer-external-store">
</a>

</div>

# 所有的栗子

- [**SimpleCounterDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/SimpleCounterDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/SimpleCounterDemo/index.tsx)

- [**ComplexDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/ComplexDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/ComplexDemo/index.tsx)

- [**AsyncDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/AsyncDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/AsyncDemo/index.tsx)

- [**TodoUndoRedoDemo codesandbox**](https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/TodoUndoRedoDemo): [Source](https://github.com/wangzishun/immer-external-store/tree/master/examples/TodoUndoRedoDemo/index.tsx)

# Summary

- [immer-external-store](#immer-external-store)
- [所有的栗子](#所有的栗子)
- [Summary](#summary)
- [两个例子快速上手](#两个例子快速上手)
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

# 两个例子快速上手

## <a href="https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/SimpleCounterDemo" target="_blank">SimpleCounterDemo</a>

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createImmerExternalStore } from 'immer-external-store'

// [1]. 创建 store
const Store = createImmerExternalStore({
  count: 0,
  list: ['hallo!', 'bro', 'and', 'sis'],
  increment: () => Store.dispatch((draft) => draft.count++),
})

// [2]. 使用 useState 并选择你想要的状态
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

// [3]. 通过 dispatch 来修改状态，类似 immer 的 produce
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

使用前必须先创建 store。`createImmerExternalStore` 接受两种类型的参数，并返回 store 实例。

1. 如果接收到的是一个普通对象

   ```ts
   import { createImmerExternalStore } from 'immer-external-store'
   const instance = createImmerExternalStore(YourStateObject)
   ```

2. 如果接收到的是一个函数或者异步函数，会在下一次 tick 时执行，也就是说在更新前会有一个 undefined 的状态。
   <a href="https://codesandbox.io/s/github/wangzishun/immer-external-store/tree/master/examples/AsyncDemo" target="_blank">AsyncDemo</a>

   ```ts
   import { createImmerExternalStore } from 'immer-external-store'
   const instance1 = createImmerExternalStore(() => YourStateObject)

   const instance2 = createImmerExternalStore(async () => YourStateObject)
   ```

## `useState`

根据输入参数的不同，返回不同的元组，`[...state, dispatch]`。设计上尽量保持和 `React.useState` 一致。

1.  如果没有传入参数，返回整个状态和 dispatch

    ```ts
    const [fullState, dispatch] = instance.useState()
    ```

2.  如果传入的是字符串，会根据 `.` 来访问具体路径，然后返回对应的值和 dispatch

    ```ts
    const [firstName, lastName, dispatch] = instance.useState('path.to.first.name', 'path.to.last.name')
    ```

3.  如果传入的是函数，会将整个状态作为参数传入，返回函数的返回值和 dispatch

    ```ts
    const [firstName, lastName, dispatch] = instance.useState(
      (fullstate) => fullstate.firstName,
      (fullstate) => fullstate.LastName,
    )
    ```

## `dispatch`

基于 immer 的 produce，[如果你不知道 immer 是什么，这里请看](https://immerjs.github.io/immer/produce/#example)

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

返回当前的状态快照，不会触发组件更新

```ts
store.getSnapshot()
```

## `refresh`

刷新整个状态，如果不传入参数，会使用初始化时的 initialState。PS：你可以传入一个新的 initialState

```ts
store.refresh() // store.refresh(anotherInitialState)
```

# Contributing

If you find a bug, please [create an issue](https://github.com/wangzishun/immer-external-store/issues/new) providing instructions to reproduce it. It's always very appreciable if you find the time to fix it. In this case, please [submit a PR](https://github.com/wangzishun/immer-external-store/pulls).

If you're a beginner, extremely grateful for your attention and contribution.

When working on this codebase, please use `pnpm`. Run `yarn examples` to run examples.

# License

MIT © [wangzishun](https://github.com/wangzishun)
