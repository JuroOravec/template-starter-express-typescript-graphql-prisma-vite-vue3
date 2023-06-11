import type { Prisma, PrismaClient, User, UserRole, UserSettings } from '@prisma/client';
import Joi from 'joi';

import type { GqlUserRoleType } from '@/__generated__/graphql';
import { encryptPassword } from '@/modules/auth/utils/encryptPassword';
import { uuid } from '@/utils/uuid';
import { logger } from '@/globals/logger';

////////////////////////////////////
// USER
////////////////////////////////////

export const getUserById = (client: PrismaClient, userId: string): Promise<User | null> =>
  client.user.findUnique({ where: { userId } });

export const getUserByEmail = (client: PrismaClient, email: string): Promise<User | null> =>
  client.user.findUnique({ where: { email } });

export const createUser = async (
  client: PrismaClient,
  { email, plaintextPassword }: { email: string; plaintextPassword: string },
): Promise<User | null> => {
  return client.user.create({
    data: {
      userId: uuid(16),
      email,
      password: await encryptPassword(plaintextPassword),
    },
  });
};

////////////////////////////////////
// USER ROLE
////////////////////////////////////

export const getUserRoles = (
  client: PrismaClient,
  { userId }: { userId: string },
): Promise<UserRole[]> => client.userRole.findMany({ where: { userId } });

/** Overwrite user roles for given user */
export const setUserRoles = async (
  client: PrismaClient,
  { userId, roles }: { userId: string; roles: GqlUserRoleType[] },
): Promise<UserRole[]> => {
  const deleteOldRoles = client.userRole.deleteMany({
    where: { userId },
  });

  const newUserRoles: UserRole[] = roles.map((role) => ({
    userRoleId: uuid(16),
    userId,
    role,
  }));

  const insertNewRoles = client.userRole.createMany({
    data: newUserRoles,
  });

  const [_, createdRoles] = await client.$transaction([deleteOldRoles, insertNewRoles]);

  if (createdRoles.count !== newUserRoles.length) {
    logger.warn(
      `Partial batch insert in ${setUserRoles.name}. Given: ${newUserRoles.length} Inserted: ${createdRoles.count}`,
    );
  }

  return newUserRoles;
};

////////////////////////////////////
// USER SETTINGS
////////////////////////////////////

export type UserSettingsUpdateInput = Omit<
  Prisma.UserSettingsUncheckedUpdateInput,
  'userId' | 'userSettingsId'
> &
  Pick<UserSettings, 'userId'>;

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId' | 'userSettingsId'> = {
  testVal: 1000,
};

const userSettingsValidationSchema = Joi.object<UserSettings>({
  userId: Joi.string().uuid({ version: 'uuidv4' }).required(),
  testVal: Joi.number().min(0),
})
  .required()
  .unknown(true);

export const getUserSettings = (
  client: PrismaClient,
  { userId }: { userId: string },
): Promise<UserSettings | null> => {
  return client.userSettings.findUnique({ where: { userId } });
};

export const updateUserSettings = async (
  client: PrismaClient,
  input: UserSettingsUpdateInput,
): Promise<UserSettings | null> => {
  Joi.assert(input, userSettingsValidationSchema);

  const { userId, testVal } = input;

  return client.userSettings
    .update({
      where: {
        userId,
      },
      data: {
        testVal,
      },
    })
    .catch((err) => {
      logger.error(err);
      return null;
    });
};
