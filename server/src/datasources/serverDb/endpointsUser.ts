import type { User } from '@prisma/client';

import { encryptPassword } from '@/modules/auth/utils/encryptPassword';
import { serverDbClient } from './serverDbClient';
import { uuid } from '@/modules/core/utils/uuid';

export const getUserById = (id: string): Promise<User | null> =>
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
  return serverDbClient.user.create({
    data: {
      id: uuid(),
      email,
      password: await encryptPassword(plaintextPassword),
    },
  });
};
