import { gql } from 'apollo-server-express';

export const schemaUser = gql`
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
  }

  extend type Query {
    currentUser: User
  }
`;
