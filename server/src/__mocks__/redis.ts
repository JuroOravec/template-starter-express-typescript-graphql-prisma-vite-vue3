import redisMock from 'redis-mock';

const originalCreateClient = redisMock.createClient;

// Overrides createClient to add a field to the client
const mockCreateClient = (...args: any[]) => {
  const client = originalCreateClient(...args);

  // @ts-expect-error This field is missing from RedisClient from redis-mock
  client.connect = () => Promise.resolve();

  return client;
};

redisMock.createClient = mockCreateClient;

module.exports = redisMock;
