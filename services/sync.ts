import fs from "node:fs";

import {
  type Filter,
  type Block,
  type Log,
  type Provider,
} from "@ethersproject/abstract-provider";
import { Prisma, type PrismaPromise } from "@prisma/client";
import { BigNumber, ethers } from "ethers";
import { uniq } from "lodash";

import { Wallets } from "./../services/api";
import { noDecimals, withDecimals } from "./../services/format";
import { VoteGas } from "./../services/gas";
import { Batch } from "./../services/members";
import type { IPriceReader } from "./../services/price";
import { Shares } from "./../services/shares";
import {
  type IWebConfig,
  type IBlockNumber,
  type IWallet,
  type IContract,
} from "./../services/types";
import { VotingReader } from "./../services/voting";
import prisma from "./db";
import { fetchWebconfig } from "./webconfig";

import BatchPayload = Prisma.BatchPayload;

const rewardsPct = (newApr: number): number => {
  const epochLength = 604_800;
  const week = epochLength / 3600 / 24;
  const aprCoeff = (52 * week) / 365;
  return (newApr * 100 * aprCoeff) / 52;
};

interface SyncTermination {
  epoch: boolean;
  block: number;
}

interface SyncVerbosity {
  blocks: boolean;
  epochs: boolean;
  votings: boolean;
  member: string;
}

interface SyncBlockResult {
  shouldTerminate: boolean;
  included: boolean;
}

interface BlockFullInfo {
  // Block Header information
  block: Block;
  // Price of Ethereum at this point
  price: number;
  // Map of transactions data
  txs: Map<string, any>;
  // Map of transaction receipts
  receipts: Map<string, any>;
  // Logs
  logs: Map<string, Array<Log>>;
}

const elapsed = (since: number): string => {
  const duration = Date.now() - since;
  return `${duration / 1000}s`;
};

const uniqueArray = (arr: Array<any>): Array<any> => {
  return uniq(arr.filter((item) => item !== ""));
};

const adjustedLogIndex = (a: any): number => {
  if (
    a.topics.length > 0 &&
    a.topics[0] ===
      "0xf310def5b4718cefe3603eb46259d8061fd58003695cf952de94c53e14dbb309"
  ) {
    return 255;
  }
  return a.logIndex;
};

export const BlockLoader = {
  fromDatabase: async (
    blockRecord: any,
    verboseBlock: boolean,
  ): Promise<BlockFullInfo> => {
    const start = Date.now();
    const price = Number.parseFloat(blockRecord.price.toString());
    const block: Block = blockRecord.data as any;

    const foundLogs = await prisma.cacheLogs.findMany({
      where: { hash: blockRecord.hash },
    });
    if (foundLogs.length === 0) throw "no logs saved for the block";
    const logsList = new Array<Log>();
    for (const found of foundLogs) {
      const logs = found.logs as any;
      for (const l of logs) logsList.push(l);
    }
    logsList.sort((a, b) => {
      const diff1 = a.transactionIndex - b.transactionIndex;
      if (diff1 != 0) return diff1;
      return adjustedLogIndex(a) - adjustedLogIndex(b);
    });

    const receipts = new Map<string, any>();
    const txs = new Map<string, any>();
    const logs = new Map<string, Array<Log>>();
    for (const log of logsList) {
      const hash = log.transactionHash;
      const l = logs.get(log.address) || new Array<Log>();
      l.push(log);
      logs.set(log.address, l);

      if (!txs.has(hash)) {
        const foundTx = await prisma.cacheTx.findMany({
          where: { hash: Hash.asBuffer(hash) },
        });
        const transaction = foundTx[0].data as any;
        txs.set(hash, transaction);
      }
      if (!receipts.has(hash)) {
        const foundReceipt = await prisma.cacheReceipt.findMany({
          where: { hash: Hash.asBuffer(hash) },
        });
        const receipt = foundReceipt[0].receipt as any;
        receipts.set(hash, receipt);
      }
    }

    if (verboseBlock) {
      console.log(
        "Processing",
        block.number,
        new Date(block.timestamp * 1000),
        logsList.length + "L",
        receipts.size + "R",
        price.toFixed(2) + "USD",
        "read in " + elapsed(start),
      );
    }
    return { block, price, txs, receipts, logs };
  },

  fromLogs: async (
    jsonRpc: Provider,
    blockHash: string,
    logsList: Array<Log>,
    priceReader: IPriceReader,
  ): Promise<BlockFullInfo> => {
    const start = Date.now();

    const foundBlock = await prisma.cacheBlock.findMany({
      where: { hash: Hash.asBuffer(blockHash) },
    });
    const block =
      foundBlock.length > 0
        ? (foundBlock[0].data as any as Block)
        : await jsonRpc.getBlock(blockHash);
    const price =
      foundBlock.length > 0
        ? Number.parseFloat(foundBlock[0].price.toString())
        : await priceReader(new Date(block.timestamp * 1000));

    // load receipts for each transaction
    const txs = new Map<string, any>();
    const receipts = new Map<string, any>();
    const logs = new Map<string, Array<Log>>();
    for (const log of logsList) {
      const hash = log.transactionHash;
      if (!txs.has(hash)) {
        const foundTx = await prisma.cacheTx.findMany({
          where: { hash: Hash.asBuffer(hash) },
        });
        const t =
          foundTx.length > 0
            ? (foundTx[0].data as any)
            : await jsonRpc.getTransaction(hash);
        txs.set(hash, t);
      }
      if (!receipts.has(hash)) {
        const foundReceipt = await prisma.cacheReceipt.findMany({
          where: { hash: Hash.asBuffer(hash) },
        });
        const receipt =
          foundReceipt.length > 0
            ? (foundReceipt[0].receipt as any)
            : await jsonRpc.getTransactionReceipt(hash);
        receipts.set(hash, receipt);
      }
      const l = logs.get(log.address) || new Array<Log>();
      l.push(log);
      logs.set(log.address, l);
    }

    console.log(
      "Block",
      block.number,
      new Date(block.timestamp * 1000),
      logsList.length + "L",
      receipts.size + "R",
      price.toFixed(2) + "USD",
      "took " + elapsed(start),
    );
    return {
      block,
      txs,
      receipts,
      price,
      logs,
    };
  },
};

