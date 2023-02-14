import { createImmerExternalStore } from 'immer-external-store'

const CounterStore = createImmerExternalStore({
  count: 0,
  hallo: 'hallo-world',
  list: [{ name: 'luffy' }, { name: 'mingo' }, { name: 'zoro' }],
  nested: {
    place: ['Skypiea', 'Water7', 'Fishman Island', 'Dressrosa', 'Shabondy'],
  },
})

// use `StringPath` subscribe multiple state
function Count() {
  console.log(Count.name)

  // try ts intellicense on `StringPath` `data`
  const [state, dispatch] = CounterStore.useConsumer('hallo', 'count', 'list.2.name')
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}

function Increment() {
  console.log(Increment.name)
  const [dispatch] = CounterStore.useConsumer(null)
  const increment = () => dispatch((draft) => draft.count++) // dispatch based on immer.produce

  return <button onClick={increment}>click to increment count</button>
}

// use `Selector` to subscribe partial state
function OnePiece() {
  console.log(OnePiece.name)

  // try ts intellicense on `state` `data`
  const [data, dispatch] = CounterStore.useConsumer((state) => ({
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
  console.log(OnePieceSorter.name)
  const [dispatch] = CounterStore.useConsumer(null)
  return <button onClick={() => dispatch((draft) => draft.list.reverse())}>click to reverse list</button>
}

// subscribe all state
function AllState() {
  console.log(AllState.name)

  const [state] = CounterStore.useConsumer()
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}

export default function AdvancedCounter() {
  return (
    <div>
      <Count />
      <Increment />
      <OnePiece />
      <OnePieceSorter />
      <AllState />
    </div>
  )
}
