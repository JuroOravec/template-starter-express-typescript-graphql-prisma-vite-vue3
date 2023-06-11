import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import type { GraphQLObjectType, GraphQLSchema } from 'graphql';
import gql from 'graphql-tag';

interface InheritsDirectiveInput {
  /**
   * Field names from which the object inherits fields.
   *
   * Behaviour is similar to Lodash `defaults` - the objects are applied
   * left-to-right, and fields are applied only if not present alredy. This
   * allows the "child" type to "override" the parent definition.
   */
  types: string[];
}

const INHERITS_DIRECTIVE = 'inherits';

/**
 * Allow GraphQL objects to "inherit" fields from other types
 *
 * Based on https://stackoverflow.com/questions/41921137
 */
export const inheritsDirectiveSchema = gql`
  directive @inherits(types: [String!]!) on OBJECT
`;

/**
 * Allow GraphQL objects to "inherit" fields from other types
 *
 * Transform GraphQL schema. If a field or type contains `@inherits` directive,
 * it copies the fields from the "parent" types to the "child" type.
 *
 * NOTE: Can be used only on Types. Cannot be used with nor Interfaces nor Inputs.
 *
 * See
 * - https://spec.graphql.org/June2018/#sec-Language.Directives
 * - https://www.graphql-tools.com/docs/schema-directives#enforcing-access-permissions
 * - https://the-guild.dev/graphql/tools/docs/schema-directives#implementing-schema-directives
 */
export const inheritsDirectiveTransformer = (schema: GraphQLSchema): GraphQLSchema => {
  const typeDirectiveArgumentMaps: Record<string, InheritsDirectiveInput> = {};

  return mapSchema(schema, {
    // Allow to use the directive on type too (if I understand correctly)
    [MapperKind.TYPE]: (type) => {
      const inheritsArgs = getDirective(schema, type, INHERITS_DIRECTIVE)?.[0] as InheritsDirectiveInput; // prettier-ignore
      if (inheritsArgs) {
        typeDirectiveArgumentMaps[type.name] = inheritsArgs;
      }
      return undefined;
    },

    [MapperKind.OBJECT_TYPE]: (type) => {
      const inheritsArgs = (getDirective(schema, type, INHERITS_DIRECTIVE)?.[0] ?? typeDirectiveArgumentMaps[type.name]) as InheritsDirectiveInput; // prettier-ignore
      if (inheritsArgs) {
        const fields = type.getFields();
        const typeMap = schema.getTypeMap();
        // NOTE: Processing the schema might fail if we use this directive on non-object types
        const baseTypes = (inheritsArgs.types ?? []).map(
          (parentType) => typeMap[parentType],
        ) as GraphQLObjectType[];
        // For each parent type, get all its fields, and paste them to the current object
        baseTypes.forEach((baseType) => {
          Object.entries(baseType.getFields()).forEach(([name, field]) => {
            if (fields[name] === undefined) {
              fields[name] = { ...field };
            }
          });
        });
      }
      return undefined;
    },
  });
};
