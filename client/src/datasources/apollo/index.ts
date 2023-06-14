import { defineApolloClient } from '@nuxtjs/apollo';
import type { ErrorHandler } from '@apollo/client/link/error';
import { logErrorMessages } from '@vue/apollo-util';
import type { TypePolicy } from '@apollo/client/cache';

import type { StrictTypedTypePolicies } from '@/../__generated__/graphql';
import possibleTypes from '../../__generated__/graphqlPossibleTypes';
import { config } from '../../globals/config';

const POLICY_NO_MERGE = { merge: false } satisfies TypePolicy;
const POLICY_MERGE = { merge: true } satisfies TypePolicy;

// Define how incoming data should be merged with data in cache
const typePolicies = {
  // Top-level or scoping (organizing) types. We merge these so that
  // nested results from various queries / mutations are all included.
  Query: POLICY_MERGE,
  Mutation: POLICY_MERGE,
  MeQuery: POLICY_MERGE,
  MeMutation: POLICY_MERGE,
  AdminQuery: POLICY_MERGE,
  AdminMutation: POLICY_MERGE,

  // Models - These should always have their IDs specified, so that we have
  // the latest data in the cache
  User: { ...POLICY_MERGE, keyFields: ['userId'] },
  UserSettings: { ...POLICY_MERGE, keyFields: ['userId'] },

  // Paginatino types - Do not merge these
  Connection: POLICY_NO_MERGE,
  Edge: POLICY_NO_MERGE,
  PageInfo: POLICY_NO_MERGE,
} satisfies Required<StrictTypedTypePolicies>;

// See https://apollo.nuxtjs.org/getting-started/configuration
export const apolloConfig = defineApolloClient({
  httpEndpoint: config.apolloUrl,
  httpLinkOptions: {
    fetchOptions: {
      credentials: 'include',
    },
  },
  // wsEndpoint: '',
  // wsLinkOptions: {},
  // websocketsOnly: false,
  connectToDevTools: config.apolloEnableDebug,
  defaultOptions: {
    query: {
      errorPolicy: 'all',
    },
    watchQuery: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  inMemoryCacheOptions: {
    possibleTypes: possibleTypes.possibleTypes,
    typePolicies,
  },
  tokenName: 'apollo:<client-name>.token',
  tokenStorage: 'cookie',
  authType: 'Bearer',
  authHeader: 'Authorization',
});

export const onApolloError: ErrorHandler = (err) => {
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(err);
  }
};
