import { createDraft, finishDraft } from 'immer'
// import { produce } from 'immer'

import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

import { arrayShallowEqual } from './shallowEqual'
import { Path, PathValue } from './types'

type Recipe<S> = (draft: S) => any
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

type Listener<S> = (state: S) => any

type Initial<T> = Object | ((T) => Object) | ((T) => Promise<Object>)
type ExtractState<I> = I extends () => Promise<infer R> ? R : I extends () => infer R ? R : I

const PromiseResolve = Promise.resolve

export function createImmerExternalStore<Init extends Initial<any>, S extends ExtractState<Init>>(initializer: Init) {
  let STATE = {} as S

  const listeners = new Set<Listener<S>>()
  const getters = new Map<string, any>()

  function notify(nextState) {
    STATE = nextState
    new Set(listeners).forEach((sub) => sub(STATE))
  }

  function subscribe(listener: Listener<S>) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function dispatch(recipeOrPartial: Recipe<S> | Partial<S>) {
    const draft = createDraft(STATE) as any

    if (typeof recipeOrPartial === 'function') {
      return PromiseResolve(recipeOrPartial(draft)).then(() => notify(finishDraft(draft)))
    }

    notify(finishDraft(Object.assign(draft, recipeOrPartial)))
  }

  function refresh(init: Init) {
    init = init || initializer
    if (typeof init === 'function') {
      return PromiseResolve(init(instance)).then(notify)
    }

    notify(init)
  }

  function selectorImpl(selectors) {
    if (!selectors || !selectors.length) return [STATE]

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

  function getSnapshot() {
    return STATE
  }

  // function getState(...selector) {
  //   return selectorImpl(selector)
  // }

  function useState(): [S, typeof dispatch]
  function useState<Sels extends Selectors<S>>(...sels: Sels): [...UnpackSelectors<Sels, S>, typeof dispatch]
  function useState() {
    const args = arguments
    return useSyncExternalStoreWithSelector(
      subscribe,
      getSnapshot,
      getSnapshot,
      () => selectorImpl(Array.from(args)),
      arrayShallowEqual,
    ).concat(dispatch)
  }

  refresh(initializer) // immediately refresh

  const instance = { useState, dispatch, subscribe, getSnapshot, refresh }

  return instance
}

export default createImmerExternalStore
