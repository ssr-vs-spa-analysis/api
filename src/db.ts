import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient__: PrismaClient | undefined;
}

const prismaClient =
  globalThis.__prismaClient__ ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prismaClient__ = prismaClient;
}

export const db = prismaClient;

export const disconnectDb = async (): Promise<void> => {
  await db.$disconnect();
};
