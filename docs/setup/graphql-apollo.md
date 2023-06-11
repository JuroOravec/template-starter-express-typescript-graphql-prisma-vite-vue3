# GraphQL + Apollo

## Intro

We use GraphQL + Apollo as the communication standard (GraphQL) + library (Apollo server) that sits between the server and the browser client (frontend).

Since it sits between server (backend) and browser client (frontend), we use some sort of GraphQL / Apollo tooling in both places.

> Why GraphQL + Apollo?
>
> GraphQL is designed for network communication where the network speed / connectivity may be a bottleneck. This is also true for browser users, who may be outdoors, have weak or intermitten signal, and so we need to do the necessary operations with as little bandwidth as possible.
>
> GraphQL helps us with that by:
>
> - Fetching ONLY the data (on field-level) that one actually needs.
> - Including multiple operations in a single request
> - Providing a framework to fulfill (resolve) data on a field-level basis, and hence
>   allowing to pack a lot of potentially diverse logic in a structured way that's abstracted away from the downstream client.

## Setup

### Server-side - Apollo Server

On the backend, we use the Apollo server to fulfill GraphQL requests. Since we provide data through it, it's in the `./apis` directory. Since we use Apollo Sserver with Express, you can think of Apollo server as a beefy Express route handler.

Apollo server:

1.  Receives a request
2.  Parses the body payload containing GraphQL
3.  Fetches/Prepares the requested data based on the GraphQL payload and server resolvers.
4.  Sends back the requested data, packaged as JSON.

### Server-side - Endpoints

Before you write a new endpoint on the GraphQL API, consider this:

Apollo server requires 2 pieces of info to work:

- Schema - to know WHAT data to provide
- Resolvers - to know HOW to get the data

In reality, there's more:

- Transformations - Usually for transforming data from upstream service (e.g. database) to format expected by GraphQL.
- Validation - So we can make sure that the data we recieve in a request matches our expectations.
- Directives - Custom logic that modifies behaviour of schema (e.g. for resources requiring authentication).

Hence, to keep the project managable at larger scale, we group all the pieces required to make an endpoint in a single file. That's what you can see in the `./apis/graphql/endpoints` folder, where each file will likely contain:

1. Partial schema definition
2. Partial schema resolvers
3. Possibly transformations
4. Possibly validation

> Why we use `graphql-tag` to define GraphQL schemas:
>
> There's multiple ways to write GraphQL schemas:
>
> - `.graphql` files
> - template function `gql` (from `graphql-tag`)
> - using GraphQL constructors
> - JS classes with GraphQL class decorators
> - vanilla JSON
> - ...
>
> We use the `graphql-tag` for these reasons:
>
> - Schema is defined in GraphQL syntax (smaller learning overhead compared to GraphQL-in-JS)
> - GraphQL syntax can be read by linters and codegen.
> - GraphQL syntax from `graphql-tag` can be inlined in files (unlike `.graphql` files), so it can be co-located with where it is being used

### Server-side - Directives

Directives are like function decorations that modify the behaviour of the entities (e.g. field or an object) that they're applied to.

They are defined on the server-side, since they modify how the SERVER interprets and resolves the schema.

All directives can be found in `./server/src/apis/graphql/directives`.

### Server-side - Pagination

One of the directives is specifically used to abstract away cursor-based pagination.

Before reading further, please read the [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm).

This specification outlines the query input and response structure for paginated lists.

Example:

```graphql
{
  user {
    id
    name
    friends(first: 10, after: "opaqueCursor") {
      edges {
        cursor
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}
```

Thanks to the directive, to achieve this schema structure with `edges`, `node`, `pageInfo`, etc, all we have to do in schema definition is to specify the `@pagination` directive:

```graphql
type ScraperQuery {
  getScrapers(status: ScraperStatus!): Scraper @paginate
  getScraperProducts: ScraperProduct @paginate
}
```

### Server-side - Custom scalars

Server defines the schema, and on the schema, it's possible to define custom "scalar" types.
The can be thought of as field values that encapsulate atomic values, unlike objects, which are just bags of fields of possibly other bags of fields

NOTE: the values doesn't necessarily needs to be a primitive (e.g. boolean, string, number, etc).

