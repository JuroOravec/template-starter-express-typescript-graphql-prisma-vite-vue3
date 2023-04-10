import Joi from 'joi';

import { parseEnvVarAsInt } from './configUtils';

/**
 * App environements.
 */
enum AppEnv {
  LOCAL = 'local',
  DEV = 'dev',
  PRD = 'prd',
}

interface Config {
  port: number;
  baseUrl: string;
  redisUrl: string;
  enableCsrf: boolean;
  enableCsp: boolean;
  enableCors: boolean;
  sessionCookieSecret: string;
}

const port = parseEnvVarAsInt() ?? 3000;

/**
 * Config definitions per environment.
 *
 * This is the source of truth.
 */
const configs: Record<AppEnv, Config> = Object.freeze({
  [AppEnv.LOCAL]: {
    port,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://localhost:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    // TODO: Should I move this to env vars?
    sessionCookieSecret: 'cookieSecretDev',
  },
  [AppEnv.DEV]: {
    port,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://redis:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    // TODO: Should I move this to env vars?
    sessionCookieSecret: 'cookieSecretDev',
  },
  [AppEnv.PRD]: {
    port,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://redis:6379',
    enableCsrf: true,
    enableCsp: true,
    enableCors: true,
    sessionCookieSecret: 'cookieSecretPrd',
  },
});

/** Validation for the configs. */
const configValidationSchema = Joi.object<Config>({
  port: Joi.number().min(1024).required(),
  baseUrl: Joi.string()
    .min(1)
    .uri({ scheme: ['http', 'https'] })
    .required(),
  redisUrl: Joi.string()
    .min(1)
    .uri({ scheme: ['redis'] })
    .required(),
  enableCsrf: Joi.boolean(),
  enableCsp: Joi.boolean(),
  enableCors: Joi.boolean(),
  sessionCookieSecret: Joi.string().min(10).required(),
}).required();

const appEnvValidationSchema = Joi.string()
  .required()
  .min(1)
  .allow(...Object.values(AppEnv));

const createConfig = () => {
  Object.values(configs).forEach((config) => {
    Joi.assert(config, configValidationSchema, 'Config validation failed');
  });

  const appEnv = process.env.APP_ENV?.toLowerCase() as AppEnv;

  Joi.assert(appEnv, appEnvValidationSchema);

  return configs[appEnv];
};

/** Config instance based on the current environment */
export const config = createConfig();
