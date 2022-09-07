import fs from "fs";
import prisma from "./db";
import { IBlockNumber } from "./../services/types";
import { ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { IContract } from "./types";
import { Block, Log, Provider } from "@ethersproject/abstract-provider";
import { EthereumPrice } from "./../services/price";

interface BlockFullInfo {
  // Block Header information
  block: Block;
  // Price of Ethereum at this point
  price: number;
  // Receipts list
  receipts: Map<string, any>;
  // Logs
  logs: Map<string, Array<Log>>;
}

const elapsed = (since: number): string => {
  const duration = new Date().getTime() - since;
  return `${duration / 1000}s`;
};

export const BlockLoader = {
  fromLogs: async (
    jsonRpc: Provider,
    blockHash: string,
    logsList: Array<Log>
  ): Promise<BlockFullInfo> => {
    const start = new Date().getTime();
    const block = await jsonRpc.getBlock(blockHash);

    // load receipts for each transaction
    const receipts = new Map<string, any>();
    const logs = new Map<string, Array<Log>>();
    for (const log of logsList) {
      const hash = log.transactionHash;
      if (!receipts.has(hash)) {
        const receipt = await jsonRpc.getTransactionReceipt(hash);
        receipts.set(hash, receipt);
      }
      const l = logs.get(log.address) || new Array<Log>();
      l.push(log);
      logs.set(log.address, l);
    }

    const price = await EthereumPrice.at(new Date(block.timestamp * 1000));
    console.log(
      "Block",
      block.number,
      new Date(block.timestamp * 1000),
      logsList.length + "L",
      receipts.size + "R",
      price.toFixed(2) + "USD",
      "took " + elapsed(start)
    );
    return {
      block,
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
  saveBlock: async (b: BlockFullInfo) => {
    const blockHash = Hash.asBuffer(b.block.hash);
    const tx = new Array();
    // 1. save block
    tx.push(
      prisma.cacheBlock.create({
        data: {
          hash: blockHash,
          height: b.block.number,
          createdAt: new Date(b.block.timestamp * 1000).toISOString(),
          price: b.price,
          data: b.block as any,
        },
      })
    );
    // 2. save receipts
    for (const [txHash, receipt] of b.receipts.entries()) {
      tx.push(
        prisma.cacheReceipt.create({
          data: {
            hash: Hash.asBuffer(txHash),
            receipt: receipt,
          },
        })
      );
    }
    // 3. save logs for every contract
    for (const [contract, logs] of b.logs) {
      tx.push(
        prisma.cacheLogs.create({
          data: {
            hash: blockHash,
            contract: Hash.asBuffer(contract),
            logs: logs as any,
          },
        })
      );
    }
    // 4. update syncing status
    tx.push(
      prisma.syncStatus.updateMany({
        where: { id: 1 },
        data: {
          updatedAt: new Date().toISOString(),
          downloaded: b.block.number,
        },
      })
    );

    await prisma.$transaction(tx);
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
  next: async (): Promise<BlockFullInfo | null> => {
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
  prepare: (contract: IContract, last: number, head: number): Array<any> => {
    const filter: any = { address: contract.address };

    if (last) filter.fromBlock = last;
    else if (contract.minBlock) filter.fromBlock = contract.minBlock;
    if (!head || !contract.batchSize) return [filter];

    let bn = filter.fromBlock;
    const filters: Array<any> = [];
    while (bn <= head) {
      const f = { ...filter };
      f.fromBlock = bn + 1;
      f.toBlock = bn + contract.batchSize;

      filters.push(f);
      bn += contract.batchSize;
    }
    return filters;
  },
};

export const BlockTime = {
  cache: new Map<string, number>(),
  get: async (jsonRpc: Provider, blockHash: string): Promise<number> => {
    const fromCache = BlockTime.cache.get(blockHash);
    if (fromCache) return fromCache;
    const blockTime = (await jsonRpc.getBlock(blockHash)).timestamp;
    BlockTime.cache.set(blockHash, blockTime);
    return blockTime;
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

export const Members = {
  ensureExists: async (addr: string, blockDt: Date) => {
    const address = Address.asBuffer(addr);
    const members = await prisma.member.findMany({
      where: { address },
    });
    if (members.length === 0) {
      await prisma.member.create({
        data: {
          address,
          ensName: "",
          ensUpdated: blockDt,
          badges: "",
          userShare: 0,
          userStake: 0,
          userVotingPower: 0,
          userReward: 0,
          userLockedReward: 0,
          userDeposited: 0,
          userWithdrew: 0,
          createdAt: blockDt,
          updatedAt: blockDt,
          tags: "",
        },
      });
    }
    console.log("Created member", address.toString("hex"));
  },
};

export const Events = {
  resetState: async () => {
    await prisma.memberEvent.deleteMany({});
    await prisma.votingEvent.deleteMany({});
    await prisma.member.deleteMany({});
  },
  resetAll: async () => {
    await Events.resetState();
    await Sync.reset();
  },
  ABI: new ethers.utils.Interface(
    fs.readFileSync("./abi/api3pool.json", "utf-8")
  ),
  addresses: (signature: string, args: any): Array<string> => {
    switch (signature) {
      case "SetDaoApps(address,address,address,address)":
        return [];
      case "Deposited(address,uint256,uint256)":
        return [args[0]];
      case "Staked(address,uint256,uint256,uint256,uint256,uint256,uint256)":
        return [args[0]];
      case "Delegated(address,address,uint256,uint256)":
        return [args[0], args[1]];
      case "UpdatedDelegation(address,address,bool,uint256,uint256)":
        return [args[0], args[1]];
      case "Undelegated(address,address,uint256,uint256)":
        return [args[0], args[1]];
      case "Unstaked(address,uint256,uint256,uint256,uint256)":
        return [args[0]];
      case "ScheduledUnstake(address,uint256,uint256,uint256,uint256)":
        return [args[0]];
      case "DepositedVesting(address,uint256,uint256,uint256,uint256,uint256)":
        return [args[0]];
      case "DepositedByTimelockManager":
        return [];
      case "VestedTimeLock(address,uint256,uint256)":
        return [];
      case "Withdrawn(address,uint256,uint256)":
        return args[0];
      case "WithdrawnToPool()":
        return [];
      case "PaidOutClaim()":
        return [];
      case "StartVote()":
        return [];
      case "CastVote()":
        return [];
      case "SetVestingAddresses()":
        return [];
    }
    console.warn("Unknown signature", signature);
    return [];
  },
  handle: async (event: Log, jsonRpc: Provider) => {
    const { blockNumber, transactionHash, transactionIndex, logIndex } = event;
    try {
      const blockTime = await BlockTime.get(jsonRpc, event.blockHash);
      const decoded = Events.ABI.parseLog(event);
      const blockDt = new Date(blockTime * 1000);
      console.log(
        "Event ",
        blockDt,
        "@",
        blockNumber,
        transactionHash,
        decoded.signature,
        JSON.stringify(decoded.args)
      );
      // get member event
      const addresses = Events.addresses(decoded.signature, decoded.args);
      for (const addr of addresses) {
        await Members.ensureExists(addr, blockDt);

        const eventId =
          event.blockNumber.toString(16) +
          "-" +
          transactionIndex.toString(16) +
          "-" +
          logIndex.toString(16) +
          "." +
          addr.slice(-8);
        await prisma.memberEvent.create({
          data: {
            id: eventId,
            createdAt: blockDt,
            address: Address.asBuffer(addr),
            chainId: 0,
            txHash: Buffer.from(transactionHash.replace("0x", ""), "hex"),
            blockNumber,
            txIndex: transactionIndex,
            logIndex: logIndex,
            eventName: decoded.name,
            data: decoded.args,
            // gasPrice?: bigint | number | null
            // gasUsed?: bigint | number | null
            // fee?: bigint | number | null
            // feeUsd?: Decimal | DecimalJsLike | number | string | null
          },
        });
      }
    } catch (e) {
      console.error(
        "Event @",
        blockNumber,
        transactionHash,
        transactionIndex,
        e
      );
    }
  },

  download: async (endpoint: string) => {
    const webconfig = fetchWebconfig();
    const contract = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "api3pool"
    );
    if (!contract) {
      console.error("api3 pool contract is not configured");
      return 0;
    }
    const lastDownloadedBlock =
      (await Blocks.fetchLastDownloaded()).blockNumber || 0;
    const jsonRpc = new ethers.providers.JsonRpcProvider(endpoint);
    // get the head block
    const block = await jsonRpc.getBlock("latest");
    const headBlockNumber = block.number;
    console.log(
      "Contract",
      contract.address,
      "Head Block",
      headBlockNumber,
      "Last block in DB",
      lastDownloadedBlock
    );
    const total = 0;
    const batches = Filters.prepare(
      contract,
      lastDownloadedBlock,
      headBlockNumber
    );
    console.log("Expecting", batches.length, "batches");
    for (const filter of batches) {
      console.log("Handling batch", filter.fromBlock, "..", filter.toBlock);
      const events: Array<Log> = await jsonRpc.getLogs(filter);
      const blockMap = new Map<number, Array<Log>>();
      for (const txEvent of events) {
        const arr = blockMap.get(txEvent.blockNumber) || new Array<Log>();
        arr.push(txEvent);
        blockMap.set(txEvent.blockNumber, arr);
      }
      // blockMap.forEach(async (logs: Array<Log>, _blockNumber: number) => {
      for (const logs of blockMap.values()) {
        const hasIt = await Sync.hasBlock(logs[0].blockHash);
        if (!hasIt) {
          const fullInfo: BlockFullInfo = await BlockLoader.fromLogs(
            jsonRpc,
            logs[0].blockHash,
            logs
          );
          Sync.saveBlock(fullInfo);
        }
      }
    }
    return total;
  },
};