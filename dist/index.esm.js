import { createContext, useRef, createElement, useContext, useState, useEffect } from 'react';
import { produce } from 'immer';

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

const next = (selector, state, getters) => {
    if (!selector?.length)
        return state;
    if (typeof selector[0] === 'function') {
        return selector[0](state);
    }
    if (selector.length) {
        return selector.map((path) => {
            let get = getters.get(path);
            if (!get) {
                get = new Function('o', `return o.${path};`);
                getters.set(path, get);
            }
            return get(state);
        });
    }
    return state;
};
function createEventContext(initialState) {
    const CONTEXT = createContext({});
    const Provider = ({ children }) => {
        const ref = useRef(null);
        if (!ref.current) {
            ref.current = {
                state: initialState,
                subscriptions: new Set(),
                getters: new Map(),
            };
        }
        return createElement(CONTEXT.Provider, { value: ref }, children);
    };
    function useConsumer(...selector) {
        const context$ = useContext(CONTEXT);
        const local = useState(() => next(selector, context$.current.state, context$.current.getters));
        const subscription = useRef();
        subscription.current = () => {
            const nextState = next(selector, context$.current.state, context$.current.getters);
            if (!shallowEqual(local[0], nextState)) {
                local[1](nextState);
            }
        };
        useEffect(() => {
            const subscribe = (v) => subscription.current(v);
            context$.current.subscriptions.add(subscribe);
            return () => {
                context$.current.subscriptions.delete(subscribe);
            };
        }, []);
        const dispatch = useRef((recipe) => {
            const produced = produce(context$.current.state, (draft) => {
                recipe(draft);
            });
            context$.current.state = produced;
            context$.current.subscriptions.forEach((sub) => sub());
        });
        return [local[0], dispatch.current];
    }
    return {
        Provider,
        useConsumer,
    };
}

export { createEventContext };
