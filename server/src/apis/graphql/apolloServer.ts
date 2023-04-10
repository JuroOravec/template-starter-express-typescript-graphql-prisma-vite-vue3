import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import type { Request } from 'express';

import { schemaRoot } from './schema/schemaRoot';
import { schemaUser } from './schema/schemaUser';
import { resolversUser } from './resolvers/resolversUser';

export const apolloServer = new ApolloServer({
  typeDefs: [schemaRoot, schemaUser],
  resolvers: [resolversUser],
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  context: (req: Request): any => {
    // @TODO:
    return {
      user: req,
    };
  },
});
