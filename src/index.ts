import { produce } from 'immer'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import { arrayShallowEqual } from './shallowEqual'
import { Path, PathValue } from './types'

type Recipe<S> = (draft: S) => any
type Dispatch<S> = (recipeOrPartial: Recipe<S> | Partial<S>) => any
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never

type FuncSel<S> = (v: S) => any
type PathSel<S> = Path<S>
type Selectors<S> = Array<FuncSel<S> | PathSel<S>>

type UnpackSelector<Sel, S> = Sel extends FuncSel<S>
  ? Unpacked<Sel>
  : Sel extends PathSel<S>
  ? PathValue<S, Sel>
  : never

type UnpackSelectors<Sels, S> = { [K in keyof Sels]: UnpackSelector<Sels[K], S> }

type Listener = (...args: any[]) => void

const createStore = <S extends Object>(initialState: S) => {
  let STATE = initialState

  const listeners = new Set<Listener>()
  const getters = new Map<string, any>()

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const dispatch: Dispatch<S> = (recipeOrPartial) => {
    STATE = produce(STATE, (draft: any) => {
      if (typeof recipeOrPartial === 'function') {
        recipeOrPartial(draft)
      }
      Object.assign(draft, recipeOrPartial)
    })

    // ;[...listeners].forEach((sub) => sub())
    listeners.forEach((sub) => sub())
  }

  const selectorImplement = (selectors) => {
    if (!selectors?.length) return [STATE]

    return selectors.map((sel) => {
      if (typeof sel === 'function') {
        return sel(STATE)
      }

      if (typeof sel === 'string') {
        let finder = getters.get(sel)
        if (!finder) {
          finder = new Function('o', `return o["${sel.split('.').join('"]["')}"];`)
          getters.set(sel, finder)
        }
        return finder(STATE)
      }

      return null
    })
  }

  function get(): [S]
  function get<Sels extends Selectors<S>>(...sels: [...Sels]): [...UnpackSelectors<Sels, S>]
  function get(...selector) {
    return selectorImplement(selector)
  }

  function replace(nextStateOrReplaceRecipe: S | ((draft: S) => S)) {
    if (typeof nextStateOrReplaceRecipe === 'function') {
      STATE = produce(STATE, nextStateOrReplaceRecipe)
    } else {
      STATE = nextStateOrReplaceRecipe
    }
  }

  return {
    subscribe,
    getSnapshot: () => STATE,
    dispatch,
    selectorImplement,
    get,
    replace,
  }
}

export function createImmerExternalStore<S extends Object>(initialState: S) {
  const { subscribe, getSnapshot, selectorImplement, dispatch, get, replace } = createStore(initialState)

  function useState(): [S, Dispatch<S>]
  function useState<Sels extends Selectors<S>>(...sels: [...Sels]): [...UnpackSelectors<Sels, S>, Dispatch<S>]
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

  return { useState, dispatch, get, replace }
}
