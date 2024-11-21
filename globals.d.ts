/* eslint-disable no-var */
import { type PrismaClient } from "@prisma/client";

declare global {
  module globalThis {
    var prisma: PrismaClient;
    var localStorage: any;
  }
}
