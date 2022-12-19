import prisma from "./db";
import { Prisma } from "@prisma/client";
import fs from "fs";
import { ethers, BigNumber } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { zerosLeft, toBigIntArray, withDecimals } from "./format";
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
      console.log("Requesting totals at", blockNumber);
      const blockHex = "0x" + blockNumber.toString(16);

      const result = await ethers.utils.fetchJson(
        jsonRpc.connection,
        `[
           {"id":"totalShares","method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x3a98ef39d75a0463a589a77e7570097b7e407deab0b5678402f964703022acc1"}, "${blockHex}"],"jsonrpc":"2.0"},
           {"id":"totalStake","method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x8b0e9f3f74ca417eae2239691de899dcf9e89dd25acfd44380d195cbb069ebd1"}, "${blockHex}"],"jsonrpc":"2.0"}
         ]`
      );
      result.forEach((item: any) => {
        if (item.error) {
          throw item.error;
        }
      }); // error handling
      const totalShares = withDecimals(result
        .filter((item: any) => item.id === "totalShares")
        .map((item: any) => BigInt(item.result))[0]
        .toString(), 18);
      const totalStake = withDecimals(result
        .filter((item: any) => item.id === "totalStake")
        .map((item: any) => BigInt(item.result))[0]
        .toString(), 18);

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
    const userAddress = member;
    const found = await prisma.cacheUserShares.findMany({
      where: { addr: Address.asBuffer(userAddress), height: blockNumber },
    });
    if (found.length == 0) {
      console.log("Requesting user state at", blockNumber, "for", member);
      const blockHex = "0x" + blockNumber.toString(16);
      const memberHex = zerosLeft(member.replace("0x", ""), 64);

      // 4-byte keccak hashes for calling methods are below:
      const methodUserShares = "de69b3aa";
      const methodUserVotingPower = "36b1b6a4";
      const methodUserStake = "68e5585d";
      const methodUserLocked = "bba05384";
      const methodUsers = "a87430ba";

      const result = await ethers.utils.fetchJson(
        jsonRpc.connection,
        `[
           {"id":"userShares","method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x${methodUserShares}${memberHex}"}, "${blockHex}"],"jsonrpc":"2.0"},
           {"id":"userVotingPower","method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x${methodUserVotingPower}${memberHex}"}, "${blockHex}"],"jsonrpc":"2.0"},
           {"id":"userStake","method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x${methodUserStake}${memberHex}"}, "${blockHex}"],"jsonrpc":"2.0"},
           {"id":"userLocked","method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x${methodUserLocked}${memberHex}"}, "${blockHex}"],"jsonrpc":"2.0"},
           {"id":"users","method":"eth_call","params":[{"from":null,"to":"${pool}","data":"0x${methodUsers}${memberHex}"}, "${blockHex}"],"jsonrpc":"2.0"}
         ]`
      );
      result.forEach((item: any) => {
        if (item.error) {
          throw item.error;
        }
      }); // error handling

      const shares = withDecimals(result
        .filter((item: any) => item.id === "userShares")
        .map((item: any) => BigInt(item.result))[0]
        .toString(), 18);

      const votingPower = withDecimals(result
        .filter((item: any) => item.id === "userVotingPower")
        .map((item: any) => BigInt(item.result))[0]
        .toString(), 18);

      const stake = withDecimals(result
        .filter((item: any) => item.id === "userStake")
        .map((item: any) => BigInt(item.result))[0]
        .toString(), 18);

      const locked = withDecimals(result
        .filter((item: any) => item.id === "userLocked")
        .map((item: any) => BigInt(item.result))[0]
        .toString(), 18);

      const user = result
        .filter((item: any) => item.id === "users")
        .map((item: any) => toBigIntArray(item.result.replace("0x", "")).map((bn: BigInt) => bn.toString()))[0];

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
      const argsUser = await Shares.downloadUserAt(
        endpoint,
        webconfig,
        member,
        e.blockNumber
      );
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
