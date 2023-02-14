import { produce } from 'immer'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import { shallowEqual } from './shallowEqual'
import { FieldPathValues, Path } from './types'

type DispatchRecipe<S> = (recipe: (draft: S) => any) => any
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never

type Listener = (...args: any[]) => void

const createStore = <S extends Object>(initialState: S) => {
  let state = initialState

  const listeners = new Set<Listener>()
  const getters = new Map<string, any>()

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const dispatch = (recipe) => {
    const produced = produce(state, (draft) => {
      recipe(draft)
    })

    state = produced
    listeners.forEach((sub) => sub())
  }

  const selector = (sel) => {
    if (!sel?.length) return state

    if (sel[0] === null) {
      return null
    }

    if (typeof sel[0] === 'function') {
      return sel[0](state)
    }

    if (sel.length) {
      return sel.map((path) => {
        let finder = getters.get(path)
        if (!finder) {
          finder = new Function('o', `return o.${path.replace(/.(\d+)./, '[$1].')};`)
          getters.set(path, finder)
        }

        return finder(state)
      })
    }

    return state
  }

  return {
    subscribe,
    getSnapshot: () => state,
    dispatch,
    selector,
  }
}

export function createImmerExternalStore<S extends Object>(initialState: S) {
  const store = createStore(initialState)

  function useConsumer(): [S, DispatchRecipe<S>]
  function useConsumer<Selector extends null>(sel: null): [DispatchRecipe<S>]
  function useConsumer<Selector extends (v: S) => any>(sel?: Selector): [Unpacked<Selector>, DispatchRecipe<S>]
  function useConsumer<P extends Path<S>[]>(...sel: readonly [...P]): [[...FieldPathValues<S, P>], DispatchRecipe<S>]

  function useConsumer(...sel) {
    const local = useSyncExternalStoreWithSelector(
      store.subscribe,
      store.getSnapshot,
      store.getSnapshot,
      (s) => store.selector(sel),
      shallowEqual,
    )

    if (sel[0] === null) {
      return [store.dispatch] as const
    }

    return [local, store.dispatch] as const
  }

  return {
    useConsumer,
  }
}
