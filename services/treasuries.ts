import { TreasuryType } from ".prisma/client";
import { ethers } from "ethers";

import { type ITreasuryType } from "./api";
import prisma from "./db";
import { withDecimals } from "./format";
import { fetchWebconfig } from "./webconfig";

export const Address = {
  asBuffer: (addr: string): Buffer => {
    return Buffer.from(addr.replace("0x", ""), "hex");
  },
};

const abiERC20 = [
  // Get the account balance
  "function balanceOf(address) view returns (uint)",
];

interface ITokenContract {
  address: string;
  decimals: number;
}

export const Treasuries = {
  resetAll: async () => {
    await prisma.treasury.deleteMany({});
  },
  download: async (endpoint: string) => {
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);

    const webconfig = fetchWebconfig();
    // known tokens
    const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const api3: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3token",
      ) ?? { address: "" }
    ).address;

    const mapTokens = new Map<string, ITokenContract>();
    mapTokens.set("USDC", { address: usdc, decimals: 6 });
    mapTokens.set("API3", { address: api3, decimals: 18 });
    mapTokens.set("ETH", { address: "0x0", decimals: 18 });

    // known contracts to check
    const v1 = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "v1treasury",
    )?.address;
    const primary = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "primaryagent",
    )?.address;
    const secondary = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "secondaryagent",
    )?.address;

    const mapAddresses = new Map<string, ITreasuryType>();
    if (v1) mapAddresses.set(v1, TreasuryType.V1);
    if (primary) mapAddresses.set(primary, TreasuryType.PRIMARY);
    if (secondary) mapAddresses.set(secondary, TreasuryType.SECONDARY);

    let updated = 0;
    for (const [tokenSymbol, token] of mapTokens.entries()) {
      // console.log("Reading token", token);
      const tokenContract =
        token.address === "0x0"
          ? null
          : new ethers.Contract(token.address, abiERC20, jsonRpc);
      for (const [contractAddress, contractType] of mapAddresses.entries()) {
        const tokenBalance = tokenContract
          ? await tokenContract.balanceOf(contractAddress)
          : await jsonRpc.getBalance(contractAddress);

        const value = withDecimals(tokenBalance.toString(), token.decimals);
        console.log(contractType, tokenSymbol, value);
        await prisma.$transaction([
          prisma.treasury.updateMany({
            where: {
              ttype: contractType,
              address: Address.asBuffer(contractAddress),
              token: tokenSymbol,
              tokenAddress: Address.asBuffer(token.address),
              current: 1,
            },
            data: {
              current: 0,
            },
          }),
          prisma.treasury.create({
            data: {
              ts: new Date().toISOString(),
              ttype: contractType,
              address: Address.asBuffer(contractAddress),
              token: tokenSymbol,
              tokenAddress: Address.asBuffer(token.address),
              value,
              current: 1,
            },
          }),
        ]);
        updated++;
      }
    }
    return updated;
  },
};
