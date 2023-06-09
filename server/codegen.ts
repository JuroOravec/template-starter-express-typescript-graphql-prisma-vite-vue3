import type { CodegenConfig } from '@graphql-codegen/cli';
import type { AddPluginConfig } from '@graphql-codegen/add/typings/config';

// @ts-expect-error Ignore missing type of process
const useLocalServer = process.env.GRAPHQL_LIVE;
console.log({ useLocalServer });

const schema = useLocalServer
  ? 'http://localhost:3000/graphql'
  : ['src/apis/**/*.graphql', 'src/apis/**/*.ts'];

const autogenPrefix = `
/* eslint-disable */
/* This file is autogenerated, see codegen.ts */

import type { ResolverContext } from '@/apis/graphql/types'`;

/** Define type casting for the custom scalars from graphql-scalars package */
export const customScalars = {
  CountryCode: 'string',
  Currency: 'string',
  DateTime: 'string',
  EmailAddress: 'string',
  NonNegativeFloat: 'number',
  NonNegativeInt: 'number',
  PhoneNumber: 'string',
  URL: 'string',
};

const config = {
  overwrite: true,
  schema,
  documents: [],
  config: {
    typesPrefix: 'Gql',
  },
  generates: {
    'src/__generated__/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-resolvers',
        'time',
        { add: { content: autogenPrefix } satisfies AddPluginConfig },
      ],
      config: {
        // Set the resolver context to our custom type
        contextType: 'ResolverContext',
        optionalInfoArgument: true,
        useTypeImports: true,
        // Allow to return only partial objects, so child resolvers can decide
        // how to handle the field
        defaultMapper: 'Partial<{T}>',
        // See https://the-guild.dev/graphql/scalars/docs/quick-start#graphql-code-generator-integration
        scalars: customScalars,
      },
    },
    'src/__generated__/graphql.schema.json': {
      plugins: ['introspection'],
      config: {
        scalars: customScalars,
      },
    },
  },
} satisfies CodegenConfig;

export default config;
