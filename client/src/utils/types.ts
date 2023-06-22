import type { PageMeta } from 'nuxt/app';

export type ArrVal<T extends any[] | readonly any[]> = T[number];

export const enumFromArray = <T extends readonly any[]>(arr: T) => {
  return arr.reduce((agg, key) => {
    agg[key] = key;
    return agg;
  }, {}) as { [Key in ArrVal<T>]: Key };
};

export type MaybePromise<T> = T | Promise<T>;

export type PartialFields<TObj, TKeys extends keyof TObj> = Omit<TObj, TKeys> &
  Partial<Pick<TObj, TKeys>>;

export type Flattened<T> = T extends Array<infer U> ? Flattened<U> : T;

export type RouteItem<TName extends string = string> = PageMeta &
  Required<Pick<PageMeta, 'path' | 'layout'>> & { name: TName };
