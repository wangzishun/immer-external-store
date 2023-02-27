import { createDraft, finishDraft } from 'immer'
// import { produce } from 'immer'

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

export function createImmerExternalStore<Init extends Initial, S extends UnpackInitial<Init>>(initialState: Init) {
  let STATE = {} as S

  const listeners = new Set<Listener>()
  const getters = new Map<string, any>()

  const notify = () => new Set(listeners).forEach((sub) => sub())

  const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const dispatch: Dispatch<S> = async (recipeOrPartial) => {
    const draft = createDraft(STATE)

    if (typeof recipeOrPartial === 'function') {
      await recipeOrPartial(draft as any)
    } else {
      Object.assign(draft, recipeOrPartial)
    }

    STATE = finishDraft(draft) as any

    notify()
  }

  const refresh = async (init: Init = initialState) => {
    if (typeof init === 'function') {
      STATE = await init()
    } else {
      STATE = init as any
    }
    notify()
  }

  refresh(initialState) // immediately refresh

  const selectorImpl = (selectors) => {
    if (!selectors?.length) return [STATE]

    return selectors.map((sel) => {
      let picker = sel // as function selector

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

  const getSnapshot = () => STATE

  // function getState(): [S]
  // function getState<Sels extends Selectors<S>>(...sels: [...Sels]): [...UnpackSelectors<Sels, S>]
  // function getState(...selector) {
  //   return selectorImpl(selector)
  // }

  function useState(): [S, Dispatch<S>]
  function useState<Sels extends Selectors<S>>(...sels: [...Sels]): [...UnpackSelectors<Sels, S>, Dispatch<S>]
  function useState() {
    return useSyncExternalStoreWithSelector(
      subscribe,
      getSnapshot,
      getSnapshot,
      () => selectorImpl(Array.from(arguments)),
      arrayShallowEqual,
    ).concat(dispatch)
  }

  return { useState, dispatch, subscribe, getSnapshot, refresh }
}

export default createImmerExternalStore
