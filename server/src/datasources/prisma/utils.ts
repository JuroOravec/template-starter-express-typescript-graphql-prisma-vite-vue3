import type { PrismaClient } from '@prisma/client';

import type { AnyPrismaDelegate, PrismaDelegate } from './types';

/**
 * Alternative to Prisma's missing `upsertMany`.
 *
 * Use this helper to SET the data in database to the given incoming
 * dataset.
 *
 * Existing entries in the database are deleted and replaced. Missing
 * entries are created.
 */
export const upsertMany = async <T extends PrismaDelegate>(
  prisma: PrismaClient,
  prismaTable: T,
  input: {
    delete: NonNullable<Parameters<T['deleteMany']>[0]>;
    create: NonNullable<Parameters<T['createMany']>[0]>;
  },
) => {
  // NOTE: Do delete + create since upsertMany doesn't exist
  // - https://stackoverflow.com/questions/71408235/how-is-upsertmany-implemented-in-prisma-orm
  // - https://github.com/prisma/prisma/issues/4134
  const deletePromise = (prismaTable as AnyPrismaDelegate).deleteMany(input.delete as any);
  const createPromise = (prismaTable as AnyPrismaDelegate).createMany(input.create as any);

  await prisma.$transaction([deletePromise, createPromise]);
};
