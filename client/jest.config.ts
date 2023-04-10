import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: './src',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10_000,
  verbose: true,
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
