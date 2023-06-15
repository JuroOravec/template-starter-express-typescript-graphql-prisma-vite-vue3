import difference from 'lodash/difference';

import type { MaybePromise } from '../../utils/types';
import { logger } from '@/globals/logger';

export type Job<T = unknown> = (args: T, done: () => void) => MaybePromise<void>;

export interface JobOptions<T = unknown> {
  jobs: Job<T>[];
  args: T;
  intervalMs?: number;
}

/** By default check every 250 ms */
const checkIntervalMs = 250;

/** Setup scripts that need to be run periodically */
export const setupJobs = <T>(input: JobOptions<T>) => {
  let remainingJobs = [...input.jobs];

  const runJobs = async () => {
    const jobsToRemove: Job<T>[] = [];

    // NOTE: Jobs can signal that they've finished and don't need to be called anymore
    for (const job of remainingJobs) {
      const onDone = () => jobsToRemove.push(job);
      await job(input.args, onDone);
    }

    // We remove the finished jobs in a different step than we run the current jobs,
    // to avoid issues with mutating the remainingJobs during the loop
    remainingJobs = difference(remainingJobs, jobsToRemove);
  };

  const intervalId = setInterval(() => {
    runJobs().catch((error: Error) => logger.error({ error }, `Job failed: ${error}`.trim()));
  }, input?.intervalMs ?? checkIntervalMs);

  return () => clearInterval(intervalId);
};
