import prisma from "./db";
import { Prisma } from "@prisma/client";
import fs from "fs";
import { ethers, BigNumber } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { withDecimals } from "./format";
import { IWebConfig } from "./types";

const PoolABI = new ethers.utils.Interface(
  fs.readFileSync("./abi/api3pool.json", "utf-8")
);

export const Address = {
  asBuffer: (addr: string): Buffer => {
    return Buffer.from(addr.replace("0x", ""), "hex");
  },
};

const uniqueEvents = async (member: string): Promise<Array<any>> => {
  const blocks = new Map<number, number>();
  const disabledBlocks = new Map<number, number>();
  const out = new Array();
  const events = await prisma.memberEvent.findMany({
    where: { address: Address.asBuffer(member) },
    orderBy: { blockNumber: "asc" },
  });
  // loop 1 - define what blocks are definitely disabled
  for (const event of events) {
    if (event.eventName === "Shares") {
      disabledBlocks.set(event.blockNumber, 1);
    }
  }
  // loop 2 - define blocks that should end
  for (const event of events) {
    if (disabledBlocks.has(event.blockNumber)) continue;
    if (blocks.has(event.blockNumber)) continue;
    event.eventName = "Shares";
    event.txIndex = 255;
    event.logIndex = 255;
    event.gasPrice = BigInt(0);
    event.gasUsed = BigInt(0);
    event.fee = BigInt(0);
    event.feeUsd = new Prisma.Decimal(0.0);
    out.push(event);
    blocks.set(event.blockNumber, 1);
  }
  return out;
};

export const Shares = {
  resetAll: async () => {
    await prisma.cacheUserShares.deleteMany({});
  },
  downloadTotalsAt: async (
    endpoint: string,
    webconfig: IWebConfig,
    blockNumber: number
  ) => {
    const pool: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3pool"
      ) || { address: "" }
    ).address;

    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    const found = await prisma.cacheTotalShares.findMany({
      where: { height: blockNumber },
    });
    if (found.length == 0) {
      console.log("Requesting Block", blockNumber, " totals");
      const blockHex = "0x" + blockNumber.toString(16);

      const result = await ethers.utils.fetchJson(
        jsonRpc.connection,
        `[
           {"method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x3a98ef39d75a0463a589a77e7570097b7e407deab0b5678402f964703022acc1"}, "${blockHex}"],"id":"totalShares","jsonrpc":"2.0"},
           {"method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x8b0e9f3f74ca417eae2239691de899dcf9e89dd25acfd44380d195cbb069ebd1"}, "${blockHex}"],"id":"totalStake","jsonrpc":"2.0"}
         ]`
      );
      result.forEach((item: any) => {
        if (item.error) {
          throw item.error;
        }
      }); // error handling
      const totalShares = result
        .filter((item: any) => item.id === "totalShares")
        .map((item: any) => BigInt(item.result))[0].toString();
      const totalStake = result
        .filter((item: any) => item.id === "totalStake")
        .map((item: any) => BigInt(item.result))[0].toString();

      await prisma.cacheTotalShares.create({
        data: {
          height: blockNumber,
          totalShares: new Prisma.Decimal(totalShares),
          totalStake: new Prisma.Decimal(totalStake),
        },
      });
      return { totalShares, totalStake };
    }
    return found[0];
  },

  downloadUserAt: async (
    endpoint: string,
    webconfig: IWebConfig,
    member: string,
    blockNumber: number
  ) => {
    const pool: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3pool"
      ) || { address: "" }
    ).address;

    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    const poolContract = new ethers.Contract(pool, PoolABI, jsonRpc);
    const userAddress = member;
    const found = await prisma.cacheUserShares.findMany({
      where: { addr: Address.asBuffer(userAddress), height: blockNumber },
    });
    if (found.length == 0) {
      console.log("Requesting Block", blockNumber, " for ", member);
      const shares = withDecimals(
        (await poolContract.userSharesAt(userAddress, blockNumber)).toString(),
        18
      );
      const votingPower = withDecimals(
        (
          await poolContract.userVotingPowerAt(userAddress, blockNumber)
        ).toString(),
        18
      );
      const stake = withDecimals(
        (await poolContract.userStake(userAddress, blockNumber)).toString(),
        18
      );
      const locked = withDecimals(
        (await poolContract.userLocked(userAddress, blockNumber)).toString(),
        18
      );
      const user = await poolContract.users(userAddress, blockNumber);
      await prisma.cacheUserShares.create({
        data: {
          addr: Address.asBuffer(userAddress),
          height: blockNumber,
          shares: new Prisma.Decimal(shares),
          stake: new Prisma.Decimal(stake),
          locked: new Prisma.Decimal(locked),
          votingPower: new Prisma.Decimal(votingPower),
          user,
        },
      });
      return { shares, stake, locked, votingPower, user };
    }
    return found[0];
  },
  download: async (endpoint: string, member: string) => {
    const webconfig = fetchWebconfig();

    let count = 0;
    const events = await uniqueEvents(member);
    console.log("Found ", events.length, "events");
    for (const e of events) {
      /*const argsUser = await Shares.downloadUserAt(
        endpoint,
        webconfig,
        member,
        e.blockNumber
      ); */
      const argsUser = {};
      const totals = await Shares.downloadTotalsAt(
        endpoint,
        webconfig,
        e.blockNumber
      );
      console.log(
        "Block ",
        e.blockNumber,
        JSON.stringify(argsUser),
        JSON.stringify(totals)
      );
      const args = { ...argsUser, ...totals };
      await prisma.memberEvent.create({
        data: {
          id: e.id + "-s",
          createdAt: e.createdAt,
          address: e.address,
          chainId: e.chainId,
          txHash: e.txHash,
          blockNumber: e.blockNumber,
          txIndex: e.txIndex,
          logIndex: e.logIndex,
          eventName: e.eventName,
          data: args as any,
          gasPrice: e.gasPrice,
          gasUsed: e.gasUsed,
          fee: e.fee,
          feeUsd: e.feeUsd,
        },
      });
      count++;
    }

    return count;
  },
};
