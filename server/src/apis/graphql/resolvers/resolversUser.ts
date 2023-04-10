import type { User } from '@prisma/client';
import type { IResolvers } from '@graphql-tools/utils';

import { getUserById } from '@/datasources/serverDb/endpointsUser';

export const resolversUser: IResolvers = {
  Query: {
    currentUser: async (
      _parent: any,
      _args: any,
      context: any,
    ): Promise<User | null> => {
      return getUserById(context.user.id);
    },
  },
};
