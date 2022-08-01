import prisma from "./db";
import { Prisma } from "@prisma/client";
import { VotingType } from ".prisma/client";
import { IVoting, IVotingEvent } from "./api3";
import { toHex } from "./format";

const Decimal = Prisma.Decimal;
export type IVotingType = VotingType;

export const VotingEvents = {
  // fetch a list of votings for the certain status
  fetchList: async (votingId: string): Promise<Array<any>> => {
    return (
      await prisma.votingEvent.findMany({
        where: { votingId },
        orderBy: { createdAt: "asc" },
      })
    ).map((x: any) => ({ ...x }));
  },
  // object mapper
  from: (input: any): IVotingEvent => {
    const feeUsd = new Decimal(input.feeUsd);
    const userShare = new Decimal(input.userShare);
    const userVotingPower = new Decimal(input.userVotingPower);
    return { ...input, feeUsd, userShare, userVotingPower };
  },
  // list mapper
  fromList: (src: Array<any>): Array<IVotingEvent> => {
    return src.map(VotingEvents.from);
  },
};

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
  // fetch total number of votings
  total: async (): Promise<number> => {
    return await prisma.voting.count();
  },
  // object mapper
  from: (input: any): IVoting => {
    const totalFor = new Decimal(input.totalFor);
    const totalAgainst = new Decimal(input.totalAgainst);
    const totalRequired = new Decimal(input.totalRequired);
    const totalStaked = new Decimal(input.totalStaked);
    return { ...input, totalFor, totalAgainst, totalRequired, totalStaked };
  },
  // list mapper
  fromList: (src: Array<any>): Array<IVoting> => {
    return src.map(Votings.from);
  },
};
