import { PrismaClient } from "@prisma/client";

declare module globalThis {
  var prisma: PrismaClient;
}
