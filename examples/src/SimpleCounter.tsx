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
