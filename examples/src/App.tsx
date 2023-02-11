import { useState } from 'react'
import { createEventContext } from './utils'

export const EvtCtx = createEventContext({
  deep: { count: 0, hallo: 'world' },
  shadow: { count: 0, name: { wangzi: 0 } },
})

function App() {
  const [count, setCount] = useState(0)
  console.info('render', App.name)

  return (
    <div>
      <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      <EvtCtx.Provider>
        {/* <Hallo name={1}></Hallo> */}
        <Hallo name={2}></Hallo>
        <SimpleCounter />
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

      <hr />
      {JSON.stringify(state)}

      {/* <textarea readOnly value={JSON.stringify(state, null, 1)} style={{ height: '20vh' }}></textarea> */}
    </div>
  )
}

const SimpleCounter = () => {
  console.log('render', SimpleCounter.name)
  const [state, dispatch] = EvtCtx.useConsumer((s) => {
    return {
      ...s.shadow,
    }
  })

  const [count, setCount] = useState(1)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>counter{count}</button>
      <button onClick={() => dispatch((s) => s.shadow.name.wangzi++)}>shadow-name-{state.name.wangzi}</button>
      {JSON.stringify(state)}
    </div>
  )
}

export default App
