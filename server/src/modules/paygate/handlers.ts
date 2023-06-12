import createHttpError from 'http-errors';

import { config } from '@/globals/config';
import { createPaddleWebhookHandler } from '@/lib/paddleWebhook/handler';
import type { PaddleEvent, PaddleEventHandler } from '@/lib/paddleWebhook/types';
import type { PaddleOrderFulfillmentWebhookPayload } from '../../datasources/paddle/types';
import type { PaddleProduct, ProductWebhookHandler } from './types';
import { exampleProductWebhookHandler } from './handlers/exampleProduct';

/** All Paddle order fulfillment webhook handlers defined in one place */
const productWebhookHandlers = {
  EXAMPLE_PRODUCT: exampleProductWebhookHandler,
} satisfies Record<PaddleProduct, ProductWebhookHandler>;

/** All Paddle webhook handlers defined in one place */
// NOTE: The event handlers are decided based on custom field `eventType`
// that's defined by us in the Pebble UI.
const eventHandlers = {
  /**
   * When a product is purchased, the order fulfillment webhook handler
   * should 1) save the data in DB, 2) respond with a license code that
   * customer can use to redeem their purchase.
   */
  order_fulfillment: async (req, res, payload: PaddleOrderFulfillmentWebhookPayload) => {
    // `productType` is our custom field set in Paddle UI that decides
    // how the event will be handled
    const productType = payload.productType as PaddleProduct;
    const productOrderFulfillmentHandler = productWebhookHandlers[productType ?? '']?.order_fulfillment; // prettier-ignore

    if (!productType) {
      throw createHttpError(422, `Unprocessable Entity - Unknown product type "${productType}"`); // prettier-ignore
    } else if (!productOrderFulfillmentHandler) {
      throw createHttpError(422, `Unprocessable Entity - Product type "${productType}" does not support event order_fulfillment`); // prettier-ignore
    }
    await productOrderFulfillmentHandler(req, res, payload as any);
  },
} satisfies Record<PaddleEvent, PaddleEventHandler<any>>;

export const paddleWebhookHandler = createPaddleWebhookHandler({
  publicKey: config.paygatePaddlePublicKey ?? '',
  eventHandlers,
});
