import { prisma } from "./db";
import { VotingType } from ".prisma/client";

export type IVotingType = VotingType;

export const Votings = {
  // fetch a list of votings for the certain status
  fetchList: async (status: string): Promise<Array<any>> => {
    return (
      await prisma.voting.findMany({
        where: { status },
        orderBy: { createdAt: "asc" },
      })
    ).map((x: any) => ({...x}));
  }
};
