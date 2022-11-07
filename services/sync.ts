import fs from "fs";
import prisma from "./db";
import { Prisma } from "@prisma/client";
import { IWebConfig, IBlockNumber } from "./../services/types";
import { Wallets } from "./../services/api";
import { noDecimals, withDecimals } from "./../services/format";
import { BigNumber, ethers } from "ethers";
import { fetchWebconfig } from "./webconfig";
import { IContract } from "./types";
import { Filter, Block, Log, Provider } from "@ethersproject/abstract-provider";
import { EthereumPrice } from "./../services/price";
import { VotingReader } from "./../services/voting";
import { VoteGas } from "./../services/gas";
import { Batch } from "./../services/members";

const rewardsPct = (newApr: number): number => {
  const epochLength = 604800.0;
  const week = epochLength / 3600.0 / 24.0;
  const aprCoeff = (52.0 * week) / 365.0;
  return (newApr * 100 * aprCoeff) / 52.0;
};

interface SyncVerbosity {
  blocks: boolean;
  epochs: boolean;
  votings: boolean;
  member: string;
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
  const duration = new Date().getTime() - since;
  return `${duration / 1000}s`;
};

export const BlockLoader = {
  fromDatabase: async (
    blockRecord: any,
    verboseBlock: boolean
  ): Promise<BlockFullInfo> => {
    const start = new Date().getTime();
    const price = parseFloat(blockRecord.price.toString());
    const block: Block = blockRecord.data as any;

    const foundLogs = await prisma.cacheLogs.findMany({
      where: { hash: blockRecord.hash },
    });
    if (foundLogs.length == 0) throw "no logs saved for the block";
    const logsList = new Array<Log>();
    for (const found of foundLogs) {
      const logs = found.logs as any;
      for (const l of logs) logsList.push(l);
    }
    logsList.sort((a, b) => {
      const diff1 = a.transactionIndex - b.transactionIndex;
      if (diff1 != 0) return diff1;
      return a.logIndex - b.logIndex;
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
        "read in " + elapsed(start)
      );
    }
    return { block, price, txs, receipts, logs };
  },

  fromLogs: async (
    jsonRpc: Provider,
    blockHash: string,
    logsList: Array<Log>
  ): Promise<BlockFullInfo> => {
    const start = new Date().getTime();

    const foundBlock = await prisma.cacheBlock.findMany({
      where: { hash: Hash.asBuffer(blockHash) },
    });
    const block =
      foundBlock.length > 0
        ? (foundBlock[0].data as any as Block)
        : await jsonRpc.getBlock(blockHash);
    const price =
      foundBlock.length > 0
        ? parseFloat(foundBlock[0].price.toString())
        : await EthereumPrice.at(new Date(block.timestamp * 1000));

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
      "took " + elapsed(start)
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
  saveBlock: async (b: BlockFullInfo) => {
    const blockHash = Hash.asBuffer(b.block.hash);
    const tx = new Array();
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
      })
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
        })
      );
    }
    // 3. save receipts
    for (const [txHash, receipt] of b.receipts.entries()) {
      tx.push(
        prisma.cacheReceipt.createMany({
          data: [
            {
              hash: Hash.asBuffer(txHash),
              receipt: receipt,
            },
          ],
          skipDuplicates: true,
        })
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
        })
      );
    }
    // 5. update syncing status
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
    if (blocks.length) {
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
    head: number
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
  resetAll: async () => {
    await Events.resetState();
    await Sync.reset();
  },
  ABI: new ethers.utils.Interface(
    [].concat(
      JSON.parse(fs.readFileSync("./abi/api3pool.json", "utf-8")),
      JSON.parse(fs.readFileSync("./abi/api3timelock.json", "utf-8")),
      JSON.parse(fs.readFileSync("./abi/api3voting.json", "utf-8"))
    )
  ),
  ConvenienceABI: new ethers.utils.Interface(
    fs.readFileSync("./abi/api3convenience.json", "utf-8")
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
      case "StartVote(uint256,address,string)":
        return [args[0]];
      case "CastVote(uint256,address,bool,uint256)":
        return [args[0]];
      case "ExecuteVote(uint256)":
        return [args[0]];
    }
    return [];
  },

  addresses: (signature: string, args: any, sender: string): Array<string> => {
    switch (signature) {
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
      case "DepositedByTimelockManager(address,uint256,uint256)":
        return [args[0]];
      case "UpdatedLastProposalTimestamp(address,uint256,address)":
        return [args[0], args[2]];
      case "VestedTimeLock(address,uint256,uint256)":
      case "VestedTimelock(address,uint256,uint256)":
        return [args[0]];
      case "Withdrawn(address,uint256)":
        return [args[0]];
      case "Withdrawn(address,uint256,uint256)":
        return [args[0]];
      case "WithdrawnToPool(address,address,address)":
        return [args[0], args[1], args[2]];
      case "OwnershipTransferred(address,address)":
        return [args[0], args[1]];
      case "TransferredAndLocked(address,address,uint256,uint256,uint256)":
        return [args[0], args[1]];
      case "StartVote(uint256,address,string)":
        return [args[1]];
      case "CastVote(uint256,address,bool,uint256)":
        return [args[1]];
      case "ExecuteVote(uint256)":
        return [sender];
      // the actions below are not related to members
      case "SetVestingAddresses()":
      case "SetDaoApps(address,address,address,address)":
      case "Api3PoolUpdated(address)":
      case "MintedReward(uint256,uint256,uint256,uint256)":
        return [];
    }
    console.warn("Unknown signature", signature);
    return [];
  },

  processEpoch: async (
    blockInfo: BlockFullInfo,
    event: Log,
    tx: any
  ): Promise<boolean> => {
    const { transactionHash } = event;
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
    const currentEpoch = await prisma.epoch.findMany({
      where: { isCurrent: 1 },
    });

    // todo: members distribution: save snapshots
    const oldApr = currentEpoch.length > 0 ? currentEpoch[0].apr : 38.75;
    const newAprPct = parseFloat(
      new Prisma.Decimal(withDecimals(newApr.toString(), 18)).toString()
    );

    if (currentEpoch.length == 0) {
      const prevDt = new Date(blockInfo.block.timestamp * 1000);
      prevDt.setDate(prevDt.getDate() - 7);
      const prevReleaseDt = new Date(blockInfo.block.timestamp * 1000);
      prevReleaseDt.setFullYear(prevReleaseDt.getFullYear() + 1);
      prevReleaseDt.setDate(prevReleaseDt.getDate() - 7);
      // for the very first epoch
      tx.push(
        prisma.epoch.create({
          data: {
            epoch: parseInt(epochIndex.toString()) - 1,
            blockNumber: 0,
            chainId: 0,
            txHash,
            apr: oldApr,
            rewardsPct: rewardsPct(parseFloat(oldApr + "")),
            members: 0,
            totalStake: 0,
            totalShares: 0,
            mintedShares: 0,
            releaseDate: prevReleaseDt,
            createdAt: prevDt,
            isCurrent: 1,
            stakedRewards: 0,
          },
        })
      );
    } else {
      tx.push(
        prisma.epoch.updateMany({
          where: {
            blockNumber: { lt: blockNumber },
            isCurrent: 1,
          },
          data: {
            isCurrent: 0,
          },
        })
      );
    }
    tx.push(
      prisma.epoch.create({
        data: {
          epoch: parseInt(epochIndex.toString()),
          blockNumber,
          chainId: 0,
          txHash,
          apr: new Prisma.Decimal(withDecimals(newApr.toString(), 16)),
          rewardsPct: rewardsPct(newAprPct),
          members: totalMembers,
          totalStake: new Prisma.Decimal(
            noDecimals(withDecimals(total.toString(), 18))
          ),
          totalShares: 0,
          mintedShares: new Prisma.Decimal(
            noDecimals(withDecimals(minted.toString(), 18))
          ),
          releaseDate: releaseDt,
          createdAt: blockDt,
          isCurrent: 1,
          stakedRewards: 0,
        },
      })
    );

    const expireDt = new Date(blockInfo.block.timestamp * 1000 - 12096e5); // minus 2 weeks
    tx.push(
      prisma.voting.updateMany({
        where: { status: "pending", createdAt: { lt: expireDt.toISOString() } },
        data: { status: "rejected" },
      })
    );
    return true;
  },

  processVote: async (
    blockInfo: BlockFullInfo,
    event: Log,
    args: any,
    config: IWebConfig,
    endpoint: string,
    verbose: boolean,
    tx: any
  ): Promise<boolean> => {
    const { transactionHash } = event;
    const { voteId, metadata } = args;
    // const blockNumber = blockInfo.block.number;
    const blockDt = new Date(blockInfo.block.timestamp * 1000);
    const isPrimary = VotingReader.isPrimary(config, event.address);
    const voteInternalId = voteId * 2 + (isPrimary ? 1 : 0);

    const convenience = config.contracts?.find(
      (p: any) => p.name.toLowerCase() === "convenience"
    );
    if (!convenience) {
      throw "api3 convenience contract is not configured";
    }
    const txSender: string = blockInfo.receipts.get(transactionHash).from;

    let scriptData = {
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
        jsonRpc
      );
      const result = await conv.getStaticVoteData(isPrimary ? 0 : 1, txSender, [
        voteId.toString(),
      ]);
      const { script, votingPower, supportRequired } = result;
      scriptData = VotingReader.parseScript(script[0]);
      totalStaked = new Prisma.Decimal(
        withDecimals(votingPower.toString(), 18)
      );
      if (scriptData.address) {
        const addr = "0x" + Buffer.from(scriptData.address);
        await Batch.ensureExists(addr, blockDt, "grant");
      }

      // multiply totalStaked by supportRequired. can round up wildly
      const pctRequired = isPrimary ? 0.5 : 0.15;
      const absRequired =
        parseFloat(noDecimals(withDecimals(votingPower.toString(), 18))) *
        pctRequired;
      totalRequired = new Prisma.Decimal(absRequired);
      if (script.scriptType == "invalid") status = "invalid";
    }

    const meta = VotingReader.parseMetadata(metadata) || {
      title: "",
      description: "",
      targetSignature: "",
    };
    // console.log( blockDt, voteInternalId, isPrimary ? "PRIMARY" : "SECONDARY", "META.TITLE", meta.title);
    if (meta.targetSignature.indexOf(" ") > -1) {
      // Typical error in the signature is putting space
      status = "invalid";
    }
    tx.push(
      prisma.voting.create({
        data: {
          id: voteInternalId + "",
          vt: isPrimary ? "PRIMARY" : "SECONDARY",
          createdAt: blockDt.toISOString(),
          name: meta.title, // we also have
          status,
          transferValue: scriptData.amount,
          transferToken: scriptData.token,
          transferAddress: scriptData.address,
          totalGasUsed: BigInt(0),
          totalUsd: new Prisma.Decimal("0.0"),
          totalFor: new Prisma.Decimal("0.0"),
          totalAgainst: new Prisma.Decimal("0.0"),
          totalStaked,
          totalRequired,
        },
      })
    );
    return false;
  },

  castVote: async (
    blockInfo: BlockFullInfo,
    event: Log,
    args: any,
    config: IWebConfig,
    tx: any
  ) => {
    const { voteId, supports, stake } = args;
    const isPrimary = VotingReader.isPrimary(config, event.address);
    const voteInternalId = voteId * 2 + (isPrimary ? 1 : 0);
    const supported: boolean = supports === "true" || supports === true;

    let totalFor = new Prisma.Decimal(
      supported ? withDecimals(stake.toString(), 18) : 0
    );
    let totalAgainst = new Prisma.Decimal(
      !supported ? withDecimals(stake.toString(), 18) : 0
    );
    const foundVote = await prisma.voting.findMany({
      where: { id: voteInternalId + "" },
    });
    if (foundVote.length > 0) {
      if (supported) totalFor = totalFor.add(foundVote[0].totalFor);
      else totalAgainst = totalAgainst.add(foundVote[0].totalAgainst);
    }
    console.log(
      voteInternalId,
      "SUPPORTED",
      supported,
      "FOR",
      totalFor,
      "AGAINST",
      totalAgainst
    );
    tx.push(
      prisma.voting.updateMany({
        where: { id: voteInternalId + "" },
        data: { totalFor, totalAgainst },
      })
    );
  },

  execVote: async (
    blockInfo: BlockFullInfo,
    event: Log,
    args: any,
    config: IWebConfig,
    tx: any
  ) => {
    const { voteId } = args;
    const isPrimary = VotingReader.isPrimary(config, event.address);
    const voteInternalId = voteId * 2 + (isPrimary ? 1 : 0);
    // const receipt = blockInfo.receipts.get(event.transactionHash);
    tx.push(
      prisma.voting.updateMany({
        where: {
          id: voteInternalId + "",
        },
        data: {
          status: "executed",
          // TODO: gas used
        },
      })
    );
  },

  processBlock: async (
    blockInfo: BlockFullInfo,
    config: IWebConfig,
    endpoint: string,
    verbose: SyncVerbosity
  ): Promise<boolean> => {
    VoteGas.reset(); // gas accumulator for the block
    Batch.reset();

    const blockNumber = blockInfo.block.number;
    const blockDt = new Date(blockInfo.block.timestamp * 1000);
    const tx = new Array();
    let terminate: boolean = false;
    const vm: string = verbose.member.replace("0x", "").toLowerCase();
    for (const [_contractAddress, logs] of blockInfo.logs.entries()) {
      for (const event of logs) {
        const { transactionHash, transactionIndex, logIndex } = event;
        const txHash = Buffer.from(transactionHash.replace("0x", ""), "hex");
        const { from, gasUsed } = blockInfo.receipts.get(transactionHash);
        const { gasPrice } = blockInfo.txs.get(transactionHash);
        const fee = BigNumber.from(gasUsed).mul(BigNumber.from(gasPrice));
        const priceDec = new Prisma.Decimal(blockInfo.price).mul(
          new Prisma.Decimal(withDecimals(fee.toString(), 18))
        );
        const feeUsd = parseFloat(withDecimals(priceDec.toString(), 18));

        // console.log( txHash.toString("hex"), "gasUsed", BigNumber.from(gasUsed).toString(), "gasPrice", BigNumber.from(gasPrice).toString(), "ethPrice", new Prisma.Decimal(blockInfo.price), "fee", withDecimals(fee.toString(), 18), "feeUsd", feeUsd);
        // if( feeUsd > 0 ) process.exit(1);

        const topicHash: string = event.topics[0];
        if (Events.IGNORED.get(topicHash) === 1) continue;
        try {
          const decoded = Events.ABI.parseLog(event);
          // console.log( "Event ", blockDt, "@", blockNumber, transactionHash, decoded.signature, JSON.stringify(decoded.args));
          // get member event
          const addresses = Events.addresses(
            decoded.signature,
            decoded.args,
            from
          );
          for (const addr of addresses) {
            const wallet = await Batch.ensureExists(addr, blockDt, null);
            const eventId =
              event.blockNumber.toString(16) +
              "-" +
              logIndex.toString(16) +
              "." +
              Math.random().toString().replace("0.", "");
            try {
              const matchMember = addr.replace("0x", "").toLowerCase() == vm;
              if (matchMember) {
                console.log(
                  "MEMBER EVENT",
                  blockNumber,
                  blockDt,
                  decoded.name,
                  decoded.signature,
                  JSON.stringify(decoded.args)
                );
              }
              tx.push(
                prisma.memberEvent.create({
                  data: {
                    id: eventId,
                    createdAt: blockDt,
                    address: Address.asBuffer(addr),
                    chainId: 0,
                    txHash,
                    blockNumber,
                    txIndex: transactionIndex,
                    logIndex: logIndex,
                    eventName: decoded.name,
                    data: decoded.args,
                    gasPrice: BigNumber.from(gasPrice).toNumber(),
                    gasUsed: BigNumber.from(gasUsed).toNumber(),
                    fee: BigInt(fee.toString()),
                    feeUsd: feeUsd.toString(),
                  },
                })
              );
              if (wallet) {
                Batch.processEvent(
                  wallet,
                  blockDt,
                  decoded.signature,
                  decoded.args
                );
              }
            } catch (e) {
              console.error(
                "Event @",
                blockNumber,
                transactionHash,
                "txIndex",
                transactionIndex,
                "logIndex",
                logIndex,
                "address",
                addr,
                e
              );
            }
          }
          if (decoded.signature == "StartVote(uint256,address,string)") {
            await Batch.ensureExists(from, blockDt, "voter");
            if (
              await Events.processVote(
                blockInfo,
                event,
                decoded.args,
                config,
                endpoint,
                verbose.votings,
                tx
              )
            )
              terminate = true;
          } else if (
            decoded.signature == "CastVote(uint256,address,bool,uint256)"
          ) {
            await Batch.ensureExists(from, blockDt, "voter");
            await Events.castVote(blockInfo, event, decoded.args, config, tx);
          } else if (decoded.signature == "ExecuteVote(uint256)") {
            await Batch.ensureExists(from, blockDt, "voter");
            await Events.execVote(blockInfo, event, decoded.args, config, tx);
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
              feeUsd
            );
            tx.push(
              prisma.votingEvent.create({
                data: {
                  id: eventId,
                  createdAt: blockDt,
                  chainId: 0,
                  txHash,
                  blockNumber,
                  txIndex: transactionIndex,
                  logIndex: logIndex,
                  eventName: decoded.name,
                  data: decoded.args,
                  gasPrice: BigNumber.from(gasPrice).toNumber(),
                  gasUsed: BigNumber.from(gasUsed).toNumber(),
                  fee: BigInt(fee.toString()),
                  feeUsd: feeUsd.toString(),
                  address: Address.asBuffer(from),
                  supports: -1,
                  userShare: new Prisma.Decimal(0.0),
                  userVotingPower: new Prisma.Decimal(0.0),
                  votingId: voteInternalId + "",
                },
              })
            );
          }

          if (
            decoded.signature == "MintedReward(uint256,uint256,uint256,uint256)"
          ) {
            if (await Events.processEpoch(blockInfo, event, tx))
              terminate = true;
          }
        } catch (e) {
          console.error(
            "Event @",
            blockNumber,
            transactionHash,
            transactionIndex,
            e
          );
          throw e;
        }
      }
    }

    for (const data of Batch.getInserts()) {
      const matchMember = data.address.toString("hex").toLowerCase() == vm;
      if (matchMember) {
        console.log(
          "MEMBER CREATE",
          blockNumber,
          blockDt,
          JSON.stringify(data)
        );
      }
      tx.push(prisma.member.create({ data }));
    }
    for (const [addr, data] of Batch.getUpdates()) {
      const matchMember = addr.replace("0x", "").toLowerCase() == vm;
      if (matchMember) {
        console.log(
          "MEMBER UPDATE",
          blockNumber,
          blockDt,
          addr,
          JSON.stringify(data)
        );
      }
      tx.push(
        prisma.member.update({
          where: { address: Address.asBuffer(addr) },
          data,
        })
      );
    }

    for (const [voteId, usage] of VoteGas.totals()) {
      tx.push(
        prisma.voting.updateMany({
          where: { id: voteId + "" },
          data: {
            totalGasUsed: usage.gasUsed.toNumber(),
            totalUsd: usage.feeUsd.toString(),
          },
        })
      );
    }

    tx.push(
      prisma.syncStatus.updateMany({
        where: { id: 1 },
        data: {
          updatedAt: new Date().toISOString(),
          processed: blockNumber,
        },
      })
    );
    await prisma.$transaction(tx);
    return terminate;
  },

  processState: async (
    endpoint: string,
    stopOnEpoch: boolean,
    verbose: SyncVerbosity
  ) => {
    let total = 0;
    const webconfig = fetchWebconfig();
    do {
      const blockInfo: BlockFullInfo | null = await Sync.next(verbose.blocks);
      if (blockInfo) {
        const terminate = await Events.processBlock(
          blockInfo,
          webconfig,
          endpoint,
          verbose
        );
        if (terminate && stopOnEpoch) return ++total;
      } else {
        return total;
      }
      total++;
    } while (total < 100000);
    return total;
  },

  download: async (endpoint: string) => {
    const webconfig = fetchWebconfig();
    const poolContract = webconfig.contracts?.find(
      ({ name }) => name.toLowerCase() === "api3pool"
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
    const headBlockNumber = block.number;
    console.log(
      "Contracts",
      addresses,
      "Head Block",
      headBlockNumber,
      "Last block in DB",
      lastDownloadedBlock
    );
    const total = 0;
    const batches = Filters.prepare(
      addresses,
      minBlock,
      batchSize,
      lastDownloadedBlock,
      headBlockNumber
    );
    console.log(
      "Expecting",
      batches.length,
      "batches",
      "Batch size",
      batchSize
    );
    for (const cMap of batches) {
      const blockMap = new Map<number, Array<Log>>();
      for (const [_address, filter] of cMap.entries()) {
        console.log(
          "Reading batch",
          filter.fromBlock,
          "..",
          filter.toBlock,
          filter.address
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
            logs
          );
          Sync.saveBlock(fullInfo);
        }
      }
    }
    return total;
  },
};
