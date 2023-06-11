import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import gql from 'graphql-tag';
import {
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { GraphQLNonNegativeInt } from 'graphql-scalars';

import type { GqlPaginateDirectiveArgs } from '@/__generated__/graphql';

// Pagination
// See https://graphql.org/learn/pagination/
// And https://relay.dev/graphql/connections.htm

const PAGINATE_DIRECTIVE = 'paginate';

export const paginateDirectiveSchema = gql`
  """
  Transform a FIELD on ObjectType into a pagination object.

  The type of the field is used as the "node" type.
  You can optionally set "edge" type and pagination defaults.

  Implements the GraphQL Cursor Connections Specification. Learn more at https://relay.dev/graphql/connections.htm.
  """
  directive @paginate(
    """
    Optionally specify type of the edge. This will copy the interfaces and fields from edgeType.
    """
    edgeType: String
    """
    Optionally specify defaults that will be applied for each pagination.
    """
    defaults: PaginateDirectiveDefaults
  ) on FIELD_DEFINITION

  input PaginateDirectiveDefaults {
    itemsPerPage: NonNegativeInt
    # NOTE: In the future you can implement sorting and filtering
    # order: ...
  }

  """
  Interface for cursor pagination connection.

  This interface follows the GraphQL Cursor Connections Specification. See https://relay.dev/graphql/connections.htm#sec-Connection-Types
  """
  interface Connection {
    edges: [Edge!]!
    pageInfo: PageInfo!
  }

  """
  Partial interface for cursor pagination edge.

  The 'node' field is intentionally omitted as that differs between implementations.

  This interface follows the GraphQL Cursor Connections Specification. See https://relay.dev/graphql/connections.htm#sec-Edge-Types
  """
  interface Edge {
    cursor: String!
  }

  type PageInfo {
    totalCount: NonNegativeInt!
    """
    Whether more edges exist after to the defined set.
    """
    hasNextPage: Boolean!
    """
    Whether more edges exist prior to the defined set.
    """
    hasPreviousPage: Boolean!
    """
    Cursor corresponding to the first node in edges.
    """
    startCursor: String
    """
    Cursor corresponding to the last node in edges.
    """
    endCursor: String
  }
`;

/** Same as `Type! (non-null type) */
const nonNull = <T extends GraphQLNullableType>(gqlType: T) => new GraphQLNonNull(gqlType);
/** Same as `[Type!]!` (non-null type in non-null list) */
const nonNullList = <T extends GraphQLNullableType>(gqlType: T) =>
  new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(gqlType)));

const connSpecTxt =
  'See GraphQL Cursor Connections Specification (https://relay.dev/graphql/connections.htm#sec-Connection-Types)';
const edgeSpecTxt =
  'See GraphQL Cursor Connections Specification (https://relay.dev/graphql/connections.htm#sec-Edge-Types)';

/**
 * Example usage:
 *
 * ```graphql
 * type PageType @inherits(types: ["PageInfo"]) {
 *   hello: String!
 *   pageInfos: ScraperVote @paginate(edgeType: "Scraper", defaults: { itemsPerPage: 33 })
 * }
 * ```
 */
export const paginateDirectiveTransformer = (schema: GraphQLSchema): GraphQLSchema => {
  const typeDirectiveArgumentMaps: Record<string, GqlPaginateDirectiveArgs> = {};

  return mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      const paginateArgs = getDirective(schema, type, PAGINATE_DIRECTIVE)?.[0] as GqlPaginateDirectiveArgs; // prettier-ignore
      if (paginateArgs) {
        typeDirectiveArgumentMaps[type.name] = paginateArgs;
      }
      return undefined;
    },

    // Executes once for each object field definition in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const args = (getDirective(schema, fieldConfig, PAGINATE_DIRECTIVE)?.[0] ?? typeDirectiveArgumentMaps[typeName] ?? null) as GqlPaginateDirectiveArgs | null; // prettier-ignore
      if (!args) return undefined;

      const typeMap = schema.getTypeMap();

      const connInterface = typeMap.Connection as GraphQLInterfaceType;
      const edgeInterface = typeMap.Edge as GraphQLInterfaceType;
      const edgeType = args.edgeType ? (typeMap[args.edgeType] as GraphQLObjectType) : null;
      const nodeType = fieldConfig.type as GraphQLObjectType;
      const pageInfoType = typeMap.PageInfo as GraphQLObjectType;

      /**
       * Type implementation of:
       * ```graphql
       * interface Edge {
       *   node: JSONObject!
       *   cursor: String!
       * }
       * ```
       * See https://relay.dev/graphql/connections.htm#sec-Edge-Types
       */
      const connEdgeType = new GraphQLObjectType({
        name: `${nodeType.name}Edge`,
        description: `Connection edge pointing to ${nodeType.name}. ${edgeSpecTxt}`,
        interfaces: [...(edgeType?.getInterfaces() ?? []), edgeInterface],
        fields: () => ({
          ...edgeType?.getFields(),
          node: { type: nonNull(nodeType) },
          cursor: { type: nonNull(GraphQLString) },
        }),
      });

      /**
       * Type implementation of:
       * ```graphql
       * interface Connection {
       *   edges: [Edge!]!
       *   pageInfo: PageInfo!
       * }
       * ```
       * See https://relay.dev/graphql/connections.htm#sec-Connection-Types
       */
      const connType = new GraphQLObjectType({
        name: `${nodeType.name}Connection`,
        description: `Connection pointing to ${nodeType.name}. ${connSpecTxt}`,
        interfaces: [connInterface],
        fields: () => ({
          edges: { type: nonNullList(connEdgeType) },
          pageInfo: { type: nonNull(pageInfoType) },
        }),
      });

      fieldConfig.type = connType;
      fieldConfig.description = fieldConfig.description ?? `Connection pointing to ${nodeType.name}`; // prettier-ignore
      fieldConfig.args = {
        ...fieldConfig.args,
        // Fwd pagination
        // https://relay.dev/graphql/connections.htm#sec-Forward-pagination-arguments
        first: {
          description: 'How many items to take from the start of the results list.',
          type: GraphQLNonNegativeInt,
          defaultValue: args?.defaults?.itemsPerPage ?? null,
        },
        after: {
          description: 'Return items AFTER this cursor',
          type: GraphQLString,
        },
        // Bwd pagination
        // https://relay.dev/graphql/connections.htm#sec-Backward-pagination-arguments
        last: {
          description: 'How many items to take from the start of the results list.',
          type: GraphQLNonNegativeInt,
          defaultValue: args?.defaults?.itemsPerPage ?? null,
        },
        before: {
          description: 'Return items BEFORE this cursor',
          type: GraphQLString,
        },
      };

      return fieldConfig;
    },
  });
};
