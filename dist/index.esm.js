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

var PromiseResolve = Promise.resolve;
function createImmerExternalStore(initialState) {
  var STATE = {};
  var listeners = new Set();
  var getters = new Map();
  function notify(nextState) {
    STATE = nextState;
    new Set(listeners).forEach(function (sub) {
      return sub();
    });
  }
  function subscribe(listener) {
    listeners.add(listener);
    return function () {
      return listeners["delete"](listener);
    };
  }
  function dispatch(recipeOrPartial) {
    var draft = createDraft(STATE);
    if (typeof recipeOrPartial === 'function') {
      return PromiseResolve(recipeOrPartial(draft)).then(function () {
        return notify(finishDraft(draft));
      });
    }
    notify(finishDraft(Object.assign(draft, recipeOrPartial)));
  }
  function refresh(init) {
    init = init || initialState;
    if (typeof init === 'function') {
      return PromiseResolve(init()).then(notify);
    }
    notify(init);
  }
  function selectorImpl(selectors) {
    if (!selectors || !selectors.length) return [STATE];
    return selectors.map(function (sel) {
      var picker = sel; // as function selector
      if (typeof sel === 'string') {
        picker = getters.get(sel);
        if (!picker) {
          picker = new Function('o', "return o[\"".concat(sel.split('.').join('"]["'), "\"];"));
          getters.set(sel, picker);
        }
      }
      try {
        return picker(STATE);
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
  refresh(initialState); // immediately refresh
  return {
    useState: useState,
    dispatch: dispatch,
    subscribe: subscribe,
    getSnapshot: getSnapshot,
    refresh: refresh
  };
}

export { createImmerExternalStore, createImmerExternalStore as default };
