# Multi-Factor Authentication (MFA) module

## Best practices

- Keep the file names of handlers in [./flows](./flows/) same as the field `type`
  to `args` and `data` in `MfaClient.createChallenge`.
  That way, we know what belongs where.

  E.g. there's file [./flows/exampleFlow.ts](./flows/exampleFlow) for
  handling data with `type: "exampleFlow"`