export const Sync = {
  hasBlock: async (blockHash: string): Promise<boolean> => {
    const status = await prisma.cacheBlock.findMany({
      where: { hash: Hash.asBuffer(blockHash) },
    });
    return status.length > 0;
  },
  saveBlock: async (b: BlockFullInfo, tx: PrismaPromise<BatchPayload>[]) => {
    const blockHash = Hash.asBuffer(b.block.hash);
    // 1. save block
    tx.push(
      prisma.cacheBlock.createMany({
        data: [
          {
            hash: blockHash,
            height: b.block.number,
            createdAt: new Date(b.block.timestamp * 1000).toISOString(),
            price: b.price,
            data: b.block as any,
          },
        ],
        skipDuplicates: true,
      }),
    );
    // 2. save transaction details
    for (const [txHash, t] of b.txs.entries()) {
      tx.push(
        prisma.cacheTx.createMany({
          data: [
            {
              hash: Hash.asBuffer(txHash),
              data: t,
            },
          ],
          skipDuplicates: true,
        }),
      );
    }
    // 3. save receipts
    for (const [txHash, receipt] of b.receipts.entries()) {
      tx.push(
        prisma.cacheReceipt.createMany({
          data: [
            {
              hash: Hash.asBuffer(txHash),
              receipt,
            },
          ],
          skipDuplicates: true,
        }),
      );
    }
    // 4. save logs for every contract
    for (const [contract, logs] of b.logs) {
      tx.push(
        prisma.cacheLogs.createMany({
          data: [
            {
              hash: blockHash,
              contract: Hash.asBuffer(contract),
              logs: logs as any,
            },
          ],
          skipDuplicates: true,
        }),
      );
    }
  },
  updateProcessed: async (blockNumber: number) => {
    // update block number
    await prisma.syncStatus.updateMany({
      where: { id: 1 },
      data: {
        updatedAt: new Date().toISOString(),
        processed: blockNumber,
      },
    });
  },

  // reset all cache
  reset: async () => {
    await prisma.$transaction([
      prisma.cacheBlock.deleteMany({}),
      prisma.cacheReceipt.deleteMany({}),
      prisma.cacheLogs.deleteMany({}),
      prisma.syncStatus.updateMany({
        where: { id: 1 },
        data: {
          updatedAt: new Date().toISOString(),
          processed: 0,
          downloaded: 0,
        },
      }),
    ]);
  },
  next: async (verboseBlock: boolean): Promise<BlockFullInfo | null> => {
    // pick next block
    const processed: number =
      (
        await prisma.syncStatus.findFirst({
          where: { id: 1 },
        })
      )?.processed || 0;

    const blocks = await prisma.cacheBlock.findMany({
      where: { height: { gt: processed } },
      orderBy: { height: "asc" },
      take: 1,
    });
    if (blocks.length > 0) {
      const block = blocks[0];
      return BlockLoader.fromDatabase(block, verboseBlock);
    }
    return null;
  },
};

export const Blocks = {
  // fetch the last block
  fetchLastDownloaded: async (): Promise<IBlockNumber> => {
    const status = await prisma.syncStatus.findMany({
      where: { id: 1 },
    });
    if (status.length > 0) {
      return {
        blockNumber: status[0].downloaded,
      };
    }
    return { blockNumber: 0 };
  },
};

export const Filters = {
  prepare: (
    contracts: Array<string>,
    minBlock: number,
    batchSize: number,
    last: number,
    head: number,
  ): Array<Map<string, Filter>> => {
    const filter: any = {};
    if (last) filter.fromBlock = last;
    else if (minBlock) filter.fromBlock = minBlock;

    if (!head || !batchSize) {
      console.warn("no head, no batch size");
      // case of the single batch
      const cMap = new Map<string, Filter>();
      for (const address of contracts) {
        cMap.set(address, { ...filter, address });
      }
      return [cMap];
    }

    const filters: Array<Map<string, Filter>> = [];
    let bn = filter.fromBlock;
    while (bn <= head) {
      const f: any = {};
      f.fromBlock = bn + 1;
      f.toBlock = bn + batchSize;

      const cMap = new Map<string, Filter>();
      for (const address of contracts) {
        cMap.set(address, { ...f, address });
      }
      filters.push(cMap);
      bn += batchSize;
    }
    return filters;
  },
};

