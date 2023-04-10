import cors, { CorsOptions } from 'cors';
import type { Handler } from 'express';

export const corsOptions: CorsOptions = {
  // TODO: Configure this based on enableCors config value
  origin: (origin, cb) => cb(null, origin),
  credentials: true,
};

export const corsHandler: Handler = cors(corsOptions);
