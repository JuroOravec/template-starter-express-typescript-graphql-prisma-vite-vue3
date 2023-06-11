import { URLSearchParams } from 'url';

import { config } from '@/globals/config';
import { logger } from '@/globals/logger';
import type { HttpClient } from '@/lib/httpClient';

/**
 * Response from Paddle API for 'List Products'.
 *
 * See https://developer.paddle.com/api-reference/0f31bd7cbce47-list-products#Responses
 */
export interface PaddleListProductsResponse {
  success: boolean;
  response: {
    /** E.g. `1` */
    total: number;
    /** E.g. `1` */
    count: number;
    products: PaddleListProductsResponseProduct[];
  };
}

export interface PaddleListProductsResponseProduct {
  /** E.g. `51898` */
  id: number;
  /** E.g. `'Scraper Pre-order - Full Vote'` */
  name: string;
  /** E.g. `'Cast a vote for a scraper (full vote) [PRODUCT DESC]'` */
  description: string;
  /** E.g. `20` */
  base_price: number;
  /** E.g. `null` */
  sale_price: number | null;
  /** E.g. `'USD'` */
  currency: string;
  /** UNKNOWN */
  screenshots: any[];
  /** E.g. `'https://sandbox-static.paddle.com/assets/images/checkout/default_product_icon.png'` */
  icon: string;
}

export const getProducts = async (paddle: HttpClient) => {
  // See https://developer.paddle.com/api-reference/0f31bd7cbce47-list-products
  const encodedParams = new URLSearchParams();
  encodedParams.set('vendor_id', config.paygatePaddleVendorId ?? '');
  encodedParams.set('vendor_auth_code', config.paygatePaddleApiKey ?? '');

  const payload = await paddle
    .post<PaddleListProductsResponse>('/product/get_products', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodedParams,
    })
    .catch((err) => logger.error({ err }, 'Error while fetching products data from Paddle.'));

  if (!payload?.success) {
    logger.error({ payload }, 'Failed to fetch products data from Paddle.');
    return [];
  }

  const products = payload?.response?.products ?? [];
  return products;
};
