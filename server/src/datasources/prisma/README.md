# Prisma

## Setup

### Prisma structure

We've split prisma `schema.prisma` definition into smaller chunks,
which are then joined together using [prisma-merge](https://github.com/inside-labs/prisma-merge).

Read more about the issue of Prisma and splitting schema here
<https://github.com/prisma/prisma/issues/2377>.

```txt
|-- prisma
    |-- base.prisma -- Defines Prisma data source URL and type
    |-- endpoints
    |   |-- user.prisma -- User-specific Prisma tables
    |   |-- user.ts -- Utility operations on top of User Prisma tables
    |   |-- ...
    |-- ...
```

## Best practices

### Utility operations

Sometimes we need to define a sequence of database operations that only make sense together (or as a single transaction). In these cases, we can define them in the `./endpoints` directory as TypeScript files.

If there's such file and it groups operations around a specific resource (or a few related ones), prefer to name the TypeScript file the same way as is the prisma file.

Example:

1. Our Prisma schema for user-related tables is defined in `user.prisma`.
2. Hence, if we have some operations built on top of user tables, we should
   define them in a file `user.ts`.

### Timestamps

- For primary resources (objects/tables that make sense on their own), use `dateCreated`
  for timestamps:

  ```prisma
  model X {
     dateCreated  DateTime  @default(now())
  }
  ```

- For intersection resources (table connecting other tables), use `assignedAt`
  for timestamps:

  ```prisma
  model XplusB {
     assignedAt  DateTime  @default(now())
  }
  ```
