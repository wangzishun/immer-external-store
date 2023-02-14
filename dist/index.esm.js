import { produce } from 'immer';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';

/**
 *
 * @see https://github.com/facebook/react/blob/64acd3918a26d92773d3dd451a735603ef50d3a7/packages/shared/shallowEqual.js#L18
 * @see https://github.com/dashed/shallowequal/blob/master/index.js
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
const shallowEqual = (a, b) => {
    if (Object.is(a, b)) {
        return true;
    }
    if (typeof a !== 'object' || !a || typeof b !== 'object' || !b) {
        return false;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }
    const bHasOwnProperty = hasOwnProperty.bind(b);
    for (let idx = 0; idx < keysA.length; idx++) {
        const key = keysA[idx];
        if (!bHasOwnProperty(key) || !Object.is(a[key], b[key])) {
            return false;
        }
    }
    return true;
};
const arrayShallowEqual = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    for (let idx = 0; idx < a.length; idx++) {
        if (!shallowEqual(a[idx], b[idx])) {
            return false;
        }
    }
    return true;
};

const createStore = (initialState) => {
    let state = initialState;
    const listeners = new Set();
    const getters = new Map();
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    const dispatch = (recipeOrPartial) => {
        state = produce(state, (draft) => {
            if (typeof recipeOrPartial === 'function') {
                recipeOrPartial(draft);
            }
            Object.assign(draft, recipeOrPartial);
        });
        listeners.forEach((sub) => sub());
    };
    const selectorImplement = (selectors) => {
        if (!selectors?.length)
            return [state];
        return selectors.map((sel) => {
            if (typeof sel === 'function') {
                return sel(state);
            }
            if (typeof sel === 'string') {
                let finder = getters.get(sel);
                if (!finder) {
                    finder = new Function('o', `return o["${sel.split('.').join('"]["')}"];`);
                    getters.set(sel, finder);
                }
                return finder(state);
            }
            return null;
        });
    };
    return {
        subscribe,
        getSnapshot: () => state,
        dispatch,
        selectorImplement,
    };
};
function createImmerExternalStore(initialState) {
    const { subscribe, getSnapshot, selectorImplement, dispatch } = createStore(initialState);
    function useState(...selectors) {
        const local = useSyncExternalStoreWithSelector(subscribe, getSnapshot, getSnapshot, () => selectorImplement(selectors), arrayShallowEqual);
        return [...local, dispatch];
    }
    return {
        useState,
        dispatch,
    };
}

export { createImmerExternalStore };
