import type { RedisClientType } from 'redis';
import fs from 'fs';

type MaybePromise<T> = Promise<T> | T;

/** Storage client for Mfa components */
export interface Storage<TData = any> {
  set: (key: string, data: TData, options?: { expireInSec?: number }) => MaybePromise<void>;
  /** Get and remove */
  pop: (key: string) => MaybePromise<TData | null>;
}

export interface ExpirableStorage<TData = any> extends Storage<TData> {
  getKeysWithExpirations: () => MaybePromise<Record<string, number>>;
}

export type StorageOnExpire = (promptId: string) => MaybePromise<void>;

export interface StorageWithExpiry<TData = any> {
  set: (promptId: string, data: TData, options?: { expireInSec?: number }) => MaybePromise<void>;
  /** Get and remove */
  pop: (promptId: string) => MaybePromise<TData | null>;
  /** Allows to register a callback when challenge expires */
  onExpired: (cb: StorageOnExpire) => () => void;
}

/** Client used for storing prompts in memory */
export interface InMemoryStorageClient<TData = any> {
  set: (key: string, data: TData) => MaybePromise<void>;
  get: (key: string) => MaybePromise<TData>;
  delete: (key: string) => MaybePromise<void>;
  entries: () => MaybePromise<IterableIterator<[string, TData]>>;
}

export interface InMemoryStorageOptions<TData = any> {
  client?: InMemoryStorageClient<[TData, number]>;
}

/**
 * Storage that uses the JavaScript process memory to store data.
 *
 * By default, a Map instance is used.
 */
export const createInMemoryStorage = <TData = any>(input?: InMemoryStorageOptions<TData>) => {
  const cache = input?.client ?? new Map<string, [TData, number]>();

  const set: Storage<TData>['set'] = async (key, data, options) => {
    const expiry = (options?.expireInSec ?? 0) * 1000 + new Date().getTime();
    const promptData = [data, expiry] as [TData, number];

    await cache.set(key, promptData);
  };

  const pop: Storage<TData>['pop'] = async (key) => {
    const promptData = (await cache.get(key)) ?? null;
    if (!promptData) return null;

    const isExpired = promptData[1] <= new Date().getTime();

    await cache.delete(key);
    return isExpired ? null : promptData[0];
  };

  const getKeysWithExpirations = async () => {
    const expirations: Record<string, number> = {};
    const entries = await cache.entries();
    for (const [key, [_data, expiry]] of entries) {
      expirations[key] = expiry;
    }
    return expirations;
  };

  return { set, pop, getKeysWithExpirations } satisfies ExpirableStorage<TData>;
};

/** Client used for storing prompts in (local) filesystem */
export interface FsStorageClient {
  exists: (filepath: string) => MaybePromise<boolean>;
  read: (filepath: string) => MaybePromise<string | null>;
  write: (filepath: string, content: string) => MaybePromise<void>;
  delete: (promptId: string) => MaybePromise<void>;
}

const defaultFsClient = {
  exists: (filepath: string) => fs.existsSync(filepath),
  read: (filepath: string) => fs.promises.readFile(filepath, 'utf-8'),
  write: (filepath: string, content: string) => fs.promises.writeFile(filepath, content, 'utf-8'),
  delete: (filepath: string) => fs.promises.unlink(filepath),
} satisfies FsStorageClient;

export interface FsStorageOptions {
  filepath?: string;
  client?: FsStorageClient;
}

/**
 * Storage that uses filesystem to store data
 *
 * By default, the `fs` module is used.
 */
export const createFsStorage = <TData = any>(input?: FsStorageOptions) => {
  const fsClient = input?.client ?? defaultFsClient;
  const filepath =
    input?.filepath ?? '/tmp/mfaEmailStrategy_' + Math.floor(Math.random() * 1000_000);

  const loadFileData = async () => {
    let fileData: Record<string, [TData, number]> = {};
    if (await fsClient.exists(filepath)) {
      const fileContent = await fsClient.read(filepath);
      if (fileContent) fileData = JSON.parse(fileContent) ?? {};
    }
    return fileData;
  };

  const saveFileData = async (fileData: Record<string, [TData, number]>) => {
    await fsClient.write(filepath, JSON.stringify(fileData));
  };

  const set: Storage<TData>['set'] = async (key, data, options) => {
    const fileData = await loadFileData();

    const expiryMs = (options?.expireInSec ?? 0) * 1000 + new Date().getTime();
    fileData[key] = [data, expiryMs];

    await saveFileData(fileData);
  };

  const pop: Storage<TData>['pop'] = async (key) => {
    const fileData = await loadFileData();

    const promptData = fileData[key];
    if (!promptData) return null;

    const isExpired = promptData[1] <= new Date().getTime();

    delete fileData[key];
    await saveFileData(fileData);

    return isExpired ? null : promptData[0];
  };

  const getKeysWithExpirations = async () => {
    const fileData = await loadFileData();
    const expirations: Record<string, number> = {};
    for (const [key, [_data, expiry]] of Object.entries(fileData)) {
      expirations[key] = expiry;
    }
    return expirations;
  };

  return { set, pop, getKeysWithExpirations } satisfies ExpirableStorage<TData>;
};

export interface RedisStorageOptions {
  client: RedisClientType<any, any, any>;
  keyPrefix?: string;
}

