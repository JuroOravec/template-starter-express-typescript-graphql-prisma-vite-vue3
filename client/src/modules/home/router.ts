import { ArrVal, RouteItem, enumFromArray } from '../../utils/types';

const HOME_ROUTES = ['home', 'about', 'pricing'] as const;
export type HomeRoute = ArrVal<typeof HOME_ROUTES>;
export const HomeRouteEnum = enumFromArray(HOME_ROUTES);

// Single place to define all routes + page metadata
// Learn more https://nuxt.com/docs/guide/going-further/custom-routing
export const homeRoutes = {
  home: {
    name: 'home',
    path: '/',
    layout: 'home-layout',
  },
  pricing: {
    name: 'pricing',
    path: '/pricing',
    layout: 'home-layout',
  },
  about: {
    name: 'about',
    path: '/about',
    layout: 'home-layout',
  },
} satisfies Record<HomeRoute, RouteItem<HomeRoute>>;