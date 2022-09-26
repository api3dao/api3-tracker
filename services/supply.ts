import prisma from "./db";
import { ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { withDecimals } from "./format";

const abiSupply = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address[]",
        name: "vestingAddresses",
        type: "address[]",
      },
    ],
    name: "SetVestingAddresses",
    type: "event",
  },
  {
    inputs: [],
    name: "API3_POOL",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "API3_TOKEN",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PRIMARY_TREASURY",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SECONDARY_TREASURY",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TIMELOCK_MANAGER",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "V1_TREASURY",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "api3Pool",
    outputs: [
      { internalType: "contract IApi3Pool", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "api3Token",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCirculatingSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLockedByGovernance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLockedRewards",
    outputs: [
      { internalType: "uint256", name: "totalLockedRewards", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLockedVestings",
    outputs: [
      { internalType: "uint256", name: "totalLockedVestings", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTimelocked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalLocked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_vestingAddresses",
        type: "address[]",
      },
    ],
    name: "setVestingAddresses",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "timelockManager",
    outputs: [
      { internalType: "contract ITimelockManager", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "vestingAddresses",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

const abiPool = [
  {
    inputs: [],
    name: "totalStake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakeTarget",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export const Supply = {
  resetAll: async () => {
    await prisma.api3Supply.deleteMany({});
  },
  download: async (endpoint: string) => {
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    const webconfig = fetchWebconfig();

    const blockNumber = (await jsonRpc.getBlock("latest")).number;
    console.log("Block", blockNumber);

    const supply: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3supply"
      ) || { address: "" }
    ).address;
    const supplyContract = new ethers.Contract(supply, abiSupply, jsonRpc);
    const pool: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3pool"
      ) || { address: "" }
    ).address;
    const poolContract = new ethers.Contract(pool, abiPool, jsonRpc);
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
