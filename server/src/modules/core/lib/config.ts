import Joi from 'joi';

/**
 * App environements.
 *
 * This is different from NODE_ENV, as AppEnv describes OUR settings.
 */
enum AppEnv {
  LOCAL = 'local',
  DEV = 'dev',
  PRD = 'prd',
}

interface Config {
  httpPort: number;
  stmpPort: number;
  baseUrl: string;
  redisUrl: string;

  enableCsrf: boolean;
  enableCsp: boolean;
  enableCors: boolean;

  sessionCookieSecret: string;

  /** Email of this server - AKA where people can send email to */
  mailServerEmail: string;
  /** Email to which incoming emails will be forwarded to */
  mailForwardEmail: string;
  mailRelayHost: string;
  mailRelayPort: number;
  mailRelayUser: string;
  mailRelayPassword: string;
}

const envVars = {
  mailRelayPassword: process.env.MAIL_RELAY_PASSWORD,
  appEnv: process.env.APP_ENV,
};

/**
 * Config definitions per environment.
 *
 * This is the source of truth.
 */
const configs: Record<AppEnv, Config> = Object.freeze({
  /** Config for running things on our own machine, with services possibly outside of docker-compose */
  [AppEnv.LOCAL]: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://localhost:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    sessionCookieSecret: 'cookieSecretDev', // TODO: Move this to env vars - CHANGE IN OWN PROJECT
    mailServerEmail: 'admin@system-mail.example.com',
    mailForwardEmail: 'example@example.com',
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
  },
  /** Config for running things on our own machine or dev server, all services communicate within the docker network */
  [AppEnv.DEV]: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://redis:6379',
    enableCsrf: false,
    enableCsp: false,
    enableCors: false,
    sessionCookieSecret: 'cookieSecretDev', // TODO: Move this to env vars - CHANGE IN OWN PROJECT
    mailServerEmail: 'admin@system-mail.example.com',
    mailForwardEmail: 'example@example.com',
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
  },
  /** Prod config - This is how things run on the deployed prod server */
  [AppEnv.PRD]: {
    httpPort: 3000,
    stmpPort: 25,
    baseUrl: 'http://localhost',
    redisUrl: 'redis://redis:6379',
    enableCsrf: true,
    enableCsp: true,
    enableCors: true,
    sessionCookieSecret: 'cookieSecretPrd', // TODO: Move this to env vars - CHANGE IN OWN PROJECT
    mailServerEmail: 'admin@system-mail.example.com',
    mailForwardEmail: 'example@example.com',
    mailRelayHost: 'smtp.sendgrid.net',
    mailRelayPort: 587, // Or 25?
    mailRelayUser: 'apikey',
    mailRelayPassword: envVars.mailRelayPassword!,
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
} satisfies Record<keyof Config, Joi.Schema>).required();

const appEnvValidationSchema = Joi.string()
  .required()
  .min(1)
  .allow(...Object.values(AppEnv));

const createConfig = () => {
  Object.values(configs).forEach((config) => {
    Joi.assert(config, configValidationSchema, 'Config validation failed');
  });

  const appEnv = envVars.appEnv?.toLowerCase() as AppEnv;

  Joi.assert(appEnv, appEnvValidationSchema);

  return configs[appEnv];
};

/** Config instance based on the current environment */
export const config = createConfig();
