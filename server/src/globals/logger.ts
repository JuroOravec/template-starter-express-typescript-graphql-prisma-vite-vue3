import pino from 'pino';

export const logger = pino({
  name: 'server',
  level: process.env.LOG_LEVEL ?? 'info',
});
