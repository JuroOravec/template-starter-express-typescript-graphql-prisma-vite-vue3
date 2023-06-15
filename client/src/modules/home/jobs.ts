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

// Handle when / if the route includes ?mfa query param, which is set then
// the multi factor authentication (MFA) flow on our server redirects to here.
//
// Example URL
// http://localhost:3001/?mfa=eyJ0ZXN0IjoiaGVsbG8ifQ%253D%253D
//
// To test out the decoding in devtools, run:
// JSON.parse(atob(decodeURIComponent(decodeURIComponent((new URL(location.href)).searchParams.get('mfa')))))
//
// Which should yield: {
//   "test": "hello",
// }
//
// To encode a test payload, run:
// var encodePayload = (p) => encodeURIComponent(encodeURIComponent(btoa(JSON.stringify(p))));
// encodePayload({ some: 'value' });
//
const handleMfaPayload: Job<JobContext> = async ({ modal, router }, done) => {
  // If location is missing, we're probably on the server
  if (!globalThis.location) return;

  const url = globalThis.location.href;
  const urlObj = new URL(url);
  const mfa = urlObj.searchParams.get('mfa') ?? null;
  const mfaFail = urlObj.searchParams.get('mfa-fail') ?? null;

  if (!mfa && !mfaFail) return;

  // Handle the case when MFA verification failed
  if (!mfa) {
    // TODO - Change used modal component - This is for demo only
    modal.push({ name: 'mfaFail', props: {} });
    // Remove the ?mfa-fail query param
    router.replace({
      query: { ...router.currentRoute.value.query, 'mfa-fail': undefined },
    });
    return;
  }

  // NOTE: 2x decodeURIComponent is not a mistake
  const step1 = decodeURIComponent(mfa);
  const step2 = decodeURIComponent(step1);
  const step3 = atob(step2);
  const payload = JSON.parse(step3);

  const eventType = payload?.type;
  const eventHandler =
    mfaEventHandlers[eventType as keyof typeof mfaEventHandlers];
  if (!eventType)
    throw Error('Invalid MFA payload - property "type" is missing');
  else if (!eventHandler) {
    throw Error(`Unknown event type "${eventType}"`);
  }

  await eventHandler({ modal, router, payload });

  // If we got here, then we've processed the mfa query param and we can
  // remove the ?mfa
  router.replace({
    query: { ...router.currentRoute.value.query, mfa: undefined },
  });
};

const mfaEventHandlers = {
  scraperVoteRedeem: ({ modal, payload }) => {
    // TODO - Change used modal component - This is for demo only
    modal.push({ name: 'checkoutFail', props: { payload } });
  },
} satisfies Record<string, Job<JobContext & { payload: any }>>;

export const homeJobs = [setupPaddleCheckout, handleMfaPayload];
