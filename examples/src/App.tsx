import { useState } from 'react'
// import { EvtCtx } from './hooks'
import { createEventContext } from './utils'
export const EvtCtx = createEventContext({
  deep: { count: 0, hallo: 'world' },
  shadow: { count: 0, name: { wangzi: 0 } },
  list: [{ name: 1 }],
})

function App() {
  const [count, setCount] = useState(0)
  console.info('render', App.name)

  return (
    <div>
      <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      <hr />
      <EvtCtx.Provider>
        {/* <Hallo name={1}></Hallo> */}
        <Hallo name={2}></Hallo>
        <Counter />
        <Counter2 />
      </EvtCtx.Provider>
    </div>
  )
}

const Hallo = ({ name }) => {
  const [state, dispatch] = EvtCtx.useConsumer()
  console.log('render', Hallo.name + '-' + name)

  return (
    <div>
      <button
        onClick={() =>
          dispatch((s) => {
            s.deep.hallo = Date.now().toString()
          })
        }
      >
        Hallo-{name}-{state.deep.hallo}
      </button>
      <button
        onClick={() =>
          dispatch((s) => {
            s.deep.count++
          })
        }
      >
        Hallo-{name}-count-{state.deep.count}
      </button>
      <button
        onClick={() =>
          dispatch((s) => {
            s.shadow.count++
          })
        }
      >
        Hallo-{name}-shadow-count-{state.shadow.count}
      </button>
      {JSON.stringify(state)}

      <hr />
    </div>
  )
}

const Counter = () => {
  console.log('render', Counter.name)
  const [state, dispatch] = EvtCtx.useConsumer((s) => {
    return { ...s.shadow }
  })

  return (
    <div>
      <button onClick={() => dispatch((s) => s.shadow.name.wangzi++)}>shadow-name-{state.name.wangzi}</button>
      {JSON.stringify(state)}
    </div>
  )
}

const Counter2 = () => {
  console.log('render2', Counter.name)
  const [state, dispatch] = EvtCtx.useConsumer('deep')

  return (
    <div>
      {/* <button onClick={() => dispatch((s) => s.shadow.name.wangzi++)}>shadow-name-{state.name.wangzi}</button> */}
      {JSON.stringify(state)}
    </div>
  )
}

export default App
