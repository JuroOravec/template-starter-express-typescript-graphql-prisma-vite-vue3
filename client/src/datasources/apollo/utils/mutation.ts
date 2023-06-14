import type {
  MutateOverrideOptions,
  MutateResult,
  UseMutationReturn,
} from '@vue/apollo-composable';

type OnResultFn<TRes, TVars> = (
  res: Awaited<MutateResult<TRes>>,
  ctx: {
    vars?: TVars | null;
    options?: MutateOverrideOptions<TRes>;
    mutation: UseMutationReturn<TRes, TVars>;
  }
) => void;

type OnErrorFn<TRes, TVars> = (
  err: any,
  ctx: {
    vars?: TVars | null;
    options?: MutateOverrideOptions<TRes>;
    mutation: UseMutationReturn<TRes, TVars>;
  }
) => void;

type OnTransform<TRes, TVars, TData> = (
  data: TRes | null,
  ctx: {
    res: Awaited<MutateResult<TRes>>;
    vars?: TVars | null;
    options?: MutateOverrideOptions<TRes>;
    mutation: UseMutationReturn<TRes, TVars>;
  }
) => TData;

const defaultOnResult: OnResultFn<any, any> = (res) => {
  if (res?.errors?.length) throw res.errors[0];
};

const defaultOnError: OnErrorFn<any, any> = (err, { mutation }) => {
  mutation.error.value = err;
};

/**
 * Helper that managed common processing of Apollo mutations.
 * - Look for GraphQL errors (those that don't trigger network error),
 *   and process them as regular errors.
 */
export const prepareMutation = <TRes, TVars, TData>(
  mutation: UseMutationReturn<TRes, TVars>,
  options: {
    onTransform: OnTransform<TRes, TVars, TData>;
    /** Override the default error handling, which looks for GraphQL errors. */
    onResult?: OnResultFn<TRes, TVars>;
    /** Override the default error handling, which looks for GraphQL errors. */
    onError?: OnErrorFn<TRes, TVars>;
  }
) => {
  const onResult = options?.onResult ?? defaultOnResult;
  const onError = options?.onError ?? defaultOnError;
  const onTransform = options.onTransform;

  const mutate = async (
    ...[vars, mutateOptions]: Parameters<UseMutationReturn<TRes, TVars>['mutate']>
  ) => {
    const res =
      (await mutation
        .mutate(vars, mutateOptions)
        .then(async (res) => {
          await onResult(res, { vars, options: mutateOptions, mutation });
          return res;
        })
        .catch(async (err) => {
          await onError(err, { vars, options: mutateOptions, mutation });
        })) ?? null;

    const data = await onTransform(res?.data ?? null, {
      res,
      vars,
      options: mutateOptions,
      mutation,
    });

    return { ...res, data };
  };

  return {
    ...mutation,
    mutate,
  };
};
