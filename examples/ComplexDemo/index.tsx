import React from 'react'
import ReactDOM from 'react-dom/client'
import { createImmerExternalStore } from 'immer-external-store'

const Store = createImmerExternalStore(() => {
  return {
    count: 0,
    hallo: 'hallo-world',
    users: [{ name: 'luffy' }, { name: 'mingo' }, { name: 'zoro' }],
    nested: {
      place: ['Skypiea', 'Water7', 'Fishman Island', 'Dressrosa', 'Shabondy'],
    },
  }
})

function StringPathSelector() {
  console.log(StringPathSelector.name, 'render')

  const [hallo, count, users1Name, dispatch] = Store.useState('hallo', 'count', 'users.1.name')
  return (
    <ul>
      <div>StringPathSelector</div>
      <li>hallo: {hallo}</li>
      <li>count: {count}</li>
      <li>users.1.name: {users1Name}</li>
    </ul>
  )
}

function FunctionSelector() {
  console.log(FunctionSelector.name, 'render')

  const [usersAndPlace, hallo, dispatch] = Store.useState(
    (s) => ({
      users: s.users,
      place: s.nested.place,
    }),
    (s) => s.hallo,
  )
  return (
    <ul>
      <div>FunctionSelecrot</div>
      <li>users: {usersAndPlace.users.map((u, i) => i + ':' + u.name).join('\t')}</li>
      <li>place:{usersAndPlace.place.join('->')}</li>
      <li>hallo: {hallo}</li>
    </ul>
  )
}

function StringPathAndFunctionSelector() {
  console.log(StringPathAndFunctionSelector.name, 'render')

  const [users1Name, place0, dispatch] = Store.useState('users.1.name', (s) => s.nested.place[0])
  return (
    <ul>
      <div>StringPathAndFunctionSelector</div>
      <li>users.1.name: {users1Name}</li>
      <li>place0: {place0}</li>
    </ul>
  )
}

function Textarea() {
  const [state, dispatch] = Store.useState() // get all state
  const onBlur = (e) => dispatch((draft) => Object.assign(draft, JSON.parse(e.target.innerHTML)))
  return <pre contentEditable onBlur={onBlur} dangerouslySetInnerHTML={{ __html: JSON.stringify(state, null, 2) }} />
}

function ComplexDemo() {
  console.log(ComplexDemo.name, 'render')
  return (
    <div>
      <h1>ComplexDemo</h1>
      <StringPathSelector />
      <FunctionSelector />
      <StringPathAndFunctionSelector />
      <button onClick={() => Store.dispatch((draft) => draft.count++)}>click to increment count</button>
      <button onClick={() => Store.dispatch((draft) => draft.users.reverse())}>click to reverse users</button>
      <Textarea />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<ComplexDemo />)
