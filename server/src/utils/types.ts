import { fromPairs } from 'lodash';

export type ArrVal<T extends any[] | readonly any[]> = T[number];

export const enumFromArray = <T extends readonly any[]>(arr: T) => {
  return fromPairs(arr.map((k) => [k, k])) as { [Key in ArrVal<T>]: Key };
};

export type Nil = null | undefined;

export type MaybePromise<T> = T | Promise<T>;

/** Like Partial<T>, but values can be `undefined` AND ALSO `null` */
export type PartialNil<T> = { [P in keyof T]?: T[P] | Nil };

export type PartialFields<TObj, TKeys extends keyof TObj> = Omit<TObj, TKeys> &
  Partial<Pick<TObj, TKeys>>;

export type SubType<Base, Condition> = Pick<
  Base,
  {
    [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
  }[keyof Base]
>;
