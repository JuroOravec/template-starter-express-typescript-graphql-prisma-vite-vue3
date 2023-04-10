import { encryptPassword } from '@/modules/auth/utils/encryptPassword';
import type { Prisma, User } from '@prisma/client';

import { serverDbClient } from './serverDbClient';

export const getUserById = (id: number): Promise<User | null> =>
  serverDbClient.user.findUnique({ where: { id } });

export const getUserByEmail = (email: string): Promise<User | null> =>
  serverDbClient.user.findUnique({ where: { email } });

export const createUser = async ({
  email,
  plaintextPassword,
}: {
  email: string;
  plaintextPassword: string;
}): Promise<User | null> => {
  const user: Prisma.UserCreateInput = {
    email,
    password: await encryptPassword(plaintextPassword),
  };

  return serverDbClient.user.create({ data: user });
};
