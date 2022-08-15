import { PrismaClient } from "@prisma/client";

declare global {
  module globalThis {
    var prisma: PrismaClient;
  }
}
