import { BigNumber, ethers } from "ethers";
import prisma from "./db";

export interface GasUsage {
  gasUsed: BigNumber;
  feeUsd: number;
}

export const VoteGas = {
  VOTES: new Map<number, Map<string, GasUsage>>(),

  appearance: (): boolean => {
    // const v = (typeof global.localStorage != "undefined" ) ? global.localStorage.getItem("GAS") : "";
    // return v != "HIDDEN";
    return true;
  },

  reset: () => {
    VoteGas.VOTES = new Map<number, Map<string, GasUsage>>();
  },
  add: async (
    voteId: number,
    txHash: string,
    gasUsed: BigNumber,
    feeUsd: number
  ) => {
    if (!VoteGas.VOTES.get(voteId)) {
      VoteGas.VOTES.set(voteId, new Map());
      // pull if we have anything in the database as 0 transaction
      const foundVote = await prisma.voting.findMany({
        where: { id: voteId + "" },
      });
      if (foundVote.length > 0) {
        VoteGas.VOTES.get(voteId)?.set("0x0", {
          gasUsed: ethers.BigNumber.from(foundVote[0].totalGasUsed),
          feeUsd: parseFloat(foundVote[0].totalUsd?.toString() || "0"),
        });
      }
    }
    if (!VoteGas.VOTES.get(voteId)?.get(txHash)) {
      VoteGas.VOTES.get(voteId)?.set(txHash, { gasUsed, feeUsd });
    } else {
      const existing: GasUsage = VoteGas.VOTES.get(voteId)?.get(
        txHash
      ) as GasUsage;
      const updated: GasUsage = {
        gasUsed: existing.gasUsed.add(gasUsed),
        feeUsd: existing.feeUsd + feeUsd,
      };
      VoteGas.VOTES.get(voteId)?.set(txHash, updated);
    }
  },

  totals: (): Map<number, GasUsage> => {
    const out = new Map();
    for (const [voteId, transactions] of VoteGas.VOTES.entries()) {
      let gasUsed = BigNumber.from(0);
      let feeUsd = 0.0;
      for (const [_txHash, usage] of transactions) {
        gasUsed = gasUsed.add(usage.gasUsed);
        feeUsd += usage.feeUsd;
      }
      out.set(voteId, { gasUsed, feeUsd });
    }
    return out;
  },
};
