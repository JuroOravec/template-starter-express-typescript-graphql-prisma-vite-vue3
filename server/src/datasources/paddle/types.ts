/**
 * Our custom fields on the webhook payload that we use in order
 * to know how to handle the payloads.
 *
 * See https://developer.paddle.com/webhook-reference/da25d9740f4c7-fulfillment-webhook#custom-fields
 */
export interface PaddleWebhookCustomFields {
  /**
   * AKA the event type
   *
   * NOTE: `alert_name` field is present on Paddle events,
   *   except for order fulfillment event. Hence, to normalize
   *   the event handling, the `alert_name` on order fulfillment
   *   event is actually a custom field set by us via Paddle UI.
   */
  alert_name?: string;
  /**
   * This is our custom field set via Paddle UI that decides
   * how the event will be handled.
   */
  productType?: string;
}

/** Paddle's minimum webhook payload. */
export interface PaddleWebhookPayload extends PaddleWebhookCustomFields {
  p_signature: string;
}

/**
 * Paddle's order fullfilment webhook payload.
 *
 * See https://developer.paddle.com/webhook-reference/da25d9740f4c7-fulfillment-webhook#payload
 */
export interface PaddleOrderFulfillmentWebhookPayload
  extends PaddleWebhookPayload,
    PaddleOrderFulfillmentWebhookPayloadCustomFields {
  /** E.g. `51898` */
  p_product_id: number;
  /** E.g. `41.99` */
  p_price: number;
  /** E.g. `'US'` */
  p_country: string;
  /** E.g. `'USD'` */
  p_currency: string;
  /** E.g. `41.99` */
  p_sale_gross: number;
  /** E.g. `0` */
  p_tax_amount: number;
  /** E.g. `2.6` */
  p_paddle_fee: number;
  /** E.g. `0` */
  p_coupon_savings: number;
  /** E.g. `'{"12438":"39.3900"}'` */
  p_earnings: string;
  /** E.g. `631381` */
  p_order_id: number;
  /** E.g. `''` */
  p_coupon: string;
  /** E.g. `true` */
  p_used_price_override: boolean;
  /** E.g. `null` */
  p_custom_data?: string;
  /** E.g. `'Example passthrough'` */
  passthrough: string;
  /** E.g. `1` */
  p_quantity: number;
  /** E.g. `1` */
  quantity: number;
  marketing_consent?: '0' | '1';
  /** E.g. `'2023-05-21 08:16:26'` */
  event_time: string;
}

/**
 * These are fields which Paddle doesn't include on the order
 * fulfillment event by default, but they can be selected to be
 * included.
 *
 * We added these fields via Paddle UI in https://sandbox-vendors.paddle.com/fulfillment/webhook/<productID>
 *
 * See https://developer.paddle.com/webhook-reference/da25d9740f4c7-fulfillment-webhook#custom-fields
 */
export interface PaddleOrderFulfillmentWebhookPayloadCustomFields {
  /** E.g. `'725622c9744d48bd9019e796b03405b3'` */
  transactionId?: string;
  /** E.g. `'27835673-chre93c81118fc7-b3092639c1'` */
  checkoutId?: string;
  /** E.g. `'bd29ac138152d457e0962eaa2e078e6f'` */
  messageId?: string;
  customerName?: string;
  customerEmail?: string;
}
