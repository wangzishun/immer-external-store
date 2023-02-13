/// <reference types="react" />
import { FieldPathValues, Path } from './types';
type DispatchRecipe<S> = (recipe: (draft: S) => any) => void;
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never;
type Subscription = (...args: any[]) => void;
type ContextRef<S> = {
    state: S;
    subscriptions: Set<Subscription>;
    getters: Map<string, (state: S) => any>;
};
export declare function createEventContext<S extends Object>(initialState: S): {
    Provider: ({ children }: {
        children: any;
    }) => import("react").FunctionComponentElement<import("react").ProviderProps<{
        current: ContextRef<S>;
    }>>;
    useConsumer: {
        (): [S, DispatchRecipe<S>];
        <Selector extends null>(sel: null): [DispatchRecipe<S>];
        <Selector_1 extends (v: S) => any>(sel?: Selector_1 | undefined): [Unpacked<Selector_1>, DispatchRecipe<S>];
        <P extends Path<S>[]>(...sel_0: P): [[...{ [K in keyof P]: import("./types").PathValue<S, P[K] & Path<S>>; }], DispatchRecipe<S>];
    };
};
export {};
