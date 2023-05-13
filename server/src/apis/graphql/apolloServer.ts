import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ApolloServer } from '@apollo/server';

import { schemaRoot } from './schema/schemaRoot';
import { schemaUser } from './schema/schemaUser';
import { resolversUser } from './resolvers/resolversUser';

// Install a landing page plugin based on NODE_ENV.
// This mimics the default behaviour.
// See https://www.apollographql.com/docs/apollo-server/api/plugin/landing-pages/
const landingPagePlugin =
  process.env.NODE_ENV === 'production'
    ? ApolloServerPluginLandingPageProductionDefault({})
    : ApolloServerPluginLandingPageLocalDefault({});

export const apolloServer = new ApolloServer({
  typeDefs: [schemaRoot, schemaUser],
  resolvers: [resolversUser],
  plugins: [landingPagePlugin],
});
