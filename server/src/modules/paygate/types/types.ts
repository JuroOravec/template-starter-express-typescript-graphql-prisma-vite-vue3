import type { Request, Response } from 'express';

import { ArrVal, MaybePromise, enumFromArray } from '@/modules/core/utils/types';
import type {
  PaddleOrderFulfillmentWebhookPayload,
  PaddleWebhookPayload,
} from './paddle';

const PADDLE_EVENTS = ['order_fulfillment'] as const;
/** All paddle webhook events we handle */
export type PaddleEvent = ArrVal<typeof PADDLE_EVENTS>;
export const PaddleEventEnum = enumFromArray(PADDLE_EVENTS);

const PADDLE_PRODUCTS = ['productA', /* 'productB' */ ] as const;
/** All paddle products for which we handle webhook events */
export type PaddleProduct = ArrVal<typeof PADDLE_PRODUCTS>;

/** Function that handles a Paddle webhook event */
export type PaddleEventHandler<TPayload extends PaddleWebhookPayload> = (
  req: Request,
  res: Response,
  payload: TPayload,
) => MaybePromise<void>;

/** All webhook event handlers relating to a specific product */
export interface ProductWebhookHandler<TCustomFields extends object = any> {
  [PaddleEventEnum.order_fulfillment]: PaddleEventHandler<
    PaddleOrderFulfillmentWebhookPayload & TCustomFields
  >;
};
