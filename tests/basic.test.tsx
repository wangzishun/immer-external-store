import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { createImmerExternalStore } from '../src'

const genState = () => {
  return {
    count: 0,
    stringArray: ['hallo!', 'bro', 'and', 'sis'],
    objectArray: [{ id: 1 }, { id: 2 }, { id: 3 }],
    deepObject: { a: { b: { c: { d: 1 } } } },
  }
}

test('get full state', () => {
  const Store = createImmerExternalStore(genState())

  const App = () => {
    const [state] = Store.useState()
    return <div>{JSON.stringify(state)}</div>
  }

  const app = render(<App />)
  expect(app.getByText(JSON.stringify(genState()))).toBeDefined()
})

test('a simple counter increment', () => {
  const Store = createImmerExternalStore(genState())

  let btnRenderCount = 0

  const Increment = () => {
    return (
      <button aria-label="Button" onClick={() => Store.dispatch((draft) => draft.count++)}>
        {btnRenderCount++}
      </button>
    )
  }

  const Count = () => {
    const [state, dispatch] = Store.useState()
    return <div aria-label="Count">{state.count}</div>
  }

  const app = render(
    <>
      <Increment />
      <Count />
    </>,
  )

  const btn = app.getByLabelText('Button')
  const count = app.getByLabelText('Count')

  fireEvent.click(btn)
  expect(count.innerHTML).toBe('1')
  fireEvent.click(btn)
  expect(count.innerHTML).toBe('2')
})

test('counter string path selector', () => {
  const Store = createImmerExternalStore(genState())

  const StringPath = () => {
    const [count, deepObjectABCD, objectArray1Id, dispatch] = Store.useState(
      'count',
      'deepObject.a.b.c.d',
      'objectArray.1.id',
    )
    return (
      <ul>
        <li aria-label="count">{count}</li>
        <li aria-label="deepObject.a.b.c.d">{deepObjectABCD}</li>
        <li aria-label="objectArray.1.id">{objectArray1Id}</li>
      </ul>
    )
  }

  const app = render(<StringPath />)

  expect(app.getByLabelText('count').innerHTML).toBe('0')
  expect(app.getByLabelText('deepObject.a.b.c.d').innerHTML).toBe('1')
  expect(app.getByLabelText('objectArray.1.id').innerHTML).toBe('2')
})

test('counter string path selector', () => {
  const Store = createImmerExternalStore(genState())

  const StringPath = () => {
    const [count, deepObjectABCD, objectArray1Id, dispatch] = Store.useState(
      (s) => s.count,
      (s) => s.deepObject.a.b.c.d,
      (s) => s.objectArray[1].id,
    )
    return (
      <ul>
        <li aria-label="count">{count}</li>
        <li aria-label="deepObject.a.b.c.d">{deepObjectABCD}</li>
        <li aria-label="objectArray.1.id">{objectArray1Id}</li>
      </ul>
    )
  }

  const app = render(<StringPath />)

  expect(app.getByLabelText('count').innerHTML).toBe('0')
  expect(app.getByLabelText('deepObject.a.b.c.d').innerHTML).toBe('1')
  expect(app.getByLabelText('objectArray.1.id').innerHTML).toBe('2')
})
