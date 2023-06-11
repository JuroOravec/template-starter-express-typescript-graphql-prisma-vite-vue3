import { GraphQLError, GraphQLErrorOptions } from 'graphql';
import type { ApolloServerErrorCode } from '@apollo/server/errors';
import Joi from 'joi';

export type ApolloErrorCode = `${ApolloServerErrorCode}` | 'UNAUTHENTICATED';

/**
 * Construct an error denoting a problem during Apollo server handling of a request.
 *
 * In Apollo 3, these were provided by the library, but no more in Apollo 4.
 * See https://www.apollographql.com/docs/apollo-server/migration/#built-in-error-classes
 */
export const createApolloError = (
  msg: string,
  msgCode: ApolloErrorCode,
  options?: GraphQLErrorOptions,
) => {
  return new GraphQLError(msg, {
    ...options,
    extensions: {
      ...options?.extensions,
      code: msgCode,
    },
  });
};

/**
 * Validates an input received by GraphQL resolver.
 *
 * If validation fails, throws an Apollo Error, so this
 * function can be used directly in GraphQL resolvers.
 */
export const assertApolloInput = <T extends object>(input: T, validSchema: Joi.Schema) => {
  try {
    Joi.assert(input, validSchema);
  } catch (err) {
    throw createApolloError((err as Error).message, 'BAD_USER_INPUT');
  }
};
