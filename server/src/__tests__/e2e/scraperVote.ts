import { PrismaClient } from '@prisma/client';

import {
  createPaddleOrderFulfillmentPayload,
  sendPaddleOrderFulfillmentEvent,
} from '../helpers/paygate/webhook';

const exampleProductE2E = async () => {
  const prisma = new PrismaClient();

  // 0. Prerequisites
  const orderFulfillmentPayload = createPaddleOrderFulfillmentPayload();
  const { transactionId } = orderFulfillmentPayload;

  // 1. User buys the Scraper vote product via Paddle
  // <No action>

  // 2. Paddle sends the order_fulfillment event to our webhook
  // > This should:
  // > - create 1 entry in ProductPurchaseTransaction
  // > - create 1 entry in ScraperVote (based on quantity)
  // > - vote value should be product's vote value * quantity
  // > - webhook should respond with the redeem code
  const purchasePre = await prisma.productPurchaseTransaction.findUnique({ where: { purchaseTransactionId: transactionId } }); // prettier-ignore

  const redeemCode = await sendPaddleOrderFulfillmentEvent(orderFulfillmentPayload);

  const purchasePost = await prisma.productPurchaseTransaction.findUnique({ where: { purchaseTransactionId: transactionId } }); // prettier-ignore

  console.log({
    purchasePre,
    purchasePost,
    redeemCode,
  });

  // X. Cleanup
  await prisma.productPurchaseTransaction.deleteMany({ where: { purchaseTransactionId: transactionId } }); // prettier-ignore
};

exampleProductE2E();
