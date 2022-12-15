import prisma from "./db";
import { Prisma } from "@prisma/client";
import {
  Decimal,
  IBlockNumber,
  IDelegation,
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
  fetchLatest: async (limit: number, withCurrent: boolean): Promise<Array<IEpoch>> => {
    const res = (
      await prisma.epoch.findMany({
        take: limit,
        where: { NOT: { blockNumber: 0 } },
        orderBy: { epoch: "desc" },
      })
    ).map((x: any) => Epochs.from(x));
   if (!withCurrent) return res;
   const out = new Array<IEpoch>();
   if (res.length > 0) {
     out.push({ ...res[0], isCurrent: 1 });
     res.forEach((x: IEpoch) => out.push({ ...x, isCurrent: 0 }));
   }
   return out;
  },
  // fetch one epoch by its ID
  fetch: async (epoch: number) => {
    return await prisma.epoch.findUnique({
      where: { epoch },
    });
  },
  from: (input: any): IEpoch => {
    const txHash = "0x" + input.txHash.toString("hex");
    return { ...input, txHash };
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
        orderBy: [{ createdAt: "desc" }, { logIndex: "desc" }],
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
    const transferAddress = Buffer.from(input.transferAddress, "hex");
    return {
      ...input,
      totalFor,
      totalAgainst,
      totalRequired,
      totalStaked,
      transferAddress,
    };
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
        orderBy: [{ createdAt: "desc" }, { txIndex: "desc" }, { logIndex: "desc" }],
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

export interface ICursor {
  take?: number;
  skip?: number;
}

export interface IPage {
  total: number;
}

export interface WalletsList {
  list: Array<IWallet>;
  page: IPage;
}

export const Delegations = {
  fetchFrom: async (from: Buffer): Promise<Array<IDelegation>> => {
    const out = (await prisma.memberDelegation.findMany({
      where: { from },
    })).map((x: any) => (Delegations.from(x)));
    return out;
  },
  fetchTo: async (to: Buffer): Promise<Array<IDelegation>> => {
    const out = (await prisma.memberDelegation.findMany({
      where: { to },
    })).map((x: any) => (Delegations.from(x)));
    return out;
  },
  // object mapper
  from: (input: any): IDelegation => {
    const from =
      typeof input.from == "string"
        ? input.from.replace("0x", "")
        : "0x" + Buffer.from(input.from.toString("hex").toLowerCase());
    const to =
      typeof input.to == "string"
        ? input.to.replace("0x", "")
        : "0x" + Buffer.from(input.to.toString("hex").toLowerCase());
    return { ...input, from, to };
  },
};

export const Wallets = {
  // fetch all members
  fetchAll: async (): Promise<Array<IWallet>> => {
      const list = await  prisma.member.findMany({ });
      return list.map((x: any) => (Wallets.from(x)));
  },
  // fetch a list of wallets for the certain search query
  fetchList: async (q: string, cursor: ICursor): Promise<WalletsList> => {
    const where = q.length > 0 ? { tags: { search: q } } : {};
    const [list, total] = await prisma.$transaction([
      prisma.member.findMany({
        where,
        orderBy: [{ userVotingPower: "desc"}, { userShare: "desc" },{ createdAt: "asc" }],
        take: cursor.take || 100,
        skip: cursor.skip || 0,
      }),
      prisma.member.count({ where }),
    ]);
    return { list: list.map((x: any) => ({ ...x })), page: { total } };
  },
  // fetch and return map
  fetchByAddresses: async (
    addresses: Array<Buffer>
  ): Promise<Array<IWallet>> => {
    const where = { address: { in: addresses } };
    return (await prisma.member.findMany({ where })).map((x: any) => ({
      ...x,
    }));
  },
  // fetch one voting by its ID
  fetch: async (address: Buffer): Promise<IWallet | null> => {
    const out = (await prisma.member.findUnique({
      where: { address },
    })) as IWallet | null;
    if (out) return Wallets.from(out);
    return null;
  },
  // fetch total shares for all members
  totalShares: async (): Promise<Prisma.Decimal> => {
    const out = (await prisma.member.aggregate({
      _sum: { userShare: true },
    }));
    if (!out) return new Prisma.Decimal(0.0);
    return out._sum.userShare || new Prisma.Decimal(0.0);
  },
  // fetch total number of members
  total: async (): Promise<number> => {
    return await prisma.member.count();
  },
  // object mapper
  from: (input: any): IWallet => {
    const address =
      typeof input.address == "string"
        ? input.address.replace("0x", "")
        : "0x" + Buffer.from(input.address).toString("hex").toLowerCase();
    return { ...input, address };
  },
  // list mapper
  fromList: (src: Array<any>): Array<IWallet> => {
    return src.map(Wallets.from);
  },
};
