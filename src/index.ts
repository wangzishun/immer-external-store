import { createContext, createElement, useContext, useEffect, useRef, useState } from 'react'
import { produce } from 'immer'

import { shallowEqual } from './shallowEqual'
import { FieldPathValues, Path } from './types'

type DispatchRecipe<S> = (recipe: (draft: S) => any) => void
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never

type Subscription = (...args: any[]) => void
type ContextRef<S> = { state: S; subscriptions: Set<Subscription>; getters: Map<string, (state: S) => any> }

const next = (selector, state, getters) => {
  if (!selector?.length) return state

  if (selector[0] === null) {
    return null
  }

  if (typeof selector[0] === 'function') {
    return selector[0](state)
  }

  if (selector.length) {
    return selector.map((path) => {
      let get = getters.get(path)
      if (!get) {
        get = new Function('o', `return o.${path.replace(/.(\d+)./, '[$1].')};`)
        getters.set(path, get)
      }

      return get(state)
    })
  }

  return state
}

export function createEventContext<S extends Object>(initialState: S) {
  const CONTEXT = createContext({} as { current: ContextRef<S> })

  const Provider = ({ children }) => {
    const ref = useRef(null as unknown as ContextRef<S>)

    if (!ref.current) {
      ref.current = {
        state: initialState,
        subscriptions: new Set(),
        getters: new Map(),
      }
    }

    return createElement(CONTEXT.Provider, { value: ref }, children)
  }

  function useConsumer(): [S, DispatchRecipe<S>]
  function useConsumer<Selector extends null>(sel: null): [DispatchRecipe<S>]
  function useConsumer<Selector extends (v: S) => any>(sel?: Selector): [Unpacked<Selector>, DispatchRecipe<S>]
  function useConsumer<P extends Path<S>[]>(...sel: readonly [...P]): [[...FieldPathValues<S, P>], DispatchRecipe<S>]

  function useConsumer(...selector) {
    const context$ = useContext(CONTEXT)

    const local = useState(() => next(selector, context$.current.state, context$.current.getters))

    const subscription = useRef<Subscription>()

    subscription.current = () => {
      const nextState = next(selector, context$.current.state, context$.current.getters)
      if (!shallowEqual(local[0], nextState)) {
        local[1](nextState)
      }
    }

    useEffect(() => {
      const subscribe = (v) => subscription.current!(v)

      context$.current.subscriptions.add(subscribe)
      return () => {
        context$.current.subscriptions.delete(subscribe)
      }
    }, [])

    const dispatch = useRef((recipe) => {
      const produced = produce(context$.current.state, (draft) => {
        recipe(draft)
      })

      context$.current.state = produced
      context$.current.subscriptions.forEach((sub) => sub())
    })

    if (selector[0] === null) {
      return [dispatch.current] as const
    }

    return [local[0], dispatch.current] as const
  }

  return {
    Provider,
    useConsumer,
  }
}
