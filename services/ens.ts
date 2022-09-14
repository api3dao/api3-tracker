import fs from "fs";
import prisma from "./db";
import { ethers } from "ethers";
// import { withDecimals } from "./format";

export const ENS = {
  resetAll: async () => {
    await prisma.cacheEns.deleteMany({});
  },
  importLocal: async (folder: string) => {
    let inserted = 0;
    const files = fs.readdirSync(folder);
    for (const file of files) {
      if (file.indexOf(".addr.reverse.txt") > -1) {
        const addr = "0x" + file.split(".")[0];
        const domain = fs
          .readFileSync(folder + "/" + file)
          .toString()
          .trim();
        console.log(addr, domain);
        inserted++;
      }
    }
    return inserted;
  },
  download: async (endpoint: string) => {
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    // TODO: download fresh records
    // await prisma.cacheEns.create({ data: { }, });
  },
};
