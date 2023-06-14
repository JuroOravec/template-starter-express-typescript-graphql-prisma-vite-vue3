import { ref, Ref } from 'vue';

import type { MaybePromise } from './types';

/** @param {number} ms Number of ms to wait */
export const wait = (ms?: number) => new Promise((res) => setTimeout(res, ms));

export const serialAsyncMap = async <T, R>(
  inputArr: T[],
  fn: (item: T, index: number) => MaybePromise<R>
) => {
  const results = await inputArr.reduce(async (aggResultPromise, input, index) => {
    const agg = await aggResultPromise;
    const result = await fn(input, index);
    agg.push(result);
    return agg;
  }, Promise.resolve([] as R[]));

  return results;
};

/**
 * Promise that can be resolved or rejected from outside the Promise constructor
 * via functions.
 */
export const deferredPromise = <TVal>() => {
  let resolve: (val: TVal) => void = null as any;
  let reject: (reason?: any) => void = null as any;

  const promise = new Promise<TVal>((res, rej) => {
    resolve = (val: TVal) => res(val);
    reject = (reason?: any) => rej(reason);
  });
  return { resolve, reject, promise };
};

/**
 * Convert an async function into a composable that tracks
 * when the function is in progress / failed / finished.
 */
export const useAsync = <TArgs extends any[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>,
  options: { defaultValue: TResult }
) => {
  const { defaultValue } = options || {};

  const isLoading: Ref<boolean> = ref(false);
  const error: Ref<null | Error | string> = ref(null);
  const value = ref(defaultValue) as Ref<TResult>;

  const call = async (...args: TArgs) => {
    if (isLoading.value) return;
    isLoading.value = true;
    error.value = null;

    await asyncFn(...args)
      .then((res) => {
        value.value = res;
      })
      .catch((err) => {
        error.value = err;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  return {
    call,
    isLoading,
    error,
    value,
  };
};
