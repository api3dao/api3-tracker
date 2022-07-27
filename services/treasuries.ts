import { prisma } from "./db";
import { TreasuryType } from ".prisma/client";
import { ITreasury } from "./../services/api3";

export type ITreasuryType = TreasuryType;

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
