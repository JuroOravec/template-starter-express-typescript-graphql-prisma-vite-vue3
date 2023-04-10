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
