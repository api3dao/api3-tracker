import prisma from "./db";

export interface IBlockEvent {
  createdAt: string;
  txHash: string;
  blockNumber: number;
}

export const Blocks = {
  // fetch the last block
  fetchLast: async (): Promise<any> => {
    return (
      await prisma.memberEvent.findMany({
        take: 1,
        orderBy: { createdAt: "desc" },
      })
    ).map((x: any) => ({ ...x }))[0];
  },
};
