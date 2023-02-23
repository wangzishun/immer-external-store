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
export declare function createImmerExternalStore<S extends Object>(initialState: S): {
    useState: {
        (): [S, Dispatch<S>];
        <Sels extends Selectors<S>>(...sels_0: Sels): [...UnpackSelectors<Sels, S>, Dispatch<S>];
    };
    dispatch: Dispatch<S>;
    get: {
        (): [S];
        <Sels_1 extends Selectors<S>>(...sels_0: Sels_1): [...UnpackSelectors<Sels_1, S>];
    };
    replace: (nextStateOrReplaceRecipe: S | ((draft: S) => S)) => void;
};
export default createImmerExternalStore;
