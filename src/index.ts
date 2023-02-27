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

type Listener = (...args: any[]) => any

type Initial = Object | (() => Object) | (() => Promise<Object>)
type UnpackInitial<I> = I extends () => Promise<infer R> ? R : I extends () => infer R ? R : I

const thenableHelper = (func, callback) => {
  const result = func()
  if (result && typeof result.then === 'function') {
    result.then(callback)
  } else {
    callback(result)
  }
}

export function createImmerExternalStore<Init extends Initial, S extends UnpackInitial<Init>>(initial: Init) {
  if (!initial) {
    throw new Error('initial state is required')
  }

  let STATE = {}

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
      } else {
        Object.assign(draft, recipeOrPartial)
      }
    })

    new Set(listeners).forEach((sub) => sub())
  }

  if (typeof initial === 'function') {
    thenableHelper(initial, dispatch)
  }

  const getSnapshot = () => STATE

  const selectorImplement = (selectors) => {
    if (!selectors?.length) return [STATE]

    return selectors.map((sel) => {
      // if (typeof sel === 'function') return sel(STATE)
      let picker = sel

      if (typeof sel === 'string') {
        picker = getters.get(sel)
        if (!picker) {
          picker = new Function('o', `return o["${sel.split('.').join('"]["')}"];`)
          getters.set(sel, picker)
        }
      }

      try {
        return picker(STATE)
      } catch (error) {
        return undefined
      }
    })
  }

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

  function getState(): [S]
  function getState<Sels extends Selectors<S>>(...sels: [...Sels]): [...UnpackSelectors<Sels, S>]
  function getState(...selector) {
    return selectorImplement(selector)
  }
  function replace(next) {}

  return { useState, dispatch, subscribe, getSnapshot, getState, replace }
}

export default createImmerExternalStore
