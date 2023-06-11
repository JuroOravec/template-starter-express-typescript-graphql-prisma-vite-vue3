import type { AppContext } from '@/globals/context';

/**
 * Context available in ResolverContext.
 *
 * NOTE: While currently it's the same as AppContext, we keep these
 * two types separate, as ResolverContext could be enriched with
 * different data than AppContext.
 */
export type ResolverContext = AppContext;
