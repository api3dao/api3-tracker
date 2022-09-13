import prisma from "./db";
import { ethers } from "ethers";
// import { withDecimals } from "./format";

export const ENS = {
  resetAll: async () => {
    await prisma.cacheEns.deleteMany({});
  },
  import: async (endpoint: string, folder: string) => {
    // TODO: import
  },
  download: async (endpoint: string) => {
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    // TODO: download fresh records
    // await prisma.cacheEns.create({ data: { }, });
  },
};

