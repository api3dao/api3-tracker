import fs from "node:fs";

import { Prisma } from "@prisma/client";
import { ethers } from "ethers";

import prisma from "./db";
import { withDecimals } from "./format";
import { fetchWebconfig } from "./webconfig";

const TokenABI = new ethers.utils.Interface(
  fs.readFileSync("./abi/api3token.json", "utf8"),
);

const SupplyABI = new ethers.utils.Interface(
  fs.readFileSync("./abi/api3supply.json", "utf8"),
);

const PoolABI = new ethers.utils.Interface(
  fs.readFileSync("./abi/api3pool.json", "utf8"),
);

// const HUNDRED_PERCENT = BigNumber.from(10).pow(18);
// totalSupply.mul(stakeTargetPercentages).div(HUNDRED_PERCENT);

export const Supply = {
  resetAll: async () => {
    await prisma.api3Supply.deleteMany({});
  },
  download: async (endpoint: string) => {
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    const webconfig = fetchWebconfig();

    const blockNumber = (await jsonRpc.getBlock("latest")).number;
    console.log("Block", blockNumber);

    const token: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3token",
      ) ?? { address: "" }
    ).address;
    const tokenContract = new ethers.Contract(token, TokenABI, jsonRpc);
    const totalSupply = await tokenContract.totalSupply();
    const api3Supply = withDecimals(totalSupply.toString(), 18);
    console.log("API3 Supply", api3Supply);

    const supply: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3supply",
      ) ?? { address: "" }
    ).address;
    const supplyContract = new ethers.Contract(supply, SupplyABI, jsonRpc);
    const pool: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3pool",
      ) ?? { address: "" }
    ).address;
    const poolContract = new ethers.Contract(pool, PoolABI, jsonRpc);
    const totalStake = withDecimals(
      (await poolContract.totalStake()).toString(),
      18,
    );
    console.log("Total Stake", totalStake);
    const stakeTarget = await poolContract.stakeTarget();
    const stakeTargetPct = Number.parseFloat(
      withDecimals(stakeTarget.toString(), 18),
    );
    console.log("Stake Target %", stakeTargetPct);
    const stakingTarget = new Prisma.Decimal(
      withDecimals(totalSupply.toString(), 18),
    ).mul(stakeTargetPct);
    console.log("Staking Target", stakingTarget);

    const circulatingSupply = withDecimals(
      (await supplyContract.getCirculatingSupply()).toString(),
      18,
    );
    console.log("Circulating Supply", circulatingSupply);
    const totalLocked = withDecimals(
      (await supplyContract.getTotalLocked()).toString(),
      18,
    );
    console.log("Total Locked", totalLocked);
    const lockedByGovernance = withDecimals(
      (await supplyContract.getLockedByGovernance()).toString(),
      18,
    );
    console.log("Locked By Governance", lockedByGovernance);
    const lockedVestings = withDecimals(
      (await supplyContract.getLockedVestings()).toString(),
      18,
    );
    console.log("Locked Vestings", lockedVestings);
    const lockedRewards = withDecimals(
      (await supplyContract.getLockedRewards()).toString(),
      18,
    );
    console.log("Locked Rewards", lockedRewards);
    // There are no longer any time-locked tokens
    const timeLocked = withDecimals("0", 18);
    console.log("Time locked", timeLocked);

    await prisma.api3Supply.create({
      data: {
        blockNumber,
        circulatingSupply,
        lockedByGovernance,
        lockedRewards,
        lockedVestings,
        stakingTarget,
        timeLocked,
        totalLocked,
        totalStaked: totalStake,
        ts: new Date().toISOString(),
      },
    });
  },
};
