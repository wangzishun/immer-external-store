import { Path, PathValue } from './types';
type Recipe<S> = (draft: S) => any;
type Dispatch<S> = (recipeOrPartial: Recipe<S> | Partial<S>) => any;
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never;
type FuncSel<S> = (v: S) => any;
type PathSel<S> = Path<S>;
type Selectors<S> = Array<FuncSel<S> | PathSel<S>>;
type UnpackSelector<Sel, S> = Sel extends FuncSel<S> ? Unpacked<Sel> : Sel extends PathSel<S> ? PathValue<S, Sel> : never;
type UnpackSelectors<Sels, S> = {
    [K in keyof Sels]: UnpackSelector<Sels[K], S>;
};
type Listener = (...args: any[]) => any;
type Initial = Object | (() => Object) | (() => Promise<Object>);
type UnpackInitial<I> = I extends () => Promise<infer R> ? R : I extends () => infer R ? R : I;
export declare function createImmerExternalStore<Init extends Initial, S extends UnpackInitial<Init>>(initialState: Init): {
    useState: {
        (): [S, Dispatch<S>];
        <Sels extends Selectors<S>>(...sels_0: Sels): [...UnpackSelectors<Sels, S>, Dispatch<S>];
    };
    dispatch: Dispatch<S>;
    subscribe: (listener: Listener) => () => boolean;
    getSnapshot: () => S;
    refresh: (init?: Init) => Promise<void>;
};
export default createImmerExternalStore;
