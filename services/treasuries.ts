import prisma from "./db";
import { ITreasuryType } from "./api";
import { ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { TreasuryType } from ".prisma/client";

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
        ({ name }) => name.toLowerCase() === "api3token"
      ) || { address: "" }
    ).address;

    const mapTokens = new Map<string, ITokenContract>();
    mapTokens.set("USDC", { address: usdc, decimals: 6 });
    mapTokens.set("API3", { address: api3, decimals: 18 });

    // known contracts to check
    const v1 = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "v1treasury"
    )?.address;
    const primary = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "primaryagent"
    )?.address;
    const secondary = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "secondaryagent"
    )?.address;

    const mapAddresses = new Map<string, ITreasuryType>();
    if (v1) mapAddresses.set(v1, TreasuryType.V1);
    if (primary) mapAddresses.set(primary, TreasuryType.PRIMARY);
    if (secondary) mapAddresses.set(secondary, TreasuryType.SECONDARY);

    let updated = 0;
    for (const [tokenSymbol, token] of mapTokens.entries()) {
      console.log("Reading token", token);
      const tokenContract = new ethers.Contract(
        token.address,
        abiERC20,
        jsonRpc
      );
      for (const [contractAddress, contractType] of mapAddresses.entries()) {
        const tokenBalance = await tokenContract.balanceOf(contractAddress);
        console.log(contractType, tokenSymbol, token.decimals, tokenBalance);
        updated ++;
      }
    }
    return updated;
  },
};
