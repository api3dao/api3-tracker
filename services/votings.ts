import prisma from "./db";
import { Prisma } from "@prisma/client";
import { VotingType } from ".prisma/client";
import { IVoting } from "./api3";

const Decimal = Prisma.Decimal;
export type IVotingType = VotingType;

export const Votings = {
  // fetch a list of votings for the certain status
  fetchList: async (status: string): Promise<Array<any>> => {
    return (
      await prisma.voting.findMany({
        where: { status },
        orderBy: { createdAt: "asc" },
      })
    ).map((x: any) => ({ ...x }));
  },
  // fetch one voting by its ID
  fetch: async (id: string): Promise<IVoting|null> => {
    return (
      await prisma.voting.findUnique({
        where: { id },
      })
    ) as IVoting | null;
  },
  // object mapper
  from: (input: any): IVoting => {
    const totalFor = new Decimal(input.totalFor);
    const totalAgainst = new Decimal(input.totalAgainst);
    const totalRequired = new Decimal(input.totalRequired);
    const totalStaked = new Decimal(input.totalStaked);
    return { ...input, totalFor, totalAgainst, totalRequired, totalStaked };
  },
  fromList: (src: Array<any>): Array<IVoting> => {
    return src.map(Votings.from);
  },
};
