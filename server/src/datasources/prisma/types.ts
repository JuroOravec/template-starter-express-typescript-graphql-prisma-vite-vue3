import type { PrismaClient, Prisma } from '@prisma/client';

import type { SubType } from '@/utils/types';

export type ExtractPrismaDelegate<T> = SubType<T, { createMany: (...args: any[]) => any }>;

/**
 * Prisma delegates - AKA the "table" properties on PrismaClient. This is the `user`
 * object on `prisma.user.findMany()`.
 *
 * While Prisma generates types for each of these "Delegates", it doesn't define any
 * public generic type that could be used to describe all Delegates together.
 */
export type PrismaDelegate =
  ExtractPrismaDelegate<PrismaClient>[keyof ExtractPrismaDelegate<PrismaClient>];

/** The "where" clause of a generic PrismaDelegate */
export type PrismaDelegateWhere<T extends PrismaDelegate> = NonNullable<Parameters<T['findMany']>[0]>['where']; // prettier-ignore

///////////////////////////
// GENERIC PRISMA CLIENT
///////////////////////////

export type CreateManyInput = Record<string, any>;

export interface AnyWhereInput {
  AND?: Prisma.Enumerable<AnyWhereInput>;
  OR?: Prisma.Enumerable<AnyWhereInput>;
  NOT?: Prisma.Enumerable<AnyWhereInput>;
}

export type AnyWhereUniqueInput = {
  [Key in string]?: any;
};

export type AnySelect = {
  [Key in string]?: boolean;
};

// Operation args

export interface AnyCreateManyArgs {
  data: Prisma.Enumerable<CreateManyInput>;
  skipDuplicates?: boolean;
}

export interface AnyDeleteArgs {
  select?: AnySelect | null;
  where: AnyWhereUniqueInput;
}

export interface AnyDeleteManyArgs {
  where?: AnyWhereInput;
}

export interface FindUniqueArgs {
  select?: AnySelect | null;
  where: AnyWhereUniqueInput;
}

/** Generic form of PrismaDelegate */
export type AnyPrismaDelegate = {
  // NOTE: Not yet implemented:
  // | 'findFirst'
  // | 'findMany'
  // | 'findRaw'
  // | 'create'
  // | 'update'
  // | 'updateMany'
  // | 'upsert'
  // | 'executeRaw'
  // | 'queryRaw'
  // | 'aggregate'
  // | 'count'
  // | 'runCommandRaw'

  createMany<T extends AnyCreateManyArgs>(
    args?: Prisma.SelectSubset<T, AnyCreateManyArgs>,
  ): Prisma.PrismaPromise<Prisma.BatchPayload>;

  delete<T extends AnyDeleteArgs>(
    args: Prisma.SelectSubset<T, AnyDeleteArgs>,
  ): Prisma.PrismaPromise<object>;

  deleteMany<T extends AnyDeleteManyArgs>(
    args?: Prisma.SelectSubset<T, AnyDeleteManyArgs>,
  ): Prisma.PrismaPromise<Prisma.BatchPayload>;

  findUnique<T extends FindUniqueArgs>(
    args: Prisma.SelectSubset<T, FindUniqueArgs>,
  ): Prisma.PrismaPromise<object> | null;
};
