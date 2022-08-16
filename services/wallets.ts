import prisma from "./db";
import { IWallet, IWalletEvent } from "./api3";

export const WalletEvents = {
  // fetch a list of votings for the certain status
  fetchList: async (address: Buffer): Promise<Array<any>> => {
    return (
      await prisma.memberEvent.findMany({
        where: { address },
        orderBy: { createdAt: "asc" },
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
  fetchList: async (): Promise<Array<any>> => {
    return (
      await prisma.member.findMany({
        where: {},
        orderBy: { createdAt: "asc" },
      })
    ).map((x: any) => ({ ...x }));
  },
  // fetch one voting by its ID
  fetch: async (address: Buffer): Promise<IWallet|null> => {
    return (
      await prisma.member.findUnique({
        where: { address },
      })
    ) as IWallet | null;
  },
  // fetch total number of members
  total: async (): Promise<number> => {
    return await prisma.member.count();
  },
  // object mapper
  from: (input: any): IWallet => {
    return { ...input };
  },
  // list mapper
  fromList: (src: Array<any>): Array<IWallet> => {
    return src.map(Wallets.from);
  },
};
