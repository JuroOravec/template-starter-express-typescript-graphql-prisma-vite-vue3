# Jobs lib

Sometimes, there is logic that is not bound to Vue component lifecycle, nor has a reliable way
to be initialized via Vue reactivity. Such logic may need
to run once, couple of times, until something happens, or periodically.

Jobs lib is a utility for managing such "jobs".

With this utility, we define the "jobs" - functions to be run at intervals.

The "jobs" run until they themselves signal that they are done. So they
run only when needed.

NOTE: Jobs are usually in the `jobs.ts` file / folder. This is a good place
to put one off or initialisation scripts that don't fit anywhere else.

Example:

```ts
// Thsi will run periodically until the Paddle client has been set up
const setupPaddleCheckout: Job<JobContext> = async (args, done) => {
  const Paddle = (globalThis as any).Paddle;
  if (!Paddle) return;

  if (config.paygatePaddleEnv !== 'prod') {
    Paddle.Environment.set(config.paygatePaddleEnv);
  }

  Paddle.Setup({ vendor: toInteger(config.paygatePaddleVendorId) });

  done();
};
```

In App.vue script

```ts
import { useJobs } from '@/../lib/jobs';

if (process.client) {
  useJobs({
    jobs: [...homeJobs],
    args: { modal, router: useRouter() },
  });
}
```
