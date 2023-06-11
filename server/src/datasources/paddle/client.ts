import { config } from '@/globals/config';
import { createHttpClient } from '@/lib/httpClient';

export const createPaddleClient = () => {
  return createHttpClient({
    baseUrl: config.paygatePaddleApiUrl,
  });
};
