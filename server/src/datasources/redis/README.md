# Redis

## Best practices

### Utility operations

Sometimes we need to define an operation with some overhead, or there's a sequence of operations that only make sense together (or as a single transaction). In these cases, we can define them in the `./endpoints` directory.

As an example, for multi-authentication flow (MFA) operations, there's the overhead of prefixing the entry keys to avoid collisions. Hence, the related code can be found in `./endpoints/mfa.ts`.
