import gql from 'graphql-tag';

import {
  DEFAULT_USER_SETTINGS,
  getUserSettings,
  getUserRoles,
  updateUserSettings,
  ServerDbUserSettingsUpdateInput,
} from '@/datasources/prisma/endpoints/user';
import type {
  GqlUser,
  GqlResolvers,
  GqlUserRoleType,
  GqlUserSettingsUpdateInput,
} from '@/__generated__/graphql';
import type { User } from '@prisma/client';
import type { PartialFields } from '@/utils/types';

/////////////////////////////////////////////
// 1. SCHEMA
/////////////////////////////////////////////

export const userSchema = gql`
  extend type MeQuery {
    user: User
  }

  extend type MeMutation {
    updateUserSettings(userSettings: UserSettingsUpdateInput!): UserSettings
  }

  type User {
    userId: String!
    firstName: String
    lastName: String
    email: EmailAddress!
    userRoles: [UserRoleType!]!
    userSettings: UserSettings!
  }

  type UserSettings {
    userId: String!
    testVal: Int!
  }

  input UserSettingsUpdateInput {
    testVal: Int
  }
`;

/////////////////////////////////////////////
// 2. RESOLVERS
/////////////////////////////////////////////

export const userResolvers: GqlResolvers = {
  MeQuery: {
    user: async (_parent, _args, { user }) => {
      if (!user?.userId) return null;
      return sdb2gqlUser(user);
    },
  },

  MeMutation: {
    updateUserSettings: async (_parent, { userSettings }, { prisma, user }) => {
      const userId = user?.userId;
      if (!userId) return null;
      const userSettingsInput = gql2prismaUserSettingsUpdateInput({
        userId,
        userSettings,
      });
      const updatedUserSettings = await updateUserSettings(prisma, userSettingsInput);
      return updatedUserSettings;
    },
  },

  User: {
    userRoles: async ({ userId }, _args, { prisma }) => {
      if (!userId) return [];
      const userRoles = await getUserRoles(prisma, { userId });
      return userRoles.map((role) => role.role as GqlUserRoleType);
    },

    userSettings: async ({ userId }, _args, { prisma }) => {
      const defaultSettings = { ...DEFAULT_USER_SETTINGS, userId };
      if (!userId) return defaultSettings;

      const userSettings = await getUserSettings(prisma, { userId });
      return userSettings ?? defaultSettings;
    },
  },
};

/////////////////////////////////////////////
// 3. TRANSFORMERS
/////////////////////////////////////////////

const sdb2gqlUser = (user: User): PartialFields<GqlUser, 'userRoles' | 'userSettings'> => ({
  ...user,
});

const gql2prismaUserSettingsUpdateInput = ({
  userId,
  userSettings,
}: {
  userId: string;
  userSettings: GqlUserSettingsUpdateInput;
}): ServerDbUserSettingsUpdateInput => ({
  userId,
  testVal: userSettings.testVal ?? undefined,
});
