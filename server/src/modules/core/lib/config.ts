import Joi from 'joi';

import { createConfig } from '../utils/configUtils';
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
  redisUrl: string;

  enableCsrf: boolean;
  enableCsp: boolean;
  enableCors: boolean;

  sessionCookieSecret: string;

  // Email & SMTP server
  /** Email of this server - AKA where people can send email to */
  mailServerEmail: string;
  /** Email to which incoming emails will be forwarded to */
  mailForwardEmail: string;
  mailRelayHost: string;
  mailRelayPort: number;
  mailRelayUser: string;
  mailRelayPassword: string;

  // Error handling
  sentryDns: string | null;
}

const envVars = {
  mailRelayPassword: process.env.MAIL_RELAY_PASSWORD,
  appEnv: process.env.APP_ENV,
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
    redisUrl: 'redis://localhost:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    sessionCookieSecret: envVars.sessionCookieSecret!,
    mailServerEmail: 'admin@system-mail.example.com',
    mailForwardEmail: 'example@example.com',
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
    sentryDns: null,
  },
  /** Config for running things on our own machine or dev server, all services communicate within the docker network */
  dev: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://redis:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    sessionCookieSecret: envVars.sessionCookieSecret!,
    mailServerEmail: 'admin@system-mail.example.com',
    mailForwardEmail: 'example@example.com',
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
    sentryDns: null,
  },
  /** Prod config - This is how things run on the deployed prod server */
  prd: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://redis:6379',
    enableCsrf: true,
    enableCsp: true,
    enableCors: true,
    sessionCookieSecret: envVars.sessionCookieSecret!,
    mailServerEmail: 'admin@system-mail.example.com',
    mailForwardEmail: 'example@example.com',
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
    sentryDns: envVars.sentryDns,
  },
});

/** Validation for the configs. */
const configValidationSchema = Joi.object<Config>({
  httpPort: Joi.number().min(1).required(),
  stmpPort: Joi.number().min(1).required(),
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
  mailServerEmail: Joi.string().email(),
  mailForwardEmail: Joi.string().email(),
  mailRelayHost: Joi.string().min(1),
  mailRelayPort: Joi.number().min(1).required(),
  mailRelayUser: Joi.string().min(1),
  mailRelayPassword: Joi.string().min(1),
  sentryDns: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).allow('', null), // prettier-ignore
} satisfies Record<keyof Config, Joi.Schema>).required();

const appEnvValidationSchema = Joi.string()
  .required()
  .min(1)
  .allow(...APP_ENV);

/** Config instance based on the current environment */
export const config = createConfig({
  configs,
  configSchema: configValidationSchema,
  appEnv: envVars.appEnv?.toLowerCase() as AppEnv,
  appEnvSchema: appEnvValidationSchema,
});
