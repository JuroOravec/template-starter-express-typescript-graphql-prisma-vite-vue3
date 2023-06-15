import { PrismaClient, ProductProvider, ProductType } from '@prisma/client';

import type { HttpClient } from '@/lib/httpClient';
import type { Job } from '@/lib/jobs';
import {
  PaddleListProductsResponseProduct,
  getProducts,
} from '@/datasources/paddle/endpoints/product';
import { upsertMany } from '@/datasources/prisma/utils';

interface JobContext {
  prisma: PrismaClient;
  paddle: HttpClient;
}

/** Try to identify product type by words in the product name */
const resolveProductType = (p: PaddleListProductsResponseProduct) => {
  const productTypeKeywords = {
    EXAMPLE_PRODUCT: ['example'],
  } satisfies Record<ProductType, string[]>;

  const normName = p.name.toLowerCase().replace(/-/g, '');

  const [productType] =
    Object.entries(productTypeKeywords).find(([_type, keywords]) => {
      return keywords.every((s) => normName.includes(s));
    }) ?? [];

  return (productType ?? null) as ProductType | null;
};

// Update local copy of our Paddle products at regular interval
const updatePaddleProducts: Job<JobContext> = async (args, _done) => {
  const { prisma, paddle } = args;

  const products = await getProducts(paddle);

  // Update our copies in DB
  await upsertMany(prisma, prisma.product, {
    where: {
      productId: { in: products.map((p) => `${p.id}`) },
    },
    data: products.map((p) => ({
      productId: `${p.id}`,
      // NOTE: If/when we products changes or new are added, this should start throwing errors until updated
      type: resolveProductType(p)!,
      provider: ProductProvider.PADDLE,
      name: p.name,
      description: p.description,
      priceInCents: p.base_price * 100,
      currency: p.currency,
      iconUrl: p.icon,
    })),
  });
};

export const paygateJobs = [updatePaddleProducts];
