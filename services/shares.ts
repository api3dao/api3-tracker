import prisma from "./db";
import { Prisma } from "@prisma/client";
import { BigNumber, ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { zerosLeft, toBigIntArray, withDecimals } from "./format";
import { VotingReader } from "./voting";
import { Wallets, Votings, VotingEvents } from "./api";

export const Address = {
  asBuffer: (addr: string): Buffer => {
    return Buffer.from(addr.replace("0x", ""), "hex");
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const uniqueEvents = async (
  member: string
): Promise<[Array<any>, any, number]> => {
  const blocks = new Map<number, number>();
  const disabledBlocks = new Map<number, number>();
  const out = new Array();
  let lastEvent: any = null;
  let lastBlockNumber: number = 0;
  const events = await prisma.memberEvent.findMany({
    where: { address: Address.asBuffer(member) },
    orderBy: { blockNumber: "asc" },
  });
  // loop 1 - define what blocks are definitely disabled
  for (const event of events) {
    if (event.eventName === "Status" || event.eventName === "Shares") {
      disabledBlocks.set(event.blockNumber, 1);
      lastEvent = event;
    }
    lastBlockNumber = event.blockNumber;
  }
  // loop 2 - define blocks that should end
  for (const event of events) {
    if (disabledBlocks.has(event.blockNumber)) continue;
    if (blocks.has(event.blockNumber)) continue;
    event.eventName = "Status";
    event.txIndex = 255;
    event.logIndex = 255;
    event.gasPrice = BigInt(0);
    event.gasUsed = BigInt(0);
    event.fee = BigInt(0);
    event.feeUsd = new Prisma.Decimal(0.0);
    out.push(event);
    blocks.set(event.blockNumber, 1);
  }
  return [out, lastEvent, lastBlockNumber];
};

export const Shares = {
  resetAll: async () => {
    await prisma.cacheUserShares.deleteMany({});
  },
  downloadTotalsAt: async (
    endpoint: string,
    pool: string,
    blockNumber: number
  ) => {
    const found = await prisma.cacheTotalShares.findMany({
      where: { height: blockNumber },
    });
    if (found.length == 0) {
      console.log("Requesting totals at", blockNumber);
      const blockHex = "0x" + blockNumber.toString(16);

      const jsonRpc = new ethers.providers.JsonRpcProvider({
        url: endpoint,
        throttleLimit: 5,
        timeout: 300000,
      });
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
      const totalShares = withDecimals(
        result
          .filter((item: any) => item.id === "totalShares")
          .map((item: any) => BigInt(item.result))[0]
          .toString(),
        18
      );
      const totalStake = withDecimals(
        result
          .filter((item: any) => item.id === "totalStake")
          .map((item: any) => BigInt(item.result))[0]
          .toString(),
        18
      );

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
    pool: String,
    member: string,
    blockNumber: number
  ) => {
    const userAddress = member;
    const found = await prisma.cacheUserShares.findMany({
      where: { addr: Address.asBuffer(userAddress), height: blockNumber },
    });
    if (found.length == 0) {
      console.log("Requesting user state at", blockNumber, "for", member);

      const jsonRpc = new ethers.providers.JsonRpcProvider({
        url: endpoint,
        throttleLimit: 5,
        timeout: 300000,
      });
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

      const shares = withDecimals(
        result
          .filter((item: any) => item.id === "userShares")
          .map((item: any) => BigInt(item.result))[0]
          .toString(),
        18
      );

      const votingPower = withDecimals(
        result
          .filter((item: any) => item.id === "userVotingPower")
          .map((item: any) => BigInt(item.result))[0]
          .toString(),
        18
      );

      const stake = withDecimals(
        result
          .filter((item: any) => item.id === "userStake")
          .map((item: any) => BigInt(item.result))[0]
          .toString(),
        18
      );

      const locked = withDecimals(
        result
          .filter((item: any) => item.id === "userLocked")
          .map((item: any) => BigInt(item.result))[0]
          .toString(),
        18
      );

      const user = result
        .filter((item: any) => item.id === "users")
        .map((item: any) =>
          toBigIntArray(item.result.replace("0x", "")).map((bn: BigInt) =>
            bn.toString()
          )
        )[0];

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
      return { shares, stake, locked, votingPower, user, downloaded: true };
    }
    return { ...found[0], downloaded: false };
  },

  recalculateTotals: async () => {
    const votings = await Votings.fetchAll();
    for (const v of votings) {
      const voteInternalId = v.id;
      console.log("VOTING", voteInternalId, v.name);
      let bnFor = BigNumber.from(0);
      let bnAgainst = BigNumber.from(0);
      const events = await VotingEvents.fetchCastData(voteInternalId);
      for (const data of events) {
        try {
          const supports = data['2'] as boolean;
          const shares = BigNumber.from(data['3']).toString();
          if (supports) {
            bnFor = bnFor.add(shares);
          } else {
            bnAgainst = bnAgainst.add(shares);
          }
          console.log(supports,
            withDecimals(bnFor.toString(), 18),
            withDecimals(bnAgainst.toString(), 18));
        } catch (e){
          console.error(e)
        }
      }

      const totalFor = new Prisma.Decimal(withDecimals(bnFor.toString(), 18));
      const totalAgainst = new Prisma.Decimal(withDecimals(bnAgainst.toString(), 18));
      if (v.totalFor != totalFor || v.totalAgainst != totalAgainst) {
        console.log("== UPDATED");
        await prisma.voting.updateMany({
          where: { id: voteInternalId + "" },
          data: { totalFor, totalAgainst },
        });
      }
    }
  },

  downloadVotings: async (endpoint: string) => {
    let count = 0;
    const votings = await Votings.fetchAll();
    for (const v of votings) {
      const ve = await VotingEvents.fetchStart(v.id);
      if (!ve) continue;

      const transactionHash = ve.txHash.toString("hex");
      const cached = await prisma.cacheVoting.findMany({
        where: {
          hash: Buffer.from(transactionHash.replace("0x", ""), "hex"),
        },
      });
      if (cached.length == 0) continue;

      const script = (cached[0].data as any)[4];
      const scriptData = VotingReader.parseScript(script[0]);

      const cachedData = cached[0].data as any;
      const totalStaked = withDecimals(
        ethers.BigNumber.from(cachedData[3][0]).toString(),
        18
      );
      const data: any = { totalStaked };
      if (scriptData.token) data.transferToken = scriptData.token;
      if (scriptData.amount) data.transferValue = scriptData.amount;
      if (scriptData.address) data.transferAddress = scriptData.address;
      console.log(v.id, v.vt, v.name, JSON.stringify(data));
      await prisma.voting.update({
        where: { id: v.id },
        data,
      });
      count++;
    }
    return count;
  },
  downloadMembers: async (endpoint: string, tag: string, rpsLimit: boolean) => {
    const cursor = { take: 1000000, skip: 0 };
    const wallets = await Wallets.fetchList(tag, cursor);
    console.log("Found ", wallets.list.length, "members");
    let count = 0;
    for (const w of wallets.list) {
      await Shares.download(endpoint, w.address.toString(), rpsLimit);
      count++;
    }
    return count;
  },

  download: async (endpoint: string, member: string, rpsLimit: boolean) => {
    const webconfig = fetchWebconfig();
    const pool: string = (
      webconfig.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3pool"
      ) || { address: "" }
    ).address;

    let count = 0;
    const [events, lastEvent, lastBlockNumber] = await uniqueEvents(member);
    console.log(
      "Found ",
      events.length,
      "events till",
      lastBlockNumber,
      "for",
      member.toString()
    );
    for (const e of events) {
      const started = new Date();
      const argsUser = await Shares.downloadUserAt(
        endpoint,
        pool,
        member,
        e.blockNumber
      );
      const totals = await Shares.downloadTotalsAt(
        endpoint,
        pool,
        e.blockNumber
      );
      const took: number = new Date().getTime() - started.getTime();
      console.log(
        "Block",
        e.blockNumber,
        "took",
        took + "ms",
        JSON.stringify(argsUser),
        JSON.stringify(totals)
      );
      if (argsUser.downloaded) {
        if (rpsLimit && took < 1000) {
          console.log("RPS Limit: wait for", 1000 - took, "ms");
          await sleep(1000 - took);
        }
      }
      delete (argsUser as any).downloaded;
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
    if (lastEvent != null) {
      console.log("UPDATING", JSON.stringify(lastEvent.data));
      const data: any = lastEvent.data;
      const unstaked = withDecimals(data.user[2], 18);
      // const vesting = (withDecimals(data.user[1], 18));
      await prisma.member.update({
        where: { address: lastEvent.address },
        data: {
          userLockedReward: data.locked,
          userStake: data.stake,
          userShare: data.shares,
          userVotingPower: data.votingPower,
          userUnstake: new Prisma.Decimal(unstaked),
        },
      });
    }

    return count;
  },
};
