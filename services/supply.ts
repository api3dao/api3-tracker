import { prisma } from "./db";
import { ISupply } from "./../services/api3";

export const Supply = {
  // fetch a few latest epochs
  fetchLast: async (): Promise<ISupply | null> => {
    const record: Array<ISupply> = await prisma.api3Supply.findMany({
      orderBy: { blockNumber: "desc" },
    });
    return record[0];
  },
};
