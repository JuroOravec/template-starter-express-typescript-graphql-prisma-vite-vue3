import toInteger from 'lodash/toInteger';
import type { Router } from 'vue-router';

import { config } from '@/../globals/config';
import type { Job } from '@/../lib/jobs';
import type { useHomeModal } from './composables/useHomeModal';

interface JobContext {
  router: Router;
  modal: ReturnType<typeof useHomeModal>;
}

// Set up paddle Checkouot lib
// See https://developer.paddle.com/getting-started/39437d80612f3-import-the-paddle-js-library
const setupPaddleCheckout: Job<JobContext> = async (args, done) => {
  const Paddle = (globalThis as any).Paddle;
  if (!Paddle) return;

  if (config.paygatePaddleEnv !== 'prod') {
    Paddle.Environment.set(config.paygatePaddleEnv);
  }

  Paddle.Setup({ vendor: toInteger(config.paygatePaddleVendorId) });

  done();
};

export const homeJobs = [setupPaddleCheckout];
