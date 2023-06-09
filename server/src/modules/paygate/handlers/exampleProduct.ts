import createHttpError from 'http-errors';
import type { Request, Response } from 'express';
import { toNumber } from 'lodash';

import { uuid } from '@/utils/uuid';
import type { PaddleOrderFulfillmentWebhookPayload } from '@/datasources/paddle/types';
import type { ProductWebhookHandler } from '../types';
import { config } from '@/globals/config';

const getPaddleOrderFulfillmentEarningsInCents = (
  payload: PaddleOrderFulfillmentWebhookPayload,
) => {
  // Sanity check earnings JSON
  const earningsData = JSON.parse(payload.p_earnings) as Record<string, string>;
  const earnings = earningsData[config.paygatePaddleVendorId ?? ''] ?? '';
  if (!earnings) {
    throw createHttpError(
      422,
      'Unprocessable Entity - Earnings data does not include correct vendor ID',
    );
  }
  return toNumber(earnings || 0) * 100;
};

/**
 * Webhook handlers for specific Paddle product(s).
 *
 * Example: When purchased, generate a redeem code, store it in DB,
 * and send it back Paddle, so that customer receives it and can use
 * it for something later on.
 */
export const exampleProductWebhookHandler = {
  /**
   * When a product is purchased,
   * This handler should stores the data in DB, and create a license
   * code that customer can use to redeem the purchase.
   */
  order_fulfillment: async (
    req: Request,
    res: Response,
    payload: PaddleOrderFulfillmentWebhookPayload,
  ) => {
    const licenseCode = uuid(16);

    // TODO - Your logic here, e.g. save the purchase transaction to DB
    //
    // const prisma = new PrismaClient();
    // const transactionId = payload.transactionId ?? uuid(16);
    // const saleNet = getPaddleOrderFulfillmentEarnings(payload);
    // const createPurchaseTnxPromise = prisma.productPurchaseTransaction.create({
    //   data: {
    //     ...
    //   },
    // });
    //

    // Response with the redeem code that user will be sent that they
    // can use to redeem the vote.
    res.status(200).json(licenseCode);
  },
} satisfies ProductWebhookHandler;
