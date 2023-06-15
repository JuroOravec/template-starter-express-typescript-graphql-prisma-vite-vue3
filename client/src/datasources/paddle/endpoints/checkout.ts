import type { MaybePromise } from '~~/src/utils/types';
import type { PaddleCheckoutSuccessEvent } from '../types';

export const openCheckout = (input: {
  productId: string;
  quantity?: number;
  onSuccess: (e: PaddleCheckoutSuccessEvent) => MaybePromise<void>;
  onClose?: () => MaybePromise<void>;
}) => {
  // See https://developer.paddle.com/reference/5e0171ec215eb-checkout-parameters
  // See https://developer.paddle.com/guides/ZG9jOjI1MzU0MDQz-pass-parameters-to-the-checkout
  return new Promise<PaddleCheckoutSuccessEvent | null>((res) =>
    (globalThis as any).Paddle.Checkout.open({
      product: input.productId,
      quantity: input.quantity ?? 1,
      successCallback: async (payload: PaddleCheckoutSuccessEvent) => {
        await input.onSuccess(payload);
        res(payload);
      },
      closeCallback: async () => {
        await input.onClose?.();
        res(null);
      },
      // loadCallback
      // method: 'overlay',
    })
  );
};
