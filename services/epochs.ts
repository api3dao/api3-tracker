import { prisma } from "./db";
import { IEpoch } from "./../services/api3";

export const Epochs = {
  // fetch a few latest epochs
  fetchLatest: async (limit: number): Promise<Array<IEpoch>> => {
    return await prisma.epoch.findMany({
      take: limit,
      orderBy: { epoch: "desc" },
    }); // .map((x: any) => ({ ...x, createdAt: new Date(x.createdAt), releaseDate: new Date(x.releaseDate) }));
  },
  // fetch one epoch by its ID
  fetch: async (epoch: number) => {
    return await prisma.epoch.findUnique({
      where: { epoch },
    });
  },
};
