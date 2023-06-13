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
