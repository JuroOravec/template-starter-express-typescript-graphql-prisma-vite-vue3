// Configuration for Apollo GraphQL VS Code extension
// This config enables type safety and intellisense for GraphQL syntax
// inside .graphql files or gql`` string
module.exports = {
  client: {
    service: {
      name: 'my-graphql-app',
      // NOTE: Use first if your workspace is at root of the project
      // OR use the second if your workspace is inside the './client' directory
      localSchemaFile: 'client/src/__generated__/graphql.schema.json',
      // localSchemaFile:   'src/__generated__/graphql.schema.json',
    },
    includes: ['./src/datasources/**/*.ts', './src/datasources/**/*.graphql'],
    excludes: ['**/__tests__/**', '**/__generated__/**'],
  },
};
