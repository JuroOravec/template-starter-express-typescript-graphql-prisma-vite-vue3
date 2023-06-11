import bcrypt from 'bcrypt';

import type { User } from '@prisma/client';

export const encryptPassword = async (plaintextPassword: string): Promise<string> => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(plaintextPassword, saltRounds);
  return hash;
};

export const verifyPassword = async (user: User, password: string): Promise<boolean> => {
  return bcrypt.compare(password, user.password);
};
