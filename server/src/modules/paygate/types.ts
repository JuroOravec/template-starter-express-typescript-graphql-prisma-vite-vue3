import { ProductType } from '@prisma/client';

import type { ArrVal } from '@/utils/types';
import type { PaddleEventEnum, PaddleEventHandler } from '@/lib/paddleWebhook/types';
import type { PaddleOrderFulfillmentWebhookPayload } from '../../datasources/paddle/types';

const PADDLE_PRODUCTS = Object.values(ProductType) as (keyof typeof ProductType)[];
/** All paddle products for which we handle webhook events */
export type PaddleProduct = ArrVal<typeof PADDLE_PRODUCTS>;

/** All webhook event handlers relating to a specific product */
export interface ProductWebhookHandler<TCustomFields extends object = any> {
  [PaddleEventEnum.order_fulfillment]: PaddleEventHandler<
    PaddleOrderFulfillmentWebhookPayload & TCustomFields
  >;
}
