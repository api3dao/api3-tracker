import prisma from "./db";
import { IBlockNumber } from "./../services/types";

export const Blocks = {
  // fetch the last block
  fetchLast: async (): Promise<IBlockNumber> => {
    const list = (
      await prisma.memberEvent.findMany({
        take: 1,
        orderBy: { createdAt: "desc" },
      })
    ).map((x: any) => ({ ...x }));
    return list.length > 0 ? list[0] : {};
  },
};

export const Events = {
  reset: async () => {
    await prisma.memberEvent.deleteMany({});
    await prisma.votingEvent.deleteMany({});
  }
}
