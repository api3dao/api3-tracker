import fs from "fs";
import prisma from "./db";
import { IBlockNumber } from "./../services/types";
import { ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { IContract } from "./types";
import { Log, Provider } from "@ethersproject/abstract-provider";

export const Blocks = {
  // fetch the last block
  fetchLast: async (): Promise<IBlockNumber> => {
    const list = (
      await prisma.memberEvent.findMany({
        take: 1,
        orderBy: { createdAt: "desc" },
      })
    ).map((x: any) => ({ ...x }));
    return list.length > 0 ? list[0] : {};
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
  cache: new Map<String, number>(),
  get: async (jsonRpc: Provider, blockHash: string): Promise<number> => {
    const fromCache = BlockTime.cache.get(blockHash);
    if (fromCache) return fromCache;
    const blockTime = (await jsonRpc.getBlock(blockHash)).timestamp;
    BlockTime.cache.set(blockHash, blockTime);
    return blockTime;
  },
};

export const Events = {
  reset: async () => {
    await prisma.memberEvent.deleteMany({});
    await prisma.votingEvent.deleteMany({});
  },
  ABI: new ethers.utils.Interface(
    fs.readFileSync("./abi/api3pool.json", "utf-8")
  ),
  handle: async (event: Log, jsonRpc: Provider) => {
    const { blockNumber, transactionHash, transactionIndex } = event;
    try {
      const blockTime = await BlockTime.get(jsonRpc, event.blockHash);
      const decoded = Events.ABI.parseLog(event);
      console.log(
        "Event ",
        new Date(blockTime * 1000),
        "@",
        blockNumber,
        transactionHash,
        decoded.signature,
        decoded.args
      );
      // get member event

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
    const lastEventBlock = (await Blocks.fetchLast()).blockNumber || 0;
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
      lastEventBlock
    );
    const total = 0;
    const batches = Filters.prepare(contract, lastEventBlock, headBlockNumber);
    for (const filter of batches) {
      console.log(filter.fromBlock, "..", filter.toBlock);
      const events: Array<Log> = await jsonRpc.getLogs(filter);
      for (const txEvent of events) {
        await Events.handle(txEvent, jsonRpc);
      }
      process.exit(1);
    }
    console.log(batches.length, "batches");
    return total;
  },
};
