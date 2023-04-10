import { ref, Ref } from 'vue';

/**
 * Convert an async function into a composable that tracks
 * when the function is in progress / failed / finished.
 */
export const useAsync = <TArgs extends any[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>,
  options: { defaultValue: TResult },
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
