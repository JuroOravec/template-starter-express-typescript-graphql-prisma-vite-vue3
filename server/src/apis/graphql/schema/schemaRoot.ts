import { gql } from 'apollo-server-express';

export const schemaRoot = gql`
  type Query {
    dummy: String
  }

  type Mutation {
    dummy: String
  }
`;
