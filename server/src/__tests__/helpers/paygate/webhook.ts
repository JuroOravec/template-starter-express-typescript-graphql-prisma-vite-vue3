import fetch from 'node-fetch';

import { uuid } from '../../../utils/uuid';

export const createPaddleOrderFulfillmentPayload = () => {
  const quantity = Math.floor(Math.random() * 4);

  const payload = {
    p_product_id: 51898,
    p_price: 20,
    p_country: 'US',
    p_currency: 'USD',
    p_sale_gross: 20,
    p_tax_amount: 0,
    p_paddle_fee: 1.5,
    p_coupon_savings: 0,
    p_earnings: '{"12438":"18.5000"}',
    p_order_id: Math.floor(Math.random() * 100000), // Random 6-digit number
    p_coupon: '',
    p_used_price_override: true,
    p_custom_data: null,
    passthrough: 'Example passthrough',
    transactionId: uuid(32),
    messageId: uuid(32),
    customerName: 'Juro Oravec',
    customerEmail: 'name@email.com',
    alert_name: 'order_fulfillment',
    checkoutId: '1477149-chrec6228117d2e-d331c5d31c',
    voteValue: '1',
    productType: 'EXAMPLE_PRODUCT',
    marketing_consent: false,
    p_quantity: quantity,
    quantity,
    event_time: '2023-05-28 19:10:21',
  };

  return payload;
};

export const sendPaddleOrderFulfillmentEvent = async (input?: any) => {
  const payload = input || createPaddleOrderFulfillmentPayload();

  const body = JSON.stringify(payload);
  return fetch('http://localhost:3000/paygate/webhook/paddle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length.toString(),
    },
    body,
  })
    .then(async (res) => {
      console.log(res);
      const data = await res.json();
      console.dir(data, { depth: 6 });
      return data;
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
