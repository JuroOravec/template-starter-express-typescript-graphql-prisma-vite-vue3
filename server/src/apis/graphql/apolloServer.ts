import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';

import { rootSchema, rootResolvers } from './endpoints/root';
import { userSchema, userResolvers } from './endpoints/user';
import { authDirectiveSchema, authDirectiveTransformer } from './directives/auth'; // prettier-ignore
import type { ResolverContext } from './types';
import { inheritsDirectiveTransformer, inheritsDirectiveSchema } from './directives/inherits';
import { paginateDirectiveSchema, paginateDirectiveTransformer } from './directives/paginate';

// Install a landing page plugin based on NODE_ENV.
// This mimics the default behaviour.
// See https://www.apollographql.com/docs/apollo-server/api/plugin/landing-pages/
const landingPagePlugin =
  process.env.NODE_ENV === 'production'
    ? ApolloServerPluginLandingPageProductionDefault({})
    : ApolloServerPluginLandingPageLocalDefault({});

const createSchema = () => {
  const initialSchema = makeExecutableSchema({
    typeDefs: [
      // See https://the-guild.dev/graphql/scalars/docs/usage
      ...scalarTypeDefs,
      rootSchema,
      userSchema,
      inheritsDirectiveSchema,
      authDirectiveSchema,
      paginateDirectiveSchema,
    ],
    resolvers: [rootResolvers, userResolvers],
  });

  const directiveTransformers = [
    inheritsDirectiveTransformer,
    authDirectiveTransformer,
    paginateDirectiveTransformer,
  ];

  const schema = directiveTransformers.reduce((schema, fn) => fn(schema), initialSchema); // prettier-ignore
  return schema;
};

export const apolloServer = new ApolloServer<ResolverContext>({
  schema: createSchema(),
  plugins: [landingPagePlugin],
  // See https://www.apollographql.com/docs/apollo-server/data/errors
  status400ForVariableCoercionErrors: true,
});
