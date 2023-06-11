export const serializeToBase64UriEncode = (data: any) => {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json, 'utf-8').toString('base64');
  const serialized = encodeURIComponent(base64);
  return serialized;
};

export const deserializeFromBase64UriEncode = <T = any>(serialized: string) => {
  const base64 = decodeURIComponent(serialized);
  const json = Buffer.from(base64, 'base64').toString('utf-8');
  const data = JSON.parse(json);
  return data as T;
};