/** Storage that uses Redis to store data */
export const createRedisStorage = <TData = any>(input: RedisStorageOptions) => {
  const { client, keyPrefix = 'mfa-storage:' } = input;

  const createDataKey = (key: string) => `${keyPrefix}data:${key}`;

  // This key holds all keys we use that are currently in Redis.
  // See https://stackoverflow.com/questions/8744207
  const allKeysKey = `${keyPrefix}keys`;

  const serialize = (d: any) => JSON.stringify(d);
  const deserialize = (s: string) => JSON.parse(s);

  const set: Storage<TData>['set'] = async (key, data, options) => {
    const dataKey = createDataKey(key);
    const expiryInMs = options?.expireInSec != null ? options?.expireInSec * 1000 : undefined;
    await client.set(dataKey, serialize(data), { PX: expiryInMs });
    await client.sAdd(allKeysKey, dataKey);
  };

  const pop: Storage<TData>['pop'] = async (key) => {
    const dataKey = createDataKey(key);
    const jsonData = await client.getDel(dataKey);
    const data = jsonData != null ? deserialize(jsonData) : null;

    await client.sRem(allKeysKey, key);
    return data as TData | null;
  };

  /** Find all keys that belong to this storage, and get their expiration info */
  const getKeysWithExpirations = async () => {
    const keys = await client.sMembers(allKeysKey);
    const keysWithExpiry = await keys.reduce<Promise<Record<string, number>>>(
      async (aggPromise, key) => {
        const agg = await aggPromise;

        const keyTtlInMs = await client.pTTL(key);
        const nowTimestamp = new Date().getTime();
        const expiryTimestampMs =
          keyTtlInMs <= 0
            ? nowTimestamp - 1 // Force expiration if we get errors (nagative values) - https://redis.io/commands/pttl/
            : nowTimestamp + keyTtlInMs;

        agg[key] = expiryTimestampMs;
        return agg;
      },
      Promise.resolve({}),
    );

    return keysWithExpiry;
  };

  return { set, pop, getKeysWithExpirations } satisfies ExpirableStorage<TData>;
};

const defaultExpiryInSec = 60 * 60 * 24 * 7; // Expire after 7 days
const defaultExpiryCheckIntervalInSec = 60 * 5; // Check every 5 min for expired keys

export interface StorageKeyExpiryOptions<TData = any> {
  storage: ExpirableStorage<TData>;
  expireCheckIntervalInSec?: number;
}

/** A layer around an ExpirableStorage that manages expirations. */
export const handleStorageKeyExpiry = <TData = any>(input: StorageKeyExpiryOptions<TData>) => {
  const { storage } = input;
  const expiryCheckIntervalInSec =
    input?.expireCheckIntervalInSec ?? defaultExpiryCheckIntervalInSec;

  /** Allow others to define callback on expired keys */
  const onExpiredCbs: Record<string, StorageOnExpire> = {};

  /**
   * Holds expiration time for all active keys, so we know when keys expire
   * and trigger expiration callback.
   */
  const keyExpiryTimestampInMs = new Map<string, number>();

  const set = async (promptId: string, data: TData, options?: { expireInSec?: number }) => {
    const expiryMs = (options?.expireInSec ?? defaultExpiryInSec) * 1000; /* Convert sec to Ms */
    const expiryTimestampMs = new Date().getTime() + expiryMs;

    await storage.set(promptId, data, options);
    keyExpiryTimestampInMs.set(promptId, expiryTimestampMs);
  };

  const pop = async (promptId: string) => {
    const data = await storage.pop(promptId);
    keyExpiryTimestampInMs.delete(promptId);
    return data;
  };

  /** Add a callback that's called when a prompt is expired */
  const onExpired: StorageWithExpiry['onExpired'] = (cb) => {
    const id = Math.floor(Math.random() * 1000_000);
    onExpiredCbs[id] = cb;
    return () => {
      delete onExpiredCbs[id];
    };
  };

  const onExpiryCheck = async () => {
    // Call expiry callbacks with expired keys
    for (const [promptId, expiryTimestamp] of keyExpiryTimestampInMs.entries()) {
      const nowTimestampMs = new Date().getTime();

      if (expiryTimestamp > nowTimestampMs) continue;
      // NOTE: We don't have to await the callbacks, but we do so to avoid
      // potentially flooding a database client with many concurrent requests.
      for (const cb of Object.values(onExpiredCbs)) {
        await cb(promptId);
      }
    }
  };

  const init = async () => {
    // Load data on key expirations from storage
    const keysFromStorage = await storage.getKeysWithExpirations();
    Object.entries(keysFromStorage).forEach(([key, val]) => keyExpiryTimestampInMs.set(key, val));

    // Set up regular check to call expiry callback for expired keys and clear them
    setInterval(onExpiryCheck, expiryCheckIntervalInSec);

    // And run the check right now
    onExpiryCheck();
  };

  // NOTE: `satisfies` keyword doesn't allow extra keys
  const storageBase = { set, pop, onExpired } satisfies StorageWithExpiry<TData>;

  return {
    init,
    ...storageBase,
  };
};

export const createInMemoryStorageWithKeyExpiry = <TData = any>(
  input?: InMemoryStorageOptions<TData> & Omit<StorageKeyExpiryOptions, 'storage'>,
) => {
  const storage = createInMemoryStorage(input);
  return handleStorageKeyExpiry({ ...input, storage });
};

export const createFsStorageWithKeyExpiry = (
  input?: FsStorageOptions & Omit<StorageKeyExpiryOptions, 'storage'>,
) => {
  const storage = createFsStorage(input);
  return handleStorageKeyExpiry({ ...input, storage });
};

export const createRedisStorageWithKeyExpiry = (
  input: RedisStorageOptions & Omit<StorageKeyExpiryOptions, 'storage'>,
) => {
  const storage = createRedisStorage(input);
  return handleStorageKeyExpiry({ ...input, storage });
};
