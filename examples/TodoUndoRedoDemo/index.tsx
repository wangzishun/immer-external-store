import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createImmerExternalStore } from 'immer-external-store'

const requestRemote = () =>
  new Promise((resolve) => setTimeout(resolve, 1000)).then(() => [
    { id: 0, text: 'Wake up' },
    { id: 1, text: 'Sleep' },
  ])

const Store = createImmerExternalStore(async () => {
  return {
    todos: await requestRemote(),
    future: [] as any[],
    past: [] as any[],
    add: (text) =>
      Store.dispatch((draft) => {
        draft.past.push([...draft.todos])

        draft.todos.push({ id: Date.now(), text })
        draft.future = []
      }),
    remove: (id) =>
      Store.dispatch((draft) => {
        draft.past.push([...draft.todos])

        draft.todos = draft.todos.filter((item) => item.id !== id)
        draft.future = []
      }),
    undo: () => {
      Store.dispatch((draft) => {
        const snapshot = draft.past.pop()
        draft.future.unshift(draft.todos)
        draft.todos = snapshot
      })
    },
    redo: () => {
      Store.dispatch((draft) => {
        const snapshot = draft.future.shift()
        draft.past.push(draft.todos)
        draft.todos = snapshot
      })
    },
  }
})

function Todos() {
  const [{ todos, remove }, dispatch] = Store.useState()
  return (
    <ul>
      {todos?.map(({ id, text }) => (
        <li key={id} onClick={() => remove(id)}>
          {text}
        </li>
      ))}
    </ul>
  )
}

function TodoUndoRedoDemo() {
  const text = useRef('')

  const [{ add, undo, redo, past, future }, dispatch] = Store.useState()
  return (
    <ul>
      <h1>TodoUndoRedoDemo</h1>
      <button onClick={undo} disabled={!past?.length}>
        UNDO
      </button>
      <button onClick={redo} disabled={!future?.length}>
        REDO
      </button>
      <button onClick={() => add(text.current)}>ADD</button>
      <input onChange={(evt) => (text.current = evt.target.value)} placeholder="Enter and leave" />
      <Todos />
    </ul>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<TodoUndoRedoDemo />)
