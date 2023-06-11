import type { Request, Response } from 'express';

import { ArrVal, MaybePromise, enumFromArray } from '@/utils/types';
import type { PaddleWebhookPayload } from '../../datasources/paddle/types';

const PADDLE_EVENTS = ['order_fulfillment'] as const;
/** All paddle webhook events we handle */
export type PaddleEvent = ArrVal<typeof PADDLE_EVENTS>;
export const PaddleEventEnum = enumFromArray(PADDLE_EVENTS);

/** Function that handles a Paddle webhook event */
export type PaddleEventHandler<TPayload extends PaddleWebhookPayload> = (
  req: Request,
  res: Response,
  payload: TPayload,
) => MaybePromise<void>;
