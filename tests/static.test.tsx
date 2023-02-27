import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'

import { createImmerExternalStore } from '../src'

const genState = () => {
  return {
    count: 0,
    stringArray: ['hallo!', 'bro', 'and', 'sis'],
    objectArray: [{ id: 1 }, { id: 2 }, { id: 3 }],
    deepObject: { a: { b: { c: { d: 1 } } } },
  }
}

test('static method', async () => {
  const state = genState()

  const Store = createImmerExternalStore(genState())

  expect(Store.getSnapshot()).toEqual(state)

  await waitFor(() => {
    Store.dispatch((draft) => {
      draft.count = 100
      draft.stringArray = []
      draft.objectArray.map((o) => (o.id = 100))
      draft.deepObject.a.b.c.d = 100
    })
  })

  expect(Store.getSnapshot()).toEqual({
    count: 100,
    stringArray: [],
    objectArray: [{ id: 100 }, { id: 100 }, { id: 100 }],
    deepObject: { a: { b: { c: { d: 100 } } } },
  })

  await waitFor(() => Store.refresh())

  expect(Store.getSnapshot()).toEqual(state)
})
