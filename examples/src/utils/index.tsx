import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { produce, produceWithPatches, enablePatches, Draft } from 'immer'

enablePatches()

import { EventEmitter, useEventEmitter } from './useEventEmitter'
import { shallowEqual } from './shallowEqual'

type DispatchRecipe<S> = (recipe: (draft: Draft<S>) => any) => void
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never

const next = (state, selector) => {
  if (selector) {
    return selector(state)
  } else {
    return state
  }
}

export function createEventContext<S extends Object>(initialState: S) {
  const CONTEXT = createContext({} as EventEmitter<S>)

  const Provider = ({ children }) => {
    const event$ = useEventEmitter(initialState)

    return <CONTEXT.Provider value={event$}>{children}</CONTEXT.Provider>
  }

  function useConsumer(): [S, DispatchRecipe<S>]
  function useConsumer<Selector extends (v: S) => any>(selector?: Selector): [Unpacked<Selector>, DispatchRecipe<S>]
  function useConsumer(selector?) {
    const event$ = useContext(CONTEXT)

    const [state, setState] = useState(() => next(event$.state, selector))

    event$.useSubscription((newState, patchesPath) => {
      const nextState = next(newState, selector)

      if (!shallowEqual(state, nextState)) {
        setState(nextState)
      }
    })

    const dispatch = useRef((recipe) => {
      console.clear()
      const [nextState, patches] = produceWithPatches(event$.state, (draft) => {
        recipe(draft)
      })

      const patchesPath = patches.map((p) => p.path)

      event$.emit(nextState, patchesPath)
    })

    return [state, dispatch.current] as const
  }

  return {
    Provider,
    useConsumer,
  }
}
