import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLFieldResolver, GraphQLSchema } from 'graphql';
import { intersection } from 'lodash';
import gql from 'graphql-tag';

import { getUserRoles } from '@/datasources/prisma/endpoints/user';
import type { ResolverContext } from '../types';
import { createApolloError } from '../utils/error';

interface AuthDirectiveInput {
  roles: string[];
}

const AUTH_DIRECTIVE = 'auth';

/**
 * Require correct auth role to access the resource.
 *
 * Based on https://www.graphql-tools.com/docs/schema-directives#enforcing-access-permissions
 */
export const authDirectiveSchema = gql`
  directive @auth(roles: [UserRoleType!] = [ADMIN]) on OBJECT | FIELD_DEFINITION

  # Note: Users without any roles are assumed to be regular users
  enum UserRoleType {
    # User with Admin priviledges
    ADMIN
  }
`;

const validateAuth = async (
  { user, prisma }: ResolverContext,
  authorizedRoles: string[],
): Promise<boolean> => {
  if (!user) return false;

  const userRoles = await getUserRoles(prisma, { userId: user.userId });
  const userRoleNames = userRoles.map((role) => role.role);

  const isAuthorized = Boolean(intersection(userRoleNames, authorizedRoles).length);
  return isAuthorized;
};

/**
 * Require correct auth role to access the resource.
 *
 * Transform GraphQL schema. If a field or type contains `@auth` directive,
 * it wraps their resolvers in function that first checks the access permission,
 * and throws if failed.
 *
 * Based on https://www.graphql-tools.com/docs/schema-directives#enforcing-access-permissions
 */
export const authDirectiveTransformer = (schema: GraphQLSchema): GraphQLSchema => {
  const typeDirectiveArgumentMaps: Record<string, AuthDirectiveInput> = {};

  return mapSchema(schema, {
    // Make specific types auth-only too (if I understand correctly)
    [MapperKind.TYPE]: (type) => {
      const authDirective = getDirective(schema, type, AUTH_DIRECTIVE)?.[0] as AuthDirectiveInput;
      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }
      return undefined;
    },

    // Executes once for each object field definition in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      // prettier-ignore
      const { roles = [] } = (
        getDirective(schema, fieldConfig, AUTH_DIRECTIVE)?.[0] ??
        typeDirectiveArgumentMaps[typeName] ??
        {}) as AuthDirectiveInput;

      if (!roles.length) return;

      const { resolve: origResolver } = fieldConfig;
      // prettier-ignore
      const newResolver: GraphQLFieldResolver<unknown, ResolverContext> = async (source, args, context, info) => {
        const hasAccess = await validateAuth(context, roles);
        if (!hasAccess) {
          throw createApolloError('Unauthorized', 'UNAUTHENTICATED');
        }
        return origResolver?.(source, args, context, info);
      };

      return {
        ...fieldConfig,
        resolve: newResolver,
      };
    },
  });
};
