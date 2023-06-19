import type { PageMeta } from 'nuxt/app';

import { ArrVal, enumFromArray } from '../../utils/types';

const LEGAL_ROUTES = ['cookie-policy', 'privacy-policy', 'terms-of-use', 'disclaimer'] as const;
export type LegalRoute = ArrVal<typeof LEGAL_ROUTES>;
export const LegalRouteEnum = enumFromArray(LEGAL_ROUTES);

// Single place to define all routes + page metadata
// Learn more https://nuxt.com/docs/guide/going-further/custom-routing
export const legalRoutes = {
  'cookie-policy': {
    name: 'cookie-policy',
    path: '/legal/cookie-policy',
    layout: 'home-layout',
  },
  'privacy-policy': {
    name: 'privacy-policy',
    path: '/legal/privacy-policy',
    layout: 'home-layout',
  },
  'terms-of-use': {
    name: 'terms-of-use',
    path: '/legal/terms-of-use',
    layout: 'home-layout',
  },
  disclaimer: {
    name: 'disclaimer',
    path: '/legal/disclaimer',
    layout: 'home-layout',
  },
} satisfies Record<LegalRoute, PageMeta & { name: LegalRoute; path: string; layout: string }>;
