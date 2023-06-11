import Joi from 'joi';

import type { ArrVal } from '../utils/types';

/**
 * App environements.
 *
 * This is different from NODE_ENV, as AppEnv describes OUR settings.
 */
const APP_ENV = ['local', 'dev', 'prd'] as const;
type AppEnv = ArrVal<typeof APP_ENV>;

interface Config {
  httpPort: number;
  stmpPort: number;
  baseUrl: string;
  frontendUrl: string;
  redisUrl: string;

  enableCsrf: boolean;
  enableCsp: boolean;
  enableCors: boolean;

  sessionCookieSecret: string;

  // Email & SMTP server
  /** Email of this server - AKA where people can send email to */
  mailServerSystemEmail: string;
  /**
   * Human-friendly email of this project - AKA when we send out
   * from this email, we're speaking as the organisation, not as a system.
   *
   * NOTE: Currently we can only send out & receive emails, but we can't
   * access an inbox. To be able to reply from inbox under this email address
   * consider other solution like [Gmail Suite](https://support.google.com/business/answer/9270657?hl=en).
   */
  mailServerPublicEmail: string;
  /** Email to which incoming emails will be forwarded to */
  mailForwardEmail: string;
  mailRelayHost: string;
  mailRelayPort: number;
  mailRelayUser: string;
  mailRelayPassword: string;

  // Pay gate
  paygatePaddleApiUrl: string;
  paygatePaddleVendorId: string | null;
  paygatePaddleApiKey: string | null;
  paygatePaddlePublicKey: string | null;

  // Error handling
  sentryDns: string | null;
}

const envVars = {
  mailRelayPassword: process.env.MAIL_RELAY_PASSWORD,
  appEnv: process.env.APP_ENV,
  paygatePaddleVendorId: process.env.PAYGATE_PADDLE_VENDOR_ID ?? null,
  paygatePaddleApiKey: process.env.PAYGATE_PADDLE_API_KEY ?? null,
  paygatePaddlePublicKey: process.env.PAYGATE_PADDLE_PUBLIC_KEY ?? null,
  sessionCookieSecret: process.env.SERVER_SESSION_COOKIE_SECRET ?? null,
  sentryDns: process.env.SENTRY_DNS ?? null,
};

/**
 * Config definitions per environment.
 *
 * This is the source of truth.
 */
const configs: Record<AppEnv, Config> = Object.freeze({
  /** Config for running things on our own machine, with services possibly outside of docker-compose */
  local: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'http://localhost',
    frontendUrl: 'http://localhost:3001',
    redisUrl: 'redis://localhost:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    sessionCookieSecret: envVars.sessionCookieSecret!,
    mailServerSystemEmail: 'admin@system-mail.example.com',
    mailServerPublicEmail: 'name@example.com',
    mailForwardEmail: 'name@gmail.com', // Not obscured as it's defined in other places too
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
    paygatePaddleApiUrl: 'https://sandbox-vendors.paddle.com/api/2.0',
    paygatePaddleVendorId: envVars.paygatePaddleVendorId,
    paygatePaddleApiKey: envVars.paygatePaddleApiKey,
    paygatePaddlePublicKey: null,
    sentryDns: null,
  },
  /** Config for running things on our own machine or dev server, all services communicate within the docker network */
  dev: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'http://localhost',
    frontendUrl: 'http://localhost:3001',
    redisUrl: 'redis://redis:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    sessionCookieSecret: envVars.sessionCookieSecret!,
    mailServerSystemEmail: 'admin@system-mail.example.com',
    mailServerPublicEmail: 'name@example.com',
    mailForwardEmail: 'name@gmail.com', // Not obscured as it's defined in other places too
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
    paygatePaddleApiUrl: 'https://sandbox-vendors.paddle.com/api/2.0',
    paygatePaddleVendorId: envVars.paygatePaddleVendorId,
    paygatePaddleApiKey: envVars.paygatePaddleApiKey,
    paygatePaddlePublicKey: null,
    sentryDns: null,
  },
  /** Prod config - This is how things run on the deployed prod server */
  prd: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'https://api.example.com',
    frontendUrl: 'https://example.com',
    redisUrl: 'redis://redis:6379',
    enableCsrf: true,
    enableCsp: true,
    enableCors: true,
    sessionCookieSecret: envVars.sessionCookieSecret!,
    mailServerSystemEmail: 'admin@system-mail.example.com',
    mailServerPublicEmail: 'juro@example.com',
    mailForwardEmail: 'name@gmail.com', // Not obscured as it's defined in other places too
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
    paygatePaddleApiUrl: 'https://vendors.paddle.com/api/2.0',
    paygatePaddleVendorId: envVars.paygatePaddleVendorId,
    paygatePaddlePublicKey: envVars.paygatePaddlePublicKey,
    paygatePaddleApiKey: envVars.paygatePaddleApiKey,
    sentryDns: envVars.sentryDns,
  },
});

/** Validation for the configs. */
const configValidationSchema = Joi.object<Config>({
  httpPort: Joi.number().min(1).required(),
  stmpPort: Joi.number().min(1).required(),
  baseUrl: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).required(), // prettier-ignore
  frontendUrl: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).required(), // prettier-ignore
  redisUrl: Joi.string().min(1).uri({ scheme: ['redis'] }).required(), // prettier-ignore
  enableCsrf: Joi.boolean(),
  enableCsp: Joi.boolean(),
  enableCors: Joi.boolean(),
  sessionCookieSecret: Joi.string().min(10).required(),
  mailServerSystemEmail: Joi.string().email(),
  mailServerPublicEmail: Joi.string().email(),
  mailForwardEmail: Joi.string().email(),
  mailRelayHost: Joi.string().min(1),
  mailRelayPort: Joi.number().min(1).required(),
  mailRelayUser: Joi.string().min(1),
  mailRelayPassword: Joi.string().min(1),
  paygatePaddleApiUrl: Joi.string()
    .min(1)
    .uri({ scheme: ['http', 'https'] })
    .required(),
  paygatePaddleVendorId: Joi.string().min(1).allow(null),
  paygatePaddleApiKey: Joi.string().min(1).allow(null),
  paygatePaddlePublicKey: Joi.string().min(1).allow(null),
  sentryDns: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).allow('', null), // prettier-ignore
} satisfies Record<keyof Config, Joi.Schema>).required();

const appEnvValidationSchema = Joi.string()
  .required()
  .min(1)
  .allow(...APP_ENV);

const createConfig = <TConf extends object, TKeys extends string>({
  configs,
  configSchema,
  appEnv,
  appEnvSchema,
}: {
  configs: Record<TKeys, TConf>;
  configSchema: Joi.Schema;
  appEnv: TKeys;
  appEnvSchema: Joi.Schema;
}) => {
  Object.values(configs).forEach((config) => {
    Joi.assert(config, configSchema, 'Config validation failed');
  });

  Joi.assert(appEnv, appEnvSchema);

  return configs[appEnv];
};

/** Config instance based on the current environment */
export const config = createConfig({
  configs,
  configSchema: configValidationSchema,
  appEnv: envVars.appEnv?.toLowerCase() as AppEnv,
  appEnvSchema: appEnvValidationSchema,
});
