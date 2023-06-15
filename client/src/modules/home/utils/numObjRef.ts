const minmax = (v: number, min = -Infinity, max = Infinity) => {
  if (min > max)
    throw Error('Invalid min-max range - min cannot be greater than max');
  return Math.max(Math.min(v, max), min);
};

/** Reactive object with numeric values. */
export const numObjRef = <T extends Record<string, number>>(
  initValue?: Partial<T>,
  options?: {
    defaultValue?: number;
    integer?: boolean;
    min?: number;
    max?: number;
  },
) => {
  const objRef: Ref<Partial<T>> = ref(initValue ?? {});
  const defaultValue = options?.defaultValue ?? 0;

  const get = (key: keyof T) => {
    return (objRef.value as T)[key] ?? defaultValue;
  };

  const set = (key: keyof T, value: number) => {
    const newObj = { ...(objRef.value ?? {}) } as Partial<T>;
    const clippedValue = minmax(value, options?.min, options?.max);
    const clippedRoundedVal = options?.integer
      ? Math.floor(clippedValue)
      : clippedValue;
    newObj[key] = clippedRoundedVal as T[keyof T];
    objRef.value = newObj;
  };

  const adjust = (key: keyof T, adjustBy: number) => {
    const newVal = get(key) + adjustBy;
    set(key, newVal);
    return newVal;
  };

  return {
    ref: objRef,
    set,
    get,
    adjust,
  };
};