export const Hash = {
  asBuffer: (str: string): Buffer => {
    return Buffer.from(str.replace("0x", ""), "hex");
  },
};

export const Address = {
  asBuffer: (addr: string): Buffer => {
    return Buffer.from(addr.replace("0x", ""), "hex");
  },
};

export const Events = {
  resetState: async () => {
    await prisma.$transaction([
      prisma.memberDelegation.deleteMany({}),
      prisma.memberEvent.deleteMany({}),
      prisma.votingEvent.deleteMany({}),
      prisma.member.deleteMany({}),
      prisma.voting.deleteMany({}),
      prisma.memberEpoch.deleteMany({}),
      prisma.epoch.deleteMany({}),
      prisma.syncStatus.updateMany({
        where: { id: 1 },
        data: {
          updatedAt: new Date().toISOString(),
          processed: 0,
        },
      }),
    ]);
  },
  // eslint-disable-next-line sort-keys
  resetAll: async () => {
    await Events.resetState();
    await Sync.reset();
  },
  // eslint-disable-next-line sort-keys
  ABI: new ethers.utils.Interface(
    // eslint-disable-next-line unicorn/prefer-spread
    [].concat(
      JSON.parse(fs.readFileSync("./abi/api3pool.json", "utf8")),
      JSON.parse(fs.readFileSync("./abi/api3timelock.json", "utf8")),
      JSON.parse(fs.readFileSync("./abi/api3voting.json", "utf8")),
    ),
  ),
  ConvenienceABI: new ethers.utils.Interface(
    fs.readFileSync("./abi/api3convenience.json", "utf8"),
  ),
  IGNORED: new Map<string, number>([
    ["0x9dcff9d94fbfdb4622d11edb383005f95e78efb446c72d92f8e615c6025c4703", 1],
    ["0xc59489a810a16d84f59a04fb90817354d9afac3bd0a0b6787c8ccb4ff25ed119", 1],
    ["0x5229a5dba83a54ae8cb5b51bdd6de9474cacbe9dd332f5185f3a4f4f2e3f4ad9", 1],
    ["0x2790b90165fd3973ad7edde4eca71b4f8808dd4857a2a3a3e8ae5642a5cb196e", 1],
    ["0xc25cfed0b22da6a56f0e5ff784979a0b8623eddf2aee4acd33c2adefb09cbab6", 1],
    ["0x20d5cc5c404f7bcf167ea08ea1136482041e05e5641946d3e3de6690a23fbe39", 1],
  ]),

  votings: (signature: string, args: any): Array<number> => {
    switch (signature) {
      case "StartVote(uint256,address,string)": {
        return [args[0]];
      }
      case "CastVote(uint256,address,bool,uint256)": {
        return [args[0]];
      }
      case "ExecuteVote(uint256)": {
        return [args[0]];
      }
    }
    return [];
  },

  addresses: (signature: string, args: any, sender: string): Array<string> => {
    switch (signature) {
      case "Deposited(address,uint256,uint256)": {
        return [args[0]];
      }
      case "Staked(address,uint256,uint256,uint256,uint256,uint256,uint256)": {
        return [args[0]];
      }
      case "Delegated(address,address,uint256,uint256)": {
        return uniqueArray([args[0], args[1]]);
      }
      case "UpdatedDelegation(address,address,bool,uint256,uint256)": {
        return uniqueArray([args[0], args[1]]);
      }
      case "Undelegated(address,address,uint256,uint256)": {
        return uniqueArray([args[0], args[1]]);
      }
      case "Unstaked(address,uint256,uint256,uint256,uint256)": {
        return [args[0]];
      }
      case "ScheduledUnstake(address,uint256,uint256,uint256,uint256)": {
        return [args[0]];
      }
      case "DepositedVesting(address,uint256,uint256,uint256,uint256,uint256)": {
        return [args[0]];
      }
      case "DepositedByTimelockManager(address,uint256,uint256)": {
        return [args[0]];
      }
      case "UpdatedLastProposalTimestamp(address,uint256,address)": {
        return uniqueArray([args[0], args[2]]);
      }
      case "VestedTimeLock(address,uint256,uint256)":
      case "VestedTimelock(address,uint256,uint256)": {
        return [args[0]];
      }
      case "Withdrawn(address,uint256)": {
        return [args[0]];
      }
      case "Withdrawn(address,uint256,uint256)": {
        return [args[0]];
      }
      case "WithdrawnToPool(address,address,address)": {
        return uniqueArray([args[0], args[1], args[2]]);
      }
      case "OwnershipTransferred(address,address)": {
        return uniqueArray([args[0], args[1]]);
      }
      case "TransferredAndLocked(address,address,uint256,uint256,uint256)": {
        return uniqueArray([args[0], args[1]]);
      }
      case "StartVote(uint256,address,string)": {
        return [args[1]];
      }
      case "CastVote(uint256,address,bool,uint256)": {
        return [args[1]];
      }
      case "ExecuteVote(uint256)": {
        return [sender];
      }
      // the actions below are not related to members
      case "SetVestingAddresses()":
      case "SetDaoApps(address,address,address,address)":
      case "Api3PoolUpdated(address)":
      case "MintedReward(uint256,uint256,uint256,uint256)": {
        return [];
      }
    }
    console.warn("Unknown signature", signature);
    return [];
  },

  processEpoch: async (
    endpoint: string,
    pool: string,
    blockInfo: BlockFullInfo,
    event: Log,
    tx: any,
    useArchive: boolean,
  ): Promise<boolean> => {
    const start = Date.now();
    const { transactionIndex, transactionHash, logIndex } = event;
    const blockNumber = blockInfo.block.number;

    const blockDt = new Date(blockInfo.block.timestamp * 1000);

    const releaseDt = new Date(blockInfo.block.timestamp * 1000);
    releaseDt.setFullYear(releaseDt.getFullYear() + 1);
    const txHash = Buffer.from(transactionHash.replace("0x", ""), "hex");

    const { epochIndex, amount, newApr, totalStake } =
      Events.ABI.parseLog(event).args;
    const totalMembers = await Wallets.total();
    const total = totalStake.sub(amount);
    const minted = amount;

    const totalShares = new Prisma.Decimal(
      withDecimals(totalStake.toString(), 18),
    );
    const mintedShares = new Prisma.Decimal(
      withDecimals(amount.toString(), 18),
    );

    const currentEpoch = await prisma.epoch.findMany({
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    const oldApr = currentEpoch.length > 0 ? currentEpoch[0].newApr : 38.75;
    const oldAprPct = Number.parseFloat(oldApr + "") * 0.01;

    const newAprPct = Number.parseFloat(
      new Prisma.Decimal(withDecimals(newApr.toString(), 18)).toString(),
    );

    let totalDeposits = new Prisma.Decimal(0);
    let totalWithdrawals = new Prisma.Decimal(0);
    let totalUnlocked = new Prisma.Decimal(0);
    let totalLocked = new Prisma.Decimal(0);

    // members distribution: save snapshots
    if (useArchive) {
      await Shares.downloadTotalsAt(endpoint, pool, blockNumber);
    }
    const allMembers = await Wallets.fetchAll();
    for (const m of allMembers) {
      const { userShare } = m;
      const userSharePct = userShare.mul(100).div(totalShares);
      const userMintedShares = mintedShares.mul(userSharePct).div(100); // rewards are proportional

      // save mintedEvent for each member
      const member: IWallet = m;
      const hasRewardsRecord =
        (userShare && userShare != new Prisma.Decimal(0)) ||
        (userMintedShares && userMintedShares > new Prisma.Decimal(0));
      if (hasRewardsRecord) {
        const eventId =
          event.blockNumber.toString(16) +
          "-" +
          logIndex.toString(16) +
          "." +
          m.address.replace("0x", "") +
          "." +
          Math.random().toString().replace("0.", "");
        const args: any = [
          userShare,
          userSharePct,
          userMintedShares,
          0,
          totalShares,
          mintedShares,
        ];
        tx.push(
          prisma.memberEvent.create({
            data: {
              address: Address.asBuffer(m.address),
              blockNumber,
              chainId: 0,
              createdAt: blockDt,
              data: args,
              eventName: "Rewards",
              fee: BigInt(0),
              feeUsd: "0",
              // we do not want the gas price to be included in totals
              // because of this event
              gasPrice: BigNumber.from(0).toNumber(),
              gasUsed: BigNumber.from(0).toNumber(),
              id: eventId,
              logIndex,
              txHash,
              txIndex: transactionIndex,
            },
          }),
        );
      }

      totalDeposits = totalDeposits.add(m.userDeposited);
      totalWithdrawals = totalWithdrawals.add(m.userWithdrew);
      totalUnlocked = totalUnlocked.add(m.userReward.sub(m.userLockedReward));
      totalLocked = totalLocked.add(m.userLockedReward);

      if (useArchive) {
        const data = await Shares.downloadUserAt(
          endpoint,
          pool,
          member.address,
          blockNumber,
        );
        const unstaked = withDecimals(data.user[2], 18);
        member.userLockedReward = new Prisma.Decimal(data.locked);
        member.userStake = new Prisma.Decimal(data.stake);
        member.userShare = new Prisma.Decimal(data.shares);
        member.userVotingPower = new Prisma.Decimal(data.votingPower);
        member.userUnstake = new Prisma.Decimal(unstaked);
        Batch.ensureUpdated(member);
      }
    }

    tx.push(
      prisma.epoch.create({
        data: {
          apr: oldApr,
          blockNumber,
          chainId: 0,
          createdAt: blockDt,
          epoch: Number.parseInt(epochIndex.toString()),
          isCurrent: 0,
          members: totalMembers,
          mintedShares: new Prisma.Decimal(
            noDecimals(withDecimals(minted.toString(), 18)),
          ),
          newApr: new Prisma.Decimal(withDecimals(newApr.toString(), 16)),
          newRewardsPct: rewardsPct(newAprPct),
          releaseDate: releaseDt,
          rewardsPct: rewardsPct(oldAprPct),
          stakedRewards: 0,
          totalDeposits,
          totalLocked,
          totalShares: 0,
          totalStake: new Prisma.Decimal(
            noDecimals(withDecimals(total.toString(), 18)),
          ),
          totalUnlocked,
          totalWithdrawals,
          txHash,
        },
      }),
    );

    const expireDt = new Date(blockInfo.block.timestamp * 1000 - 12_096e5); // minus 2 weeks
    tx.push(
      prisma.voting.updateMany({
        where: { status: "pending", createdAt: { lt: expireDt.toISOString() } },
        data: { status: "rejected" },
      }),
    );
    console.log("Processing Epoch", "took " + elapsed(start));
    return true;
  },

  processVote: async (
    blockInfo: BlockFullInfo,
    event: Log,
    args: any,
    config: IWebConfig,
    endpoint: string,
    verboseVote: boolean,
    verboseMember: string,
    tx: any,
  ): Promise<boolean> => {
    const start = Date.now();
    const { transactionHash } = event;
    const { voteId, metadata } = args;
    // const blockNumber = blockInfo.block.number;
    const blockDt = new Date(blockInfo.block.timestamp * 1000);
    const isPrimary = VotingReader.isPrimary(config, event.address);
    const voteInternalId = voteId * 2 + (isPrimary ? 1 : 0);

    const convenience = config.contracts?.find(
      (p: any) => p.name.toLowerCase() === "convenience",
    );
    if (!convenience) {
      throw "api3 convenience contract is not configured";
    }
    const txSender: string = blockInfo.receipts.get(transactionHash).from;

    const scriptData = {
      amount: new Prisma.Decimal(0),
      token: "",
      address: Buffer.from([]),
    };
    let totalStaked = new Prisma.Decimal(0);
    let totalRequired = new Prisma.Decimal(0);
    let status = "pending";

    if (endpoint != "none") {
      // option to ignore voting details for offline state processing
      // we can actually cache this request in the future
      const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
      const conv = new ethers.Contract(
        convenience.address,
        Events.ConvenienceABI,
        jsonRpc,
      );
      const cached = await prisma.cacheVoting.findMany({
        where: {
          hash: Buffer.from(transactionHash.replace("0x", ""), "hex"),
        },
      });

      let script: any = {};
      let scriptData: any = {};
      let votingPower: any = "";

      if (cached.length === 0) {
        const result = await conv.getStaticVoteData(
          isPrimary ? 0 : 1,
          txSender,
          [voteId.toString()],
        );
        await prisma.cacheVoting.create({
          data: {
            hash: Buffer.from(transactionHash.replace("0x", ""), "hex"),
            data: result as any,
          },
        });
        ({ script, votingPower } = result);
      } else {
        script = (cached[0].data as any)[4];
        votingPower = ethers.BigNumber.from((cached[0].data as any)[3][0]);
      }
      scriptData = VotingReader.parseScript(script[0]); // there might be something tricky here

      totalStaked = new Prisma.Decimal(
        withDecimals(votingPower.toString(), 18),
      );
      if (scriptData.address) {
        const addr =
          "0x" + Buffer.from(scriptData.address).toString("hex").toLowerCase();
        const matchMember: boolean =
          addr.replace("0x", "").toLowerCase() === verboseMember;
        await Batch.ensureExists(addr, blockDt, "grant", matchMember);
      }

      // multiply totalStaked by supportRequired. can round up wildly
      const pctRequired = isPrimary ? 0.5 : 0.15;
      const absRequired =
        Number.parseFloat(
          noDecimals(withDecimals(votingPower.toString(), 18)),
        ) * pctRequired;
      totalRequired = new Prisma.Decimal(absRequired);
      if (script.scriptType === "invalid") status = "invalid";
    }

    const meta = VotingReader.parseMetadata(metadata) || {
      title: "",
      description: "",
      targetSignature: "",
    };
    // console.log( blockDt, voteInternalId, isPrimary ? "PRIMARY" : "SECONDARY", "META.TITLE", meta.title);
    if (meta.targetSignature.includes(" ")) {
      // Typical error in the signature is putting space
      status = "invalid";
    }
    tx.push(
      prisma.voting.create({
        data: {
          createdAt: blockDt.toISOString(),
          id: voteInternalId + "",
          name: meta.title, // we also have
          status,
          totalAgainst: new Prisma.Decimal("0.0"),
          totalFor: new Prisma.Decimal("0.0"),
          totalGasUsed: BigInt(0),
          totalRequired,
          totalStaked,
          totalUsd: new Prisma.Decimal("0.0"),
          transferAddress: scriptData.address,
          transferToken: scriptData.token,
          transferValue: scriptData.amount,
          vt: isPrimary ? "PRIMARY" : "SECONDARY",
        },
      }),
    );
    if (verboseVote) {
      console.log("New Voting", "took " + elapsed(start));
    }
    return false;
  },

  castVote: async (
    blockInfo: BlockFullInfo,
    event: Log,
    args: any,
    config: IWebConfig,
    verboseVote: boolean,
    _verboseMember: string,
    tx: any,
  ) => {
    const { voteId, supports, stake } = args;

    const isPrimary = VotingReader.isPrimary(config, event.address);
    const voteInternalId = voteId * 2 + (isPrimary ? 1 : 0);
    const supported: boolean = supports === "true" || supports === true;

    let totalFor = new Prisma.Decimal(
      supported ? withDecimals(stake.toString(), 18) : 0,
    );
    let totalAgainst = new Prisma.Decimal(
      supported ? 0 : withDecimals(stake.toString(), 18),
    );
    const foundVote = await prisma.voting.findMany({
      where: { id: voteInternalId + "" },
    });
    if (foundVote.length > 0) {
      totalFor = totalFor.add(foundVote[0].totalFor);
      totalAgainst = totalAgainst.add(foundVote[0].totalAgainst);
    }
    if (verboseVote) {
      const blockDt = new Date(blockInfo.block.timestamp * 1000);
      console.log(
        "VOTE",
        blockInfo.block.number,
        blockDt,
        voteInternalId,
        "SUPPORTED",
        supported,
        "FOR",
        totalFor,
        "AGAINST",
        totalAgainst,
      );
    }
    tx.push(
      prisma.voting.updateMany({
        where: { id: voteInternalId + "" },
        data: { totalFor, totalAgainst },
      }),
    );
  },

  execVote: async (
    blockInfo: BlockFullInfo,
    event: Log,
    args: any,
    config: IWebConfig,
    verboseVote: boolean,
    _verboseMember: string,
    tx: any,
  ) => {
    const { voteId } = args;
    const isPrimary = VotingReader.isPrimary(config, event.address);
    const voteInternalId = voteId * 2 + (isPrimary ? 1 : 0);
    // const receipt = blockInfo.receipts.get(event.transactionHash);
    if (verboseVote) {
      const blockDt = new Date(blockInfo.block.timestamp * 1000);
      console.log(
        "VOTE",
        blockInfo.block.number,
        blockDt,
        voteInternalId,
        "EXECUTED",
      );
    }
    tx.push(
      prisma.voting.updateMany({
        where: {
          id: voteInternalId + "",
        },
        data: {
          status: "executed",
          // TODO: gas used
        },
      }),
    );
  },

  processBlock: async (
    blockInfo: BlockFullInfo,
    config: IWebConfig,
    endpoint: string,
    verbose: SyncVerbosity,
    termination: SyncTermination,
    useArchive: boolean,
  ): Promise<SyncBlockResult> => {
    const start = Date.now();
    VoteGas.reset(); // gas accumulator for the block
    Batch.reset();

    const pool: string = (
      config.contracts?.find(
        ({ name }) => name.toLowerCase() === "api3pool",
      ) || { address: "" }
    ).address;

    const blockNumber = blockInfo.block.number;
    const blockDt = new Date(blockInfo.block.timestamp * 1000);
    const tx = [];
    let shouldTerminate: boolean = false;
    let included: boolean = true;
    const vm: string = verbose.member.replace("0x", "").toLowerCase();
    for (const [_contractAddress, logs] of blockInfo.logs.entries()) {
      for (const event of logs) {
        const { transactionHash, transactionIndex, logIndex } = event;
        const txHash = Buffer.from(transactionHash.replace("0x", ""), "hex");
        const { from, gasUsed } = blockInfo.receipts.get(transactionHash);
        const matchFrom = from.replace("0x", "").toLowerCase() === vm;
        const { gasPrice } = blockInfo.txs.get(transactionHash);
        const fee = BigNumber.from(gasUsed).mul(BigNumber.from(gasPrice));
        const priceDec = new Prisma.Decimal(blockInfo.price).mul(
          new Prisma.Decimal(withDecimals(fee.toString(), 18)),
        );
        const feeUsd = Number.parseFloat(priceDec.toString());
        // console.log( txHash.toString("hex"), "gasUsed", BigNumber.from(gasUsed).toString(), "gasPrice", BigNumber.from(gasPrice).toString(), "ethPrice", new Prisma.Decimal(blockInfo.price), "fee", new Prisma.Decimal(withDecimals(fee.toString(), 18)), "feeUsd", feeUsd);
        // if( feeUsd > 0 ) process.exit(1);

        const topicHash: string = event.topics[0];
        if (Events.IGNORED.get(topicHash) === 1) continue;
        // eslint-disable-next-line functional/no-try-statements
        try {
          const decoded = Events.ABI.parseLog(event);
          // console.log( "Event ", blockDt, "@", blockNumber, transactionHash, decoded.signature, JSON.stringify(decoded.args));
          // get member event
          const addresses = Events.addresses(
            decoded.signature,
            decoded.args,
            from,
          );

          // loop 1 ensures all wallets are created and event is recorded for every member
          for (const addr of addresses) {
            const matchMember: boolean =
              addr.toString().replace("0x", "").toLowerCase() === vm;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const wallet = await Batch.ensureExists(
              addr,
              blockDt,
              null,
              matchMember,
            );
            const eventId =
              event.blockNumber.toString(16) +
              "-" +
              logIndex.toString(16) +
              "." +
              Math.random().toString().replace("0.", "");
            if (matchMember) {
              console.log(
                "MEMBER.EVENT",
                blockNumber + "-" + logIndex.toString(16),
                blockDt,
                addr,
                decoded.name,
                decoded.signature,
                JSON.stringify(decoded.args),
              );
            }
            tx.push(
              prisma.memberEvent.create({
                data: {
                  address: Address.asBuffer(addr),
                  blockNumber,
                  chainId: 0,
                  createdAt: blockDt,
                  data: decoded.args,
                  eventName: decoded.name,
                  fee: BigInt(fee.toString()),
                  feeUsd: feeUsd.toString(),
                  gasPrice: BigNumber.from(gasPrice).toNumber(),
                  gasUsed: BigNumber.from(gasUsed).toNumber(),
                  id: eventId,
                  logIndex,
                  txHash,
                  txIndex: transactionIndex,
                },
              }),
            );
          }

          // loop 2 processes event for each member
          for (const addr of addresses) {
            const matchMember: boolean =
              addr.toString().replace("0x", "").toLowerCase() === vm;
            const wallet = await Batch.ensureExists(
              addr,
              blockDt,
              null,
              matchMember,
            );
            if (wallet) {
              await Batch.processEvent(
                wallet,
                blockDt,
                decoded.signature,
                decoded.args,
                matchMember,
              );
            }
          }

          if (decoded.signature === "StartVote(uint256,address,string)") {
            await Batch.ensureExists(from, blockDt, "proposer", matchFrom);
            if (
              await Events.processVote(
                blockInfo,
                event,
                decoded.args,
                config,
                endpoint,
                verbose.votings,
                verbose.member,
                tx,
              )
            ) {
              shouldTerminate = true;
              included = false;
            }
          } else if (
            decoded.signature === "CastVote(uint256,address,bool,uint256)"
          ) {
            await Batch.ensureExists(from, blockDt, "voter", matchFrom);
            await Events.castVote(
              blockInfo,
              event,
              decoded.args,
              config,
              verbose.votings,
              verbose.member,
              tx,
            );
          } else if (decoded.signature === "ExecuteVote(uint256)") {
            await Batch.ensureExists(from, blockDt, "voter", matchFrom);
            await Events.execVote(
              blockInfo,
              event,
              decoded.args,
              config,
              verbose.votings,
              verbose.member,
              tx,
            );
          }

          const votings = Events.votings(decoded.signature, decoded.args);
          const eventId =
            event.blockNumber.toString(16) +
            "-" +
            logIndex.toString(16) +
            "." +
            Math.random().toString().replace("0.", "");
          for (const vId of votings) {
            const voteInternalId =
              vId * 2 + (VotingReader.isPrimary(config, event.address) ? 1 : 0);

            await VoteGas.add(
              voteInternalId,
              txHash.toString("hex"),
              BigNumber.from(gasUsed),
              feeUsd,
            );
            tx.push(
              prisma.votingEvent.create({
                data: {
                  address: Address.asBuffer(from),
                  blockNumber,
                  chainId: 0,
                  createdAt: blockDt,
                  data: decoded.args,
                  eventName: decoded.name,
                  fee: BigInt(fee.toString()),
                  feeUsd: feeUsd.toString(),
                  gasPrice: ethers.BigNumber.from(gasPrice).toNumber(),
                  gasUsed: ethers.BigNumber.from(gasUsed).toNumber(),
                  id: eventId,
                  logIndex,
                  supports: -1,
                  txHash,
                  txIndex: transactionIndex,
                  userShare: new Prisma.Decimal(0),
                  userVotingPower: new Prisma.Decimal(0),
                  votingId: voteInternalId + "",
                },
              }),
            );
          }

          if (
            decoded.signature ===
              "MintedReward(uint256,uint256,uint256,uint256)" &&
            (await Events.processEpoch(
              endpoint,
              pool,
              blockInfo,
              event,
              tx,
              useArchive,
            )) &&
            termination.epoch
          ) {
            shouldTerminate = true;
            included = true;
          }
        } catch (error) {
          console.error(
            "Event @",
            blockNumber,
            transactionHash,
            transactionIndex,
            error,
          );
          throw error;
        }
      }
    }

    const verboseBatch = false; // Batch.hasMember(vm);
    for (const data of Batch.getInserts(verboseBatch)) {
      const matchMember =
        data.address.toString("hex").replace("0x", "").toLowerCase() === vm;
      if (matchMember) {
        console.log(
          "MEMBER.CREATE",
          blockNumber,
          blockDt,
          JSON.stringify(data),
        );
      }
      tx.push(prisma.member.create({ data }));
    }

    for (const data of Batch.getDelegationInserts(verboseBatch)) {
      const matchMember =
        data.from.toString("hex").toLowerCase() === vm ||
        data.to.toString("hex").toLowerCase() === vm;
      if (matchMember) {
        console.log(
          "MEMBER.DELEGATION.CREATE",
          blockNumber,
          blockDt,
          JSON.stringify(data),
        );
      }
      tx.push(prisma.memberDelegation.create({ data }));
    }

    for (const [addr, data] of Batch.getUpdates(verboseBatch)) {
      const matchMember = vm && addr.includes(vm);
      if (matchMember) {
        console.log(
          "MEMBER.UPDATE",
          blockNumber,
          blockDt,
          addr,
          JSON.stringify(data),
        );
      }
      tx.push(
        prisma.member.update({
          where: { address: Address.asBuffer(addr) },
          data,
        }),
      );
    }
    for (const [key, data] of Batch.getDelegationUpdates(verboseBatch)) {
      const from = Address.asBuffer(key);
      if (data.to) {
        const matchMember =
          key === vm || data.to.toString("hex").toLowerCase() === vm;
        if (matchMember) {
          console.log(
            "MEMBER.DELEGATION.UPDATE",
            blockNumber,
            blockDt,
            key,
            JSON.stringify(data),
          );
        }
        tx.push(prisma.memberDelegation.update({ where: { from }, data }));
      }
    }

    for (const [voteId, usage] of VoteGas.totals()) {
      tx.push(
        prisma.voting.updateMany({
          where: { id: voteId + "" },
          data: {
            totalGasUsed: usage.gasUsed.toNumber(),
            totalUsd: usage.feeUsd.toString(),
          },
        }),
      );
    }

    tx.push(
      prisma.syncStatus.updateMany({
        where: { id: 1 },
        data: {
          updatedAt: new Date().toISOString(),
          processed: blockNumber,
        },
      }),
    );
    if (
      !termination.epoch &&
      termination.block &&
      termination.block <= blockNumber
    ) {
      // stop on a certain block
      shouldTerminate = true;
      included = false;
    }

    if (included) {
      await prisma.$transaction(tx);
      if (Date.now() - start > 1000) {
        console.log(
          "..DB Block",
          blockNumber,
          blockDt,
          "took " + elapsed(start),
        );
      }
    }
    return { shouldTerminate, included };
  },

  processState: async (
    endpoint: string,
    verbose: SyncVerbosity,
    terminate: SyncTermination,
    useArchive: boolean,
  ) => {
    let total = 0;
    const webconfig = fetchWebconfig();
    do {
      const blockInfo: BlockFullInfo | null = await Sync.next(verbose.blocks);
      if (blockInfo) {
        const result = await Events.processBlock(
          blockInfo,
          webconfig,
          endpoint,
          verbose,
          terminate,
          useArchive,
        );
        if (result.shouldTerminate) {
          return result.included ? ++total : total;
        }
      } else {
        return total;
      }
      total++;
    } while (total < 100_000);
    return total;
  },

  download: async (endpoint: string, priceReader: IPriceReader) => {
    const webconfig = fetchWebconfig();
    const poolContract = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "api3pool",
    );
    if (!poolContract) {
      console.error("api3 pool contract is not configured");
      return 0;
    }
    const minBlock: number = poolContract.minBlock || 0;
    const batchSize: number = poolContract.batchSize || 1000;
    const addresses: Array<string> =
      webconfig.contracts
        ?.filter((contract) => contract.watch)
        .map((contract: IContract) => contract.address) || [];
    if (addresses.length === 0) {
      console.error("no contracts to watch");
      return 0;
    }
    const lastDownloadedBlock =
      (await Blocks.fetchLastDownloaded()).blockNumber || 0;
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    // get the head block
    const block = await jsonRpc.getBlock("latest");

    console.log(
      "Contracts",
      addresses,
      "Head Block",
      block.number,
      "Last block in DB",
      lastDownloadedBlock,
    );
    const total = 0;
    const batches = Filters.prepare(
      addresses,
      minBlock,
      batchSize,
      lastDownloadedBlock,
      block.number,
    );
    console.log(
      "Expecting",
      batches.length,
      "batches",
      "Batch size",
      batchSize,
    );

    // If the DB transaction fails, this will roll back, so it can be at the start of the tx
    const tx: PrismaPromise<BatchPayload>[] = [
      // Update syncing status
      prisma.syncStatus.updateMany({
        where: { id: 1 },
        data: {
          updatedAt: new Date().toISOString(),
          downloaded: block.number,
        },
      }),
    ];

    for (const cMap of batches) {
      const blockMap = new Map<number, Array<Log>>();
      for (const [_address, filter] of cMap.entries()) {
        console.log(
          "Reading batch",
          filter.fromBlock,
          "..",
          filter.toBlock,
          filter.address,
        );
        const events: Array<Log> = await jsonRpc.getLogs(filter);
        for (const txEvent of events) {
          const arr = blockMap.get(txEvent.blockNumber) || new Array<Log>();
          arr.push(txEvent);
          blockMap.set(txEvent.blockNumber, arr);
        }
      }
      for (const logs of blockMap.values()) {
        const hasIt = await Sync.hasBlock(logs[0].blockHash);
        if (!hasIt) {
          const fullInfo: BlockFullInfo = await BlockLoader.fromLogs(
            jsonRpc,
            logs[0].blockHash,
            logs,
            priceReader,
          );
          // Updates are accumulated in `tx`
          await Sync.saveBlock(fullInfo, tx);
        }
      }
    }

    // Finally, execute pending updates
    await prisma.$transaction(tx);

    return total;
  },
};
