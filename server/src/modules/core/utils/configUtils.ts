import Joi from 'joi';

export const parseEnvVarAsInt = (val?: string): number | null => {
  const parsed = parseInt(val ?? '', 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const isValidHttpUrl = (val: string): boolean => {
  let url;

  try {
    url = new URL(val);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

export const createConfig = <TConf extends object, TKeys extends string>({
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
