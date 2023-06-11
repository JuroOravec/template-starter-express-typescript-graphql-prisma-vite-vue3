import gql from 'graphql-tag';

import type { GqlResolvers } from '@/__generated__/graphql';

/////////////////////////////////////////////
// 1. SCHEMA
/////////////////////////////////////////////

export const rootSchema = gql`
  # Define custom scalars here
  # See https://the-guild.dev/graphql/scalars/docs/quick-start#in-your-sdl-type-definitions
  scalar CountryCode
  scalar Currency
  scalar DateTime
  scalar EmailAddress
  scalar JSONObject
  scalar NonNegativeFloat
  scalar NonNegativeInt
  scalar PhoneNumber
  scalar URL
  scalar Void

  # Define custom directives
  # See https://www.apollographql.com/docs/apollo-server/schema/directives/

  type Query {
    hello: String
    """
    Queries available to authenticated user.
    """
    me: MeQuery @auth(roles: [])
    """
    Queries available to authenticated admin user.
    """
    admin: AdminQuery @auth(roles: [ADMIN])
  }

  type MeQuery {
    hello: String
  }

  type AdminQuery {
    hello: String
  }

  type Mutation {
    hello: String
    """
    Mutations available to authenticated user.
    """
    me: MeMutation @auth(roles: [])
    """
    Mutations available to authenticated admin user.
    """
    admin: AdminMutation @auth(roles: [ADMIN])
  }

  type MeMutation {
    hello: String
  }

  type AdminMutation {
    hello: String
  }
`;

/////////////////////////////////////////////
// 2. RESOLVERS
/////////////////////////////////////////////

export const rootResolvers: GqlResolvers = {
  Query: {
    hello: () => 'world',
    // Let child resolvers process the queries
    me: async () => ({}),
    admin: async () => ({}),
  },

  MeQuery: {
    hello: () => 'World',
  },

  AdminQuery: {
    hello: () => 'World',
  },

  Mutation: {
    hello: () => 'world',
    // Let child resolvers process the queries
    me: async () => ({}),
    admin: async () => ({}),
  },

  MeMutation: {
    hello: () => 'World',
  },

  AdminMutation: {
    hello: () => 'World',
  },
};
