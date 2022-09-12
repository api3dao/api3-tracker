import fs from "fs";
import prisma from "./db";
import { ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { IContract } from "./types";

export const Treaschemries = {
  reset: async() => {
    await prisma.treasury.deleteMany({});
  },
  download: async() => {
    const webconfig = fetchWebconfig();
    // known tokens
    const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const api3primary = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "api3token"
    )?.address;
    // known contracts to check
    const primary = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "primaryAgent"
    )?.address;
    const secondary = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "secondaryAgent"
    )?.address;
    const v1 = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "v1treasury"
    )?.address;
    // TODO: update each treasury
    return 0;
  }
};
