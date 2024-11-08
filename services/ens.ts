import fs from "node:fs";

import { ethers } from "ethers";

import prisma from "./db";

export const Address = {
  asBuffer: (addr: string): Buffer => {
    return Buffer.from(addr.replace("0x", ""), "hex");
  },
};

export const ENS = {
  resetAll: async () => {
    await prisma.cacheEns.deleteMany({});
  },
  importLocal: async (folder: string) => {
    let inserted = 0;
    const files = fs.readdirSync(folder);
    for (const file of files) {
      if (file.includes(".addr.reverse.txt")) {
        const addr = "0x" + file.split(".")[0];
        const domain = fs
          .readFileSync(folder + "/" + file)
          .toString()
          .trim();

        const found = await prisma.cacheEns.findMany({
          where: { address: Address.asBuffer(addr) },
        });
        if (found.length === 0) {
          console.log(addr, domain);
          await prisma.cacheEns.create({
            data: {
              address: Address.asBuffer(addr),
              name: domain,
              createdAt: new Date().toISOString(),
            },
          });
          inserted++;
        }
      }
    }
    return inserted;
  },
  download: async (endpoint: string) => {
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    // seeking for members without names
    const membersToScan = await prisma.member.findMany({
      where: { ensName: { equals: "" } },
    });
    let inserted = 0;
    for (const member of membersToScan) {
      const addr: string = member.address.toString("hex");
      const domain = await jsonRpc.lookupAddress(addr);
      if (domain) {
        const found = await prisma.cacheEns.findMany({
          where: { address: Address.asBuffer(addr) },
        });
        if (found.length === 0) {
          console.log(addr, domain);
          await prisma.cacheEns.create({
            data: {
              address: Address.asBuffer(addr),
              name: domain,
              createdAt: new Date().toISOString(),
            },
          });
          inserted++;
        }
      }
    }
    return inserted;
  },
};
