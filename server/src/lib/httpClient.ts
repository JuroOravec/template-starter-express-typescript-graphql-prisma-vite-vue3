import fetch, { RequestInit, Response } from 'node-fetch';

import type { MaybePromise } from '@/utils/types';

export type HttpClient<TPaths extends string = string, TRes = object> = ReturnType<
  typeof createHttpClient<TPaths, TRes>
>;

const validateUrl = (url: string) => {
  new URL(url);
};

/** Client that sends HTTP(S) requests using Fetch API */
export const createHttpClient = <TPaths extends string = string, TRes = object>(options: {
  baseUrl: string;
  fetch?: typeof fetch;
  processResponse?: (res: Response) => MaybePromise<TRes>;
}) => {
  const fetcher = options?.fetch ?? fetch;
  const resProcessor = options.processResponse ?? ((res: Response) => res.json());

  const baseUrl = options.baseUrl
    .replace(/\s+/g, '') // remove whitespace
    .replace(/\/+$/, ''); // remove trailing slashes
  validateUrl(baseUrl);

  const fetchEndpoint = async <T = any>(endpoint: TPaths, options?: RequestInit): Promise<T> => {
    // Ensure the endpoint path starts with slash
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const res = await fetcher(`${baseUrl}${path}`, options);
    return resProcessor(res);
  };

  const get = <T extends TRes = any>(endpoint: TPaths, options?: RequestInit): Promise<T> => {
    return fetchEndpoint(endpoint, { ...options, method: 'GET' });
  };

  const post = <T extends TRes = any>(endpoint: TPaths, options?: RequestInit): Promise<T> => {
    return fetchEndpoint(endpoint, { ...options, method: 'POST' });
  };

  return {
    fetch: fetchEndpoint,
    get,
    post,
  };
};
