import type { Handler } from 'express';
import createError from 'http-errors';

import { logger } from '@/modules/core/lib/logger';
import { config } from '@/modules/core/lib/config';
import { verifyPaddleWebhook } from './utils/verifyPaddleWebhook';
import type {
  PaddleOrderFulfillmentWebhookPayload,
  PaddleWebhookPayload,
} from './types/paddle';
import type {
  PaddleEvent,
  PaddleEventHandler,
  PaddleProduct,
  ProductWebhookHandler,
} from './types/types';
import { exampleProductWebhookHandler } from './productHandlers/exampleProduct';

/** All Paddle webhook handlers defined in one place */
const productWebhookHandlers = {
  // TODO: Replace with your products
  productA: exampleProductWebhookHandler,
  // productB: ...
} satisfies Record<PaddleProduct, ProductWebhookHandler>;

// Common pathway for all Pebble events before we send them to event- and product-specific
// functions.
export const paddleWebhookHandler: Handler = async (req, res, next) => {
  try {
    const payload = req.body as PaddleWebhookPayload;
    const paddleIp = req.ips[0] || req.ip;
    const isAllowed = config.paygateAllowedIps.includes(paddleIp);
    const isSignatureValid = verifyPaddleWebhook(config.paygatePaddlePublicKey!, payload); // prettier-ignore

    logger.info({ paddleIp, isAllowed, isSignatureValid, payload }, `Paddle IP`); // prettier-ignore

    // https://softwareengineering.stackexchange.com/questions/21339
    if (!isAllowed || !isSignatureValid) throw createError(403);

    const eventType = payload?.alert_name;
    const eventHandler = eventHandlers[eventType as keyof typeof eventHandlers];
    if (!eventType) {
      throw createError(422, `Unprocessable Entity - Event type is not set`);
    } else if (!eventHandler) {
      throw createError(422, `Unprocessable Entity - Unknown event type "${eventType}"`); // prettier-ignore
    }

    // Individual event handlers should define response.
    // https://developer.paddle.com/webhook-reference/bd1986c817a40-webhook-reference#responding-to-events
    await eventHandler(req, res, payload as any);
  } catch (err) {
    next(err);
  }
};

// NOTE: The event handlers are decided based on custom field `eventType`
// that's defined by us in the Pebble UI.
const eventHandlers = {
  /**
   * When a product is purchased, the order fulfillment webhook handler
   * should 1) save the data in DB, 2) respond with a license code that
   * customer can use to redeem their purchase.
   */
  order_fulfillment: async (
    req,
    res,
    payload: PaddleOrderFulfillmentWebhookPayload,
  ) => {
    // `productType` is our custom field set in Paddle UI that decides
    // how the event will be handled
    const productType = payload.productType as PaddleProduct;
    const productOrderFulfillmentHandler = productWebhookHandlers[productType!]?.order_fulfillment; // prettier-ignore

    if (!productType) {
      throw createError(422, `Unprocessable Entity - Unknown product type "${productType}"`); // prettier-ignore
    } else if (!productOrderFulfillmentHandler) {
      throw createError(422, `Unprocessable Entity - Product type "${productType}" does not support event order_fulfillment`); // prettier-ignore
    }
    await productOrderFulfillmentHandler(req, res, payload as any);
  },
} satisfies Record<PaddleEvent, PaddleEventHandler<any>>;
