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

export function createImmerExternalStore<Initializer extends Initial<any>, S extends ExtractState<Initializer>>(
  initializer: Initializer,
) {
  let STATE = {} as S

  const listeners = new Set<Listener<S>>()
  const cachedGetters = new Map<string, any>()

  /**
   * update STATE and notify all listeners
   * @param nextState
   */
  function notify(nextState) {
    STATE = nextState
    new Set(listeners).forEach((sub) => sub(STATE))
  }

  function subscribe(listener: Listener<S>) {
    listeners.add(listener)
    return function unsubscribe() {
      listeners.delete(listener)
    }
  }

  /**
   *
   * @param recipeOrPartial recipe function or partial state
   */
  function dispatch(recipeOrPartial: Recipe<S> | Partial<S>) {
    const draft = createDraft(STATE) as any

    if (typeof recipeOrPartial === 'function') {
      return Promise.resolve(recipeOrPartial(draft)).then(() => notify(finishDraft(draft)))
    }

    notify(finishDraft(Object.assign(draft, recipeOrPartial)))
  }

  /**
   * refresh Store, if init is a function, it will be called async with instance
   * @param init
   */
  function refresh(init?: Initializer) {
    init = init || initializer
    if (typeof init === 'function') {
      return Promise.resolve(init(instance)).then(notify)
    }

    notify(init)
  }

  /**
   * support string selector and function selector
   * @param selectors
   */
  function selectorImpl(selectors) {
    if (!selectors || !selectors.length) return [STATE]

    return selectors.map((sel) => {
      let getter = sel

      /**
       * convert string selector to function
       *
       * TODO: cache each constructed function may cause memory overflow or leak
       * sel.split('.').reduce((o, k) => o && o[k], STATE)
       */
      if (typeof sel === 'string') {
        getter = cachedGetters.get(sel)

        if (!getter) {
          getter = new Function('o', `return o["${sel.split('.').join('"]["')}"];`)
          cachedGetters.set(sel, getter)
        }
      }

      try {
        return getter(STATE)
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

  /**
   * a hook to get state's and dispatch
   */
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

  const instance = { useState, dispatch, subscribe, getSnapshot, refresh }

  refresh(initializer) // immediately refresh

  return instance
}

export default createImmerExternalStore
