import { prisma } from "./db";

export const Epochs = {
  // fetch a few latest epochs
  fetchLatest: async (limit: number) => {
    return await prisma.epoch.findMany({
      take: limit,
      orderBy: { epoch: "desc" },
    });
  },
  // fetch one epoch by its ID
  fetch: async (epoch: number) => {
    return await prisma.epoch.findUnique({
      where: { epoch },
    });
  },
};
