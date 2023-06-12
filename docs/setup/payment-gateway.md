# Payment gateway

## Setup

### Paddle

- <https://www.paddle.com/pricing>
- <https://developer.paddle.com/getting-started>

1. Create account

   - <https://developer.paddle.com/getting-started/fa7e86349a4bb-about-your-vendor-account-and-sandbox>

2. Create products

   Overview

   - <https://developer.paddle.com/getting-started/db272eaed8218-about-the-paddle-catalog>
   - <https://developer.paddle.com/getting-started/0b1b4d7350d42-create-a-one-time-product>
   - <https://developer.paddle.com/getting-started/ae9ff2bcf42b1-about-selling-one-time-products-with-paddle>

   API

   - <https://developer.paddle.com/api-reference/8eb39cf89a1ff-product-api>
   - <https://developer.paddle.com/api-reference/0f31bd7cbce47-list-products>

3. Configure webhooks

   Overview

   - <https://developer.paddle.com/getting-started/ef9af9f700849-working-with-paddle-webhooks>
   - <https://developer.paddle.com/webhook-reference/ZG9jOjI1MzUzOTg2-verifying-webhooks>
   - <https://developer.paddle.com/webhook-reference/bd1986c817a40-webhook-reference>

   1. Product Webhook Configuration:

      Follow this tutorial <https://developer.paddle.com/getting-started/89382e1a7d7b8-configure-paddle-webhooks>

      - `Webhook URL` - `https://api.example.com/paygate/webhook/paddle`
      - `Request Method` - `POST`
      - `Separate Multibuy` - `Checkouts produce a single webhook request with a quantity attribute`
      - Custom fields:
        - `alert_name` - `Static Value` - `order_fulfillment`
        - `productType` - `Static Value` - `EXAMPLE_PRODUCT`
        - etc...

      > Our custom fields:
      >
      > `alert_name` - Used for knowing what kind of event we received, since we send all
      > events to the same webhook.
      >
      > - Other Paddle events use `alert_name` field to explain what event (alert) it is.
      >   However, the order fulfillment event is for some reason different, and lacks
      >   `alert_name`. Hence, to normalize the payloads, we add back `alert_name` ourselves.
      >
      > `productType` - Used for knowing what kind of product was purchased.
      >
      > - Needed because different products may trigger different logic on our end.
      > - For convenience, this should be in sync with `ProductType` enum in `schema.prisma`

   2. Tick which events to subscribe to, either as webhook event or as email.

      <https://sandbox-vendors.paddle.com/alerts-webhooks>

   3. Get Paddle public key and save it in Gitlab's CI/CD vars as PADDLE_PUBLIC_KEY(\_PROD/\_DEV)

   4. Find vendor ID in <https://sandbox-vendors.paddle.com/sdk>

4. Testing

   - <https://developer.paddle.com/getting-started/e4f5f125dc72a-test-your-work>

### Stripe

<https://stripe.com/en-sk>

1. Learn about products & prices.

   Overview

   - <https://stripe.com/docs/products-prices/getting-started>
   - <https://stripe.com/docs/products-prices/manage-prices#create-product>
   - <https://www.checkout.com/blog/post/how-to-use-billing-descriptors-to-decrease-chargebacks>

   Examples

   - Pricing models - <https://stripe.com/docs/products-prices/pricing-models#flat-rate>

   API

   - <https://stripe.com/docs/api/products/create?lang=node>
   - <https://stripe.com/docs/api/prices>

2. Learn about checkout process

   Overview

   - <https://stripe.com/docs/checkout/quickstart?lang=node>
   - Pricing table - <https://stripe.com/docs/payments/checkout/pricing-table>

3. Configure payment methods

   Overview

   - <https://stripe.com/docs/payments/dashboard-payment-methods>

4. Learn about fulfillment (process of delivering what customer ordered)

   Overview

   - <https://stripe.com/docs/payments/checkout/fulfill-orders#create-event-handler>

   Examples

   - Helpful guide - <https://dev.to/stripe/purchase-fulfilment-with-checkout-or-wait-what-was-i-paid-for-335d>

   Notes

   - Do NOT support bank transfers / direct debit, as it increases complexity
     - <https://stripe.com/docs/payments/checkout/fulfill-orders#delayed-notification>

   API

   - <https://stripe.com/docs/api/checkout/sessions>

5. Learn about webhooks / events

   - <https://stripe.com/docs/webhooks>
   - <https://stripe.com/docs/webhooks/quickstart>
   - <https://stripe.com/docs/webhooks/stripe-events>
   - <https://dashboard.stripe.com/login?redirect=%2Fevents>
   - All event types - <https://stripe.com/docs/api/events/types>

6. Learn about tax

   Overview

   - <https://stripe.com/docs/tax/products-prices-tax-categories-tax-behavior#setting-a-default-tax-behavior-(recommended)>
   - <https://stripe.com/docs/tax/tax-categories>

7. Other stripe offering

   - Billing - <https://stripe.com/en-sk/billing>
   - Invoicing - <https://stripe.com/en-sk/invoicing>
   - Payments - <https://stripe.com/en-sk/payments/features#wallets>
   - Payment wiring for platforms - <https://stripe.com/en-sk/connect>
   - Customer portal - <https://stripe.com/docs/no-code/customer-portal>

8. Other

   - YouTube examples
     - <https://www.youtube.com/watch?v=48H9aWAxrLM>