The built-in scalars cover the values like number, boolean, string, etc. However, when we have data with specialized meaning (e.g. email, country code, or even count (AKA non-neg int)) we can get validation for free with [graphql-scalars](https://the-guild.dev/graphql/scalars/docs).

There's 3 parts to using `graphql-scalars` beside just installing it:

1. Include scalars schema in the Apollo server definition.
2. Define the scalar in our GraphQL syntax too, so it's picked up by codegen.
3. Define the mapping from GraphQL scalar to TypeScript type in `codegen.ts`, so it's resolved correctly in TypeScript too.

This way we can use scalars like `NonNegativeInt`, to signify (and validate) that we accept only values like 0, 1, 2, ...

### Server-side - Tooling (typing)

Apollo server validates the data returned from resolvers based on the provided schema. Since we write the schema in `graphql` syntax, there's no typing system out of the box that'd tell us if the data we return makes sense or not. And even if there was, we still face the issue that our schema may be defined across many files.

To work around this, we rely on the `@graphql-codegen` library. This library can:

1. Extract partial schema definitions from `gql` tags, `.graphql` files, and more
2. Generate TypeScript types based on the merged schema
3. Generate helper utilities like functions.

The working of `@graphql-codegen` is configured in `./server/codegen.ts` and we use it for:

- Generating TypeScript types to provide typing for resolvers
- Exporting merged schema into JSON, which can be passed to other tools

The generated types are available globally from `./server/__generated__`.

NOTE: In `./server/package.json`, there's 2 commands to run `@graphql-codegen`:

- `graphql:gen:offline`
- `graphql:gen`

The first command can run without the server running - it uses just the static files to generate the schema. The second command, however, requires the server to be up and running.
We use the second command, because our GraphQL schema contains also dynamically-defined entities, which are not captured using the static file analysis.

Hence, the flow to generate GraphQL files on the server, we:

1. (optionally) Start docker-compose services required by the Node server
2. Start the Node server, which will build the GraphQL schema
3. Run `@graphql-codegen` (`npm run graphql:gen`) against the running server, generating the all types.

### Client-side - Tooling (typing)

On the client, we also want to generate the TypeScript types matching the data we fetch from the server.

On the client the job is a bit easier, because we assume that `@graphql-codegen` has already ran on the server-side and generated the JSON export of GraphQL schema `graphql.schema.json`.
And if that did happen, then we can just use the `graphql.schema.json` to create types and functions for the client-side.

Similarly, this is configured in `./client/codegen.ts`.

Beside just types, on the client we also define composable funcions. These helper functions that automatically wrap the GraphQL documents and add proper typing. Hence, by using these helper functions, we've got the guarantee that our TypeScript code is interpolating the data types correctly.

### Client-side - Endpoints

Once you've read about the GraphQL + Apollo setup on the server-side, you will see that client-side is very similar, except we don't have to define the server, nor resolvers, nor directives.

Furthermore, on the client, we're not stitching up the GraphQL schema, we're merely defining very specific requests aginst the GraphQL server, so each graphQL definition is small and self-encapsulated (usually):

```graphql
mutation createPriceEstimate(
  $estimateInput: PriceEstimateRequestInput!
  $contact: FormContactInfo!
) {
  form {
    createPriceEstimateRequest(input: $estimateInput, contact: $contact)
  }
}
```

Similarly to server-side GraphQL endpoints, also the client-side endpoints are designed for maintainability. A single resource (or few related) are encapsulated in a single file in the folder `./client/src/datasources/apollo/endpoints`, where each file likely contains:

1. GraphQL document (query or mutation)
2. Composable function that encapsulates the network communication
3. Possibly transformations
4. Possibly custom types

And similarly, we use `graphql-tag` for defining the queries / mutations on the client.

### Both-sides - Tooling (intellisense)

On both server and client, we use the VSCode extension [apollographql.vscode-apollo](https://www.apollographql.com/docs/devtools/editor-plugins/) to provide linting / type hints / intellisense for the GraphQL syntax.

The extension is configured in `./{server,client}/apollo.config.js`. For the extension to know how to validate our GraphQL syntax, we provide it the JSON of our GraphQL schema, as generated by `@graphql-codegen`.

The Apollo server doesn't need to be running for `apollographql.vscode-apollo` to work.

NOTE: The extension has problem picking up changes, so when you change the JSON schema, you should reload VS Code.

## Example flow

Imagine you need to get some data from the database to the client. Here are the steps you will need to do:

1. Create endpoint on server
   1. Modify GraphQL schema on the server-side (or create new file in `endpoints`, and define new schema there).
   2. Generate types for changed GraphQL schema
      1. Start up dev server
      2. Run apollo codegen against the running server
   3. Write resolvers for the new GraphQL schema
      > NOTE: This is where you plug in the data from the database!
   4. (If possible) verify endpoint with test
2. Write query on client that fetches the endpoint created on the server.
   1. Create or modify GraphQL statement (query / mutation) on the client-side
   2. Generate types and functions for the new GraphQL statement
   3. Create composable for the new GraphQL statement
   4. Use the composable in application
   5. (If possible) write test
