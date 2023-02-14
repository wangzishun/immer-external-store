import { Path, PathValue } from './types';
type Recipe<S> = (draft: S) => any;
type Dispatch<S> = (recipeOrPartial: Recipe<S> | Partial<S>) => any;
type Unpacked<T> = T extends (...args: any[]) => infer R ? R : never;
export declare function createImmerExternalStore<S extends Object>(initialState: S): {
    useState: {
        (): [S, Dispatch<S>];
        <FuncSel extends (v: S) => any, PathSel extends Path<S>, Sels extends (FuncSel | PathSel)[]>(...sels_0: Sels): [...{ [K in keyof Sels]: Sels[K] extends FuncSel ? Unpacked<Sels[K]> : Sels[K] extends PathSel ? PathValue<S, Sels[K]> : never; }, Dispatch<S>];
    };
    dispatch: Dispatch<S>;
};
export {};
