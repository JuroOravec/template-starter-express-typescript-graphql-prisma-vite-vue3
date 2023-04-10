import { fromPairs, sortBy } from "lodash";

export const sortObjectBy = <T extends object>(
    obj: T,
    byFunc: (key: keyof T, value: T[keyof T]) => any
): T => fromPairs(sortBy(
  Object.entries(obj),
  ([key, value]) => byFunc(key as keyof T, value),
)) as T;
