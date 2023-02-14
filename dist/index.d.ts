import { Path, PathValue } from './types';
type DispatchRecipe<S> = (recipe: (draft: S) => any) => any;
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never;
export declare function createImmerExternalStore<S extends Object>(initialState: S): {
    useState: {
        (): [S, DispatchRecipe<S>];
        <FuncSel extends (v: S) => any, PathSel extends Path<S>, Sels extends (FuncSel | PathSel)[]>(...sels_0: Sels): [...{ [K in keyof Sels]: Sels[K] extends FuncSel ? Unpacked<Sels[K]> : Sels[K] extends PathSel ? PathValue<S, Sels[K]> : never; }, DispatchRecipe<S>];
    };
    dispatch: DispatchRecipe<S>;
};
export {};
