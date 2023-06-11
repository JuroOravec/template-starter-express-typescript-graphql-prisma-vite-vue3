import type Prisma from '@prisma/client';
import type { AppContext } from '@/globals/context';

declare global {
  namespace Express {
    /* eslint-disable-next-line */
    interface User extends Prisma.User {}

    /** Add our custom fields to request object available in Express */
    interface Request {
      context: AppContext;
    }
  }
}
