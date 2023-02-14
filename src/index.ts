import { produce } from 'immer'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import { arrayShallowEqual } from './shallowEqual'
import { Path, PathValue } from './types'

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

  const dispatch: DispatchRecipe<S> = (recipe) => {
    state = produce(state, (draft) => {
      recipe(draft as any)
    })

    listeners.forEach((sub) => sub())
  }

  const selectorImplement = (selectors) => {
    if (!selectors?.length) return [state]

    return selectors.map((sel) => {
      if (typeof sel === 'function') {
        return sel(state)
      }

      if (typeof sel === 'string') {
        let finder = getters.get(sel)
        if (!finder) {
          finder = new Function('o', `return o["${sel.split('.').join('"]["')}"];`)
          getters.set(sel, finder)
        }
        return finder(state)
      }

      return null
    })
  }

  return {
    subscribe,
    getSnapshot: () => state,
    dispatch,
    selectorImplement,
  }
}

export function createImmerExternalStore<S extends Object>(initialState: S) {
  const { subscribe, getSnapshot, selectorImplement, dispatch } = createStore(initialState)

  function useState(): [S, DispatchRecipe<S>]
  function useState<FuncSel extends (v: S) => any, PathSel extends Path<S>, Sels extends Array<FuncSel | PathSel>>(
    ...sels: [...Sels]
  ): [
    ...{
      [K in keyof Sels]: Sels[K] extends FuncSel
        ? Unpacked<Sels[K]>
        : Sels[K] extends PathSel
        ? PathValue<S, Sels[K]>
        : never
    },
    DispatchRecipe<S>,
  ]

  function useState(...selectors) {
    const local = useSyncExternalStoreWithSelector(
      subscribe,
      getSnapshot,
      getSnapshot,
      () => selectorImplement(selectors),
      arrayShallowEqual,
    )

    return [...local, dispatch] as const
  }

  return {
    useState,
    dispatch,
  }
}
