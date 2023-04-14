import { Path, PathValue } from './types';
type Recipe<S> = (draft: S) => any;
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never;
type FuncSel<S> = (v: S) => any;
type PathSel<S> = Path<S>;
type Selectors<S> = Array<FuncSel<S> | PathSel<S>>;
type UnpackSelector<Sel, S> = Sel extends FuncSel<S> ? Unpacked<Sel> : Sel extends PathSel<S> ? PathValue<S, Sel> : never;
type UnpackSelectors<Sels, S> = {
    [K in keyof Sels]: UnpackSelector<Sels[K], S>;
};
type Listener<S> = (state: S) => any;
type Initial<T> = Object | ((T: any) => Object) | ((T: any) => Promise<Object>);
type ExtractState<I> = I extends () => Promise<infer R> ? R : I extends () => infer R ? R : I;
export declare function createImmerExternalStore<Initializer extends Initial<any>, S extends ExtractState<Initializer>>(initializer: Initializer): {
    useState: {
        (): [S, (recipeOrPartial: Recipe<S> | Partial<S>) => Promise<void> | undefined];
        <Sels extends Selectors<S>>(...sels: Sels): [...UnpackSelectors<Sels, S>, (recipeOrPartial: Recipe<S> | Partial<S>) => Promise<void> | undefined];
    };
    dispatch: (recipeOrPartial: Recipe<S> | Partial<S>) => Promise<void> | undefined;
    subscribe: (listener: Listener<S>) => () => void;
    getSnapshot: () => S;
    refresh: (init?: Initializer) => Promise<void> | undefined;
};
export default createImmerExternalStore;
