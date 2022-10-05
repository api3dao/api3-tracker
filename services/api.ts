import prisma from "./db";
import {
  Decimal,
  IBlockNumber,
  IWallet,
  IWalletEvent,
  IVoting,
  IVotingEvent,
  IEpoch,
  ISupply,
} from "./../services/types";
import { VotingType, TreasuryType } from ".prisma/client";

export type ITreasuryType = TreasuryType;
export type IVotingType = VotingType;

export const Blocks = {
  // fetch the last block
  fetchLast: async (): Promise<IBlockNumber> => {
    const status = await prisma.syncStatus.findMany({
      where: { id: 1 },
    });
    if (status.length > 0) {
      return {
        blockNumber: status[0].processed,
      };
    }
    return { blockNumber: 0 };
  },
};

export const Epochs = {
  // fetch a few latest epochs
  fetchLatest: async (limit: number): Promise<Array<IEpoch>> => {
    return (
      await prisma.epoch.findMany({
        take: limit,
        orderBy: { epoch: "desc" },
      })
    ).map((x: any) => ({ ...x }));
  },
  // fetch one epoch by its ID
  fetch: async (epoch: number) => {
    return await prisma.epoch.findUnique({
      where: { epoch },
    });
  },
};

export const Supply = {
  // fetch current supply
  fetch: async (): Promise<ISupply | null> => {
    const record: Array<ISupply> = await prisma.api3Supply.findMany({
      orderBy: { blockNumber: "desc" },
    });
    return record[0];
  },
};

export const Treasuries = {
  // fetch a list of treasuries
  fetchList: async (): Promise<Array<TreasuryType>> => {
    return (
      await prisma.treasury.groupBy({
        by: ["ttype"],
        orderBy: { ttype: "asc" },
      })
    ).map((x: any) => x.ttype as TreasuryType);
  },
  // fetch the latest values of the given treasury
  fetch: async (ttype: TreasuryType): Promise<Array<any>> => {
    return (
      await prisma.treasury.findMany({
        where: { ttype, current: 1 },
        orderBy: { ts: "desc" },
        take: 1,
      })
    ).map((x: any) => ({ ...x }));
  },
};

export const VotingEvents = {
  // fetch a list of votings for the certain status
  fetchList: async (votingId: string): Promise<Array<any>> => {
    return (
      await prisma.votingEvent.findMany({
        where: { votingId },
        orderBy: [{ createdAt: "desc" }, { logIndex: "desc" }]
      })
    ).map((x: any) => ({ ...x }));
  },
  // object mapper
  from: (input: any): IVotingEvent => {
    const feeUsd = new Decimal(input.feeUsd || 0);
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
  fetchList: async (status: string): Promise<Array<IVoting>> => {
    return (
      await prisma.voting.findMany({
        where: { status },
        orderBy: { createdAt: "desc" },
      })
    ).map((x: any) => ({ ...x }));
  },
  // fetch all existing votings
  fetchAll: async (): Promise<Array<IVoting>> => {
    return (
      await prisma.voting.findMany({
        orderBy: { createdAt: "desc" },
      })
    ).map((x: any) => ({ ...x }));
  },
  // fetch one voting by its ID
  fetch: async (id: string): Promise<IVoting | null> => {
    return (await prisma.voting.findUnique({
      where: { id },
    })) as IVoting | null;
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
    const transferAddress = Buffer.from(input.transferAddress, 'hex');
    return { ...input, totalFor, totalAgainst, totalRequired, totalStaked, transferAddress };
  },
  // list mapper
  fromList: (src: Array<any>): Array<IVoting> => {
    return src.map(Votings.from);
  },
};

export const WalletEvents = {
  // fetch a list of votings for the certain status
  fetchList: async (address: Buffer): Promise<Array<any>> => {
    return (
      await prisma.memberEvent.findMany({
        where: { address },
        orderBy: [{ createdAt: "desc" }, { logIndex: "desc" }]
      })
    ).map((x: any) => ({ ...x }));
  },
  // object mapper
  from: (input: any): IWalletEvent => {
    return { ...input };
  },
  // list mapper
  fromList: (src: Array<any>): Array<IWalletEvent> => {
    return src.map(WalletEvents.from);
  },
};

export const Wallets = {
  // fetch a list of votings for the certain status
  fetchList: async (q: string): Promise<Array<IWallet>> => {
    const where = q.length > 0 ? { tags: { search: q } } : {};
    return (
      await prisma.member.findMany({
        where,
        orderBy: { createdAt: "asc" }, // TODO: order by rewards
        take: 100,
      })
    ).map((x: any) => ({ ...x }));
  },
  // fetch one voting by its ID
  fetch: async (address: Buffer): Promise<IWallet | null> => {
    return (await prisma.member.findUnique({
      where: { address },
    })) as IWallet | null;
  },
  // fetch total number of members
  total: async (): Promise<number> => {
    return await prisma.member.count();
  },
  // object mapper
  from: (input: any): IWallet => {
    const badges = new Array();
    return { ...input, badges };
  },
  // list mapper
  fromList: (src: Array<any>): Array<IWallet> => {
    return src.map(Wallets.from);
  },
};
