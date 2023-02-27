import React from 'react'
import ReactDOM from 'react-dom/client'
import { createImmerExternalStore } from 'immer-external-store'

// [1]. async/await for initial state
const Store = createImmerExternalStore(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    nested: {
      count: 0,
      list: ['hallo!', 'bro', 'and', 'sis'],
    },
  }
})

// [2]. returns "undefined" on error selector;
// PS: declare your async functions with "Partial" if want a friendly reminder
function Count() {
  const [count, list, dispatch] = Store.useState('nested.count', (s) => s.nested.list)
  console.log(Count.name, 'render', 'count: ', count, '; list: ', list)

  return (
    <>
      <li>count: {count}</li>
      <li>list: {list?.join(' ')}</li>
    </>
  )
}

// [3]. dispatch also support async/await
function SimpleCounterDemo() {
  console.log(SimpleCounterDemo.name, 'render')
  return (
    <ul>
      <h1>SimpleCounterDemo</h1>
      <Count />
      <button
        onClick={() =>
          Store.dispatch(async (draft) => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            draft.nested.count++
          })
        }
      >
        count increment
      </button>
    </ul>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<SimpleCounterDemo />)
