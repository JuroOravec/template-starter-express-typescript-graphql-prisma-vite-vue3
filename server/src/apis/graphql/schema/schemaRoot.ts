import gql from 'graphql-tag';

export const schemaRoot = gql`
  type Query {
    dummy: String
  }

  type Mutation {
    dummy: String
  }
`;
