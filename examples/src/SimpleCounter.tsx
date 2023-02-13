import { createImmerStore } from 'react-immer-store'

// [1]. create immer store
const CounterImmerStore = createImmerStore({
  count: 0,
  hallo: 'hallo-world',
})

// [2]. dispatch to change count
function Button() {
  console.log(Button.name)

  // null means subscribe nothing, only dispatch
  const [dispatch] = CounterImmerStore.useConsumer(null)
  const increment = () => dispatch((draft) => draft.count++)

  return <button onClick={increment}>count increment</button>
}

// [3]. subscribe count, and rerender when count changed
function Count() {
  console.log(Count.name)

  // subscribe count, with dispatch
  const [count, dispatch] = CounterImmerStore.useConsumer('count')
  return <span>{count}</span>
}

// [4]. subscribe hallo, and rerender when hallo changed
function HalloWorld() {
  console.log('HalloWorld will not rerender when count changed')

  const [hallo, dispatch] = CounterImmerStore.useConsumer('hallo')
  return <b>{hallo}</b>
}

export default function SimpleCounter() {
  return (
    <div>
      <Count />
      <Button />
      <HalloWorld />
    </div>
  )
}
