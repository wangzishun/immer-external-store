'use strict';

var immer = require('immer');
var withSelector = require('use-sync-external-store/shim/with-selector');

/**
 *
 * @see https://github.com/facebook/react/blob/64acd3918a26d92773d3dd451a735603ef50d3a7/packages/shared/shallowEqual.js#L18
 * @see https://github.com/dashed/shallowequal/blob/master/index.js
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
const shallowEqual = (state, nextState) => {
    if (Object.is(state, nextState)) {
        return true;
    }
    if (typeof state !== 'object' || !state || typeof nextState !== 'object' || !nextState) {
        return false;
    }
    const keysA = Object.keys(state);
    const keysB = Object.keys(nextState);
    if (keysA.length !== keysB.length) {
        return false;
    }
    const bHasOwnProperty = hasOwnProperty.bind(nextState);
    for (let idx = 0; idx < keysA.length; idx++) {
        const key = keysA[idx];
        if (!bHasOwnProperty(key) || !Object.is(state[key], nextState[key])) {
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
    const dispatch = (recipe) => {
        const produced = immer.produce(state, (draft) => {
            recipe(draft);
        });
        state = produced;
        listeners.forEach((sub) => sub());
    };
    const selector = (sel) => {
        if (!sel?.length)
            return state;
        if (sel[0] === null) {
            return null;
        }
        if (typeof sel[0] === 'function') {
            return sel[0](state);
        }
        if (sel.length) {
            return sel.map((path) => {
                let finder = getters.get(path);
                if (!finder) {
                    finder = new Function('o', `return o.${path.replace(/.(\d+)./, '[$1].')};`);
                    getters.set(path, finder);
                }
                return finder(state);
            });
        }
        return state;
    };
    return {
        subscribe,
        getSnapshot: () => state,
        dispatch,
        selector,
    };
};
function createEventContext(initialState) {
    const store = createStore(initialState);
    function useConsumer(...sel) {
        const local = withSelector.useSyncExternalStoreWithSelector(store.subscribe, store.getSnapshot, store.getSnapshot, (s) => store.selector(sel), shallowEqual);
        if (sel[0] === null) {
            return [store.dispatch];
        }
        return [local, store.dispatch];
    }
    return {
        useConsumer,
    };
}

exports.createEventContext = createEventContext;
