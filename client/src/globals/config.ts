import Joi from 'joi';

/** App environements. */
export enum AppEnv {
  DEV = 'dev',
  PRD = 'prd',
}

interface Config {
  apolloUrl: string;
  apolloEnableDebug: boolean;
  analyticsUrl: string | null;
  analyticsMixpanelToken: string | null;
  errorTrackUrl: string | null;
  errorTrackSentryDns: string | null;
  paygatePaddleEnv: 'sandbox' | 'prod';
  paygatePaddleVendorId: string | null;
}

/**
 * Config definitions per environment.
 *
 * This is the source of truth.
 */
const configs = Object.freeze({
  dev: {
    apolloUrl: 'http://localhost:3000/graphql',
    apolloEnableDebug: true,
    analyticsUrl: null,
    analyticsMixpanelToken: null,
    errorTrackUrl: null,
    errorTrackSentryDns: null,
    paygatePaddleEnv: 'sandbox',
    paygatePaddleVendorId: null,
  },
  prd: {
    apolloUrl: 'http://localhost:3000/graphql', // TODO
    apolloEnableDebug: false,
    analyticsUrl: 'http://localhost:3000/_t/a/m', // Routed via server // TODO
    analyticsMixpanelToken: '0123456789abcdef0123456789abcdef',
    errorTrackUrl: 'http://localhost:3000/_t/e', // Routed via server // TODO
    errorTrackSentryDns:
      'https://1234578...@o123456.ingest.sentry.io/12345678...',
    paygatePaddleEnv: 'sandbox',
    paygatePaddleVendorId: '12345',
  },
}) satisfies Record<AppEnv, Config>;

/** Validation for the configs. */
const configValidationSchema = Joi.object<Config>({
  apolloUrl: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).required(), // prettier-ignore
  apolloEnableDebug: Joi.boolean(),
  analyticsUrl: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).required(), // prettier-ignore
  analyticsMixpanelToken: Joi.string().min(1).allow(null),
  errorTrackUrl: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).allow(null), // prettier-ignore
  errorTrackSentryDns: Joi.string().min(1).uri({ scheme: ['http', 'https'] }).allow(null), // prettier-ignore
  paygatePaddleEnv: Joi.string().min(1).allow('sandbox', 'prod').required(), // prettier-ignore
  paygatePaddleVendorId: Joi.string().min(1).allow(null), // prettier-ignore
} satisfies Record<keyof Config, Joi.Schema>).required();

const createConfig = <TConfig = any, TKey extends string = string>({
  configs,
  validationSchema,
  appEnv,
}: {
  configs: Record<TKey, TConfig>;
  appEnv: TKey;
  validationSchema: Joi.Schema;
}): TConfig & { appEnv: TKey } => {
  Object.values(configs).forEach((config) => {
    Joi.assert(config, validationSchema, 'Config validation failed');
  });

  const config = configs[appEnv];

  if (!config) {
    throw Error(`Unknown APP_ENV value "${appEnv}"`);
  }

  return Object.freeze({ ...config, appEnv });
};

/** Config instance based on the current environment */
export const config = createConfig<Config, AppEnv>({
  configs,
  validationSchema: configValidationSchema,
  appEnv: import.meta.env.VITE_APP_ENV?.toString().toLowerCase() as AppEnv,
});
