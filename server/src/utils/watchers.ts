import difference from 'lodash/difference';

import type { MaybePromise } from './types';

export type WatcherJob<T = unknown> = (args: T, done: () => void) => MaybePromise<void>;

export interface WatcherJobOptions<T = unknown> {
  jobs: WatcherJob<T>[];
  args?: T;
  intervalMs?: number;
}

/** By default check every 250 ms */
const checkIntervalMs = 250;

/** Setup scripts that need to be run periodically */
export const setupWatchersJobs = <T>(input: WatcherJobOptions<T>) => {
  let remainingJobs = [...input.jobs];

  const runJobs = async () => {
    const jobsToRemove: WatcherJob<T>[] = [];

    // NOTE: Jobs can signal that they've finished and don't need to be called anymore
    for (const job of remainingJobs) {
      const onDone = () => jobsToRemove.push(job);
      await job(input.args!, onDone);
    }

    // We remove the finished jobs in a different step than we run the current jobs,
    // to avoid issues with mutating the remainingJobs during the loop
    remainingJobs = difference(remainingJobs, jobsToRemove);
  };

  const intervalId = setInterval(() => {
    runJobs().catch((error: Error) => console.error({ error }, `Watcher failed: ${error}`.trim()));
  }, input?.intervalMs ?? checkIntervalMs);

  return () => clearInterval(intervalId);
};
