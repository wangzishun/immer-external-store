import { createDraft, finishDraft } from 'immer';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

/**
 *
 * @see https://github.com/facebook/react/blob/64acd3918a26d92773d3dd451a735603ef50d3a7/packages/shared/shallowEqual.js#L18
 * @see https://github.com/dashed/shallowequal/blob/master/index.js
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function shallowEqual(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== 'object' || !a || typeof b !== 'object' || !b) {
    return false;
  }
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  var bHasOwnProperty = hasOwnProperty.bind(b);
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];
    if (!bHasOwnProperty(key) || !Object.is(a[key], b[key])) {
      return false;
    }
  }
  return true;
}
function arrayShallowEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (var idx = 0; idx < a.length; idx++) {
    if (!shallowEqual(a[idx], b[idx])) {
      return false;
    }
  }
  return true;
}

function createImmerExternalStore(initializer) {
  var STATE = {};
  var listeners = new Set();
  var cachedGetters = new Map();
  /**
   * update STATE and notify all listeners
   * @param nextState
   */
  function notify(nextState) {
    STATE = nextState;
    new Set(listeners).forEach(function (sub) {
      return sub(STATE);
    });
  }
  function subscribe(listener) {
    listeners.add(listener);
    return function unsubscribe() {
      listeners["delete"](listener);
    };
  }
  /**
   *
   * @param recipeOrPartial recipe function or partial state
   */
  function dispatch(recipeOrPartial) {
    var draft = createDraft(STATE);
    if (typeof recipeOrPartial === 'function') {
      return Promise.resolve(recipeOrPartial(draft)).then(function () {
        return notify(finishDraft(draft));
      });
    }
    notify(finishDraft(Object.assign(draft, recipeOrPartial)));
  }
  /**
   * refresh Store, if init is a function, it will be called async with instance
   * @param init
   */
  function refresh(init) {
    init = init || initializer;
    if (typeof init === 'function') {
      return Promise.resolve(init(instance)).then(notify);
    }
    notify(init);
  }
  /**
   * support string selector and function selector
   * @param selectors
   */
  function selectorImpl(selectors) {
    if (!selectors || !selectors.length) return [STATE];
    return selectors.map(function (sel) {
      var getter = sel;
      /**
       * convert string selector to function
       *
       * TODO: cache each constructed function may cause memory overflow or leak
       * sel.split('.').reduce((o, k) => o && o[k], STATE)
       */
      if (typeof sel === 'string') {
        getter = cachedGetters.get(sel);
        if (!getter) {
          getter = new Function('o', "return o[\"".concat(sel.split('.').join('"]["'), "\"];"));
          cachedGetters.set(sel, getter);
        }
      }
      try {
        return getter(STATE);
      } catch (error) {
        return undefined;
      }
    });
  }
  function getSnapshot() {
    return STATE;
  }
  function useState() {
    var args = arguments;
    return useSyncExternalStoreWithSelector(subscribe, getSnapshot, getSnapshot, function () {
      return selectorImpl(Array.from(args));
    }, arrayShallowEqual).concat(dispatch);
  }
  var instance = {
    useState: useState,
    dispatch: dispatch,
    subscribe: subscribe,
    getSnapshot: getSnapshot,
    refresh: refresh
  };
  refresh(initializer); // immediately refresh
  return instance;
}

export { createImmerExternalStore, createImmerExternalStore as default };
