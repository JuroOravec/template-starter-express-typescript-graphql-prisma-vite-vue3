import createError from 'http-errors';
import { toNumber } from 'lodash';

import type { PaddleOrderFulfillmentWebhookPayload } from '../types/paddle';
import { config } from '../../core/lib/config';

export const getPaddleOrderFulfillmentEarnings = (
  payload: PaddleOrderFulfillmentWebhookPayload,
) => {
  // Sanity check earnings JSON
  const earningsData = JSON.parse(payload.p_earnings) as Record<string, string>;
  const earnings = earningsData[config.paygatePaddleVendorId!] ?? '';
  if (!earnings) {
    throw createError(
      422,
      'Unprocessable Entity - Earnings data does not include correct vendor ID',
    );
  }
  return toNumber(earnings || 0);
};
