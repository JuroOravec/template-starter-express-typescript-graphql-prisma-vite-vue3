import { PrismaClient, ProductProvider, ProductType } from '@prisma/client';

import type { HttpClient } from '@/lib/httpClient';
import type { WatcherJob } from '@/utils/watchers';
import { getProducts } from '@/datasources/paddle/endpoints/product';
import { upsertMany } from '@/datasources/prisma/utils';

interface WatcherContext {
  prisma: PrismaClient;
  paddle: HttpClient;
}

// Update local copy of our Paddle products at regular interval
const updatePaddleProducts: WatcherJob<WatcherContext> = async (args, _done) => {
  const { prisma, paddle } = args;

  const products = await getProducts(paddle);

  // Update our copies in DB
  await upsertMany(prisma, prisma.product, {
    where: {
      productId: { in: products.map((p) => `${p.id}`) },
    },
    data: products.map((p) => ({
      productId: `${p.id}`,
      type: ProductType.EXAMPLE_PRODUCT,
      provider: ProductProvider.PADDLE,
      name: p.name,
      description: p.description,
      priceInCents: p.base_price * 100,
      currency: p.currency,
      iconUrl: p.icon,
    })),
  });
};

export const paygateWatcherJobs = [updatePaddleProducts];
