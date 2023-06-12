import type { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import type { MailerClient } from '@/modules/mail/lib/mailer';
import type { Mfa } from '@/modules/mfa/lib/mfa';

/** Context available to all request handlers */
export interface AppContext {
  prisma: PrismaClient;
  mailer: MailerClient;
  mfa: Mfa;
  user: Express.User | null;
  session: Express.Request['session'];
}

export interface AppContextInput {
  req: Request;
  prisma?: PrismaClient;
  mailer: MailerClient;
  mfa: Mfa;
}

export const createAppContext = (input: AppContextInput): AppContext => ({
  user: input.req.user ?? null,
  session: input.req.session,
  prisma: input.prisma ?? new PrismaClient(),
  mailer: input.mailer ?? null,
  mfa: input.mfa ?? null,
});
