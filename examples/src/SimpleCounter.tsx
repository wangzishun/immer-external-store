import { createEventContext } from 'react-event-context'

// [1]. create event context
const CounterEvtCtx = createEventContext({
  count: 0,
  hallo: 'hallo-world',
})

// [2]. Button use dispatch to change count
function Button() {
  // null means subscribe nothing, only dispatch
  const [dispatch] = CounterEvtCtx.useConsumer(null)
  const increment = () => {
    dispatch((draft) => {
      draft.count++
    })
  }

  return <button onClick={increment}>count increment</button>
}

// [3]. Count subscribe count, and rerender when count changed
function Count() {
  // subscribe count, with dispatch
  const [count, dispatch] = CounterEvtCtx.useConsumer('count')
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
