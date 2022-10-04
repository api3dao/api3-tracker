import prisma from "./db";
import { Prisma } from "@prisma/client";
import fs from "fs";
import { ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { withDecimals } from "./format";

const TokenABI = new ethers.utils.Interface(
  fs.readFileSync("./abi/api3token.json", "utf-8")
);

const SupplyABI = new ethers.utils.Interface(
  fs.readFileSync("./abi/api3supply.json", "utf-8")
);

const PoolABI = new ethers.utils.Interface(
  fs.readFileSync("./abi/api3pool.json", "utf-8")
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
        ({ name }) => name.toLowerCase() === "api3token"
      ) || { address: "" }
    ).address;
    const tokenContract = new ethers.Contract(token, TokenABI, jsonRpc);
    const api3Supply = withDecimals(
     (await tokenContract.totalSupply()).toString(),
     18
    );
    console.log("API3 Supply", api3Supply);

    const supply: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3supply"
      ) || { address: "" }
    ).address;
    const supplyContract = new ethers.Contract(supply, SupplyABI, jsonRpc);
    const pool: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3pool"
      ) || { address: "" }
    ).address;
    const poolContract = new ethers.Contract(pool, PoolABI, jsonRpc);
    const totalStake = withDecimals(
      (await poolContract.totalStake()).toString(),
      18
    );
    console.log("Total Stake", totalStake);
    const stakeTarget = withDecimals(
      (await poolContract.stakeTarget()).toString(),
      10
    );
    console.log("Stake Target", stakeTarget);

    const circulatingSupply = withDecimals(
      (await supplyContract.getCirculatingSupply()).toString(),
      18
    );
    console.log("Circulating Supply", circulatingSupply);
    const totalLocked = withDecimals(
      (await supplyContract.getTotalLocked()).toString(),
      18
    );
    console.log("Total Locked", totalLocked);
    const lockedByGovernance = withDecimals(
      (await supplyContract.getLockedByGovernance()).toString(),
      18
    );
    console.log("Locked By Governance", lockedByGovernance);
    const lockedVestings = withDecimals(
      (await supplyContract.getLockedVestings()).toString(),
      18
    );
    console.log("Locked Vestings", lockedVestings);
    const lockedRewards = withDecimals(
      (await supplyContract.getLockedRewards()).toString(),
      18
    );
    console.log("Locked Rewards", lockedRewards);
    const timeLocked = withDecimals(
      (await supplyContract.getTimelocked()).toString(),
      18
    );
    console.log("Time locked", timeLocked);

    await prisma.api3Supply.create({
      data: {
        ts: new Date().toISOString(),
        blockNumber,
        circulatingSupply,
        totalLocked,
        totalStaked: totalStake,
        stakingTarget: stakeTarget,
        lockedByGovernance,
        lockedVestings,
        lockedRewards,
        timeLocked,
      },
    });
  },
};
