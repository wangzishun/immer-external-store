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
