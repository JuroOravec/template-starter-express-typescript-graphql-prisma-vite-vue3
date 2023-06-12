import { PrismaClient } from '@prisma/client';
import { logger } from './src/globals/logger';

const prisma = new PrismaClient();

// A `main` function so that you can use async/await
async function main() {
  const user = await prisma.user.findFirst();
  logger.info(user);
  // ... you will write your Prisma Client queries here
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
