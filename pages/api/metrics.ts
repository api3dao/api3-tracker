import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "./../../services/db";
import { ethers } from "ethers";
import {
  Votings,
  Wallets,
  Supply,
  ITreasuryType,
  Treasuries,
} from "../../services/api";
import { toHex, serializable } from "../../services/format";
import { ITreasury, IBlockNumber } from "../../services/types";
import superjson from "superjson";

// This function is used for comparison of the chain state sync with cloudflare
const getHeadBlock = async (): Promise<BigInt> => {
  const jsonRpc = new ethers.providers.JsonRpcProvider(
    process.env.API3TRACKER_EXTERNAL_ENDPOINT || "https://cloudflare-eth.com/"
  );
  const result = await ethers.utils.fetchJson(
    jsonRpc.connection,
    ` {"id":"head","method":"eth_blockNumber","params":[],"jsonrpc":"2.0"} `
  );
  return BigInt(result.result);
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const out = ["# HELP up Server is running", "# TYPE up gauge", "up 1", ""];

  // 1. Block numbers: external, max downloaded block, max porcessed block
  const headBlock = await getHeadBlock();
  out.push(
    "# HELP head_block_number: latest block number at cloudflare or other external JSON+RPC provider"
  );
  out.push("# TYPE head_block_number gauge");
  out.push("head_block_number " + headBlock);

  const status = await prisma.syncStatus.findMany({
    where: { id: 1 },
  });
  if (status.length > 0) {
    out.push(
      "# HELP downloaded_block_number: latest downloaded into caches block number "
    );
    out.push("# TYPE downloaded_block_number gauge");
    out.push("downloaded_block_number " + status[0].downloaded);

    out.push("# HELP processed_block_number: latest processed block number");
    out.push("# TYPE processed_block_number gauge");
    out.push("processed_block_number " + status[0].processed);
  }

  // 2. treasuries balances
  const names = await Treasuries.fetchList();
  if (names.length > 0) out.push("");
  for (const ttype of names) {
    const tokens = await Treasuries.fetch(ttype);
    const valueAPI3 =
      tokens
        .filter((x: any) => x.token === "API3")
        .map((x: any) => x.value)[0] || 0;
    const valueUSDC =
      tokens
        .filter((x: any) => x.token === "USDC")
        .map((x: any) => x.value)[0] || 0;
    const valueETH =
      tokens
        .filter((x: any) => x.token === "ETH")
        .map((x: any) => x.value)[0] || 0;
    out.push("# HELP treasury_api3: API3 tokens in the treasury");
    out.push("# TYPE treasury_api3: gauge");
    out.push('treasury_api3{name="' + ttype + '"} ' + valueAPI3);
    out.push("# HELP treasury_usdc: USDC tokens in the treasury");
    out.push("# TYPE treasury_usdc: gauge");
    out.push('treasury_usdc{name="' + ttype + '"} ' + valueUSDC);
    out.push("# HELP treasury_eth: ETH balance in the treasury");
    out.push("# TYPE treasury_eth: gauge");
    out.push('treasury_eth{name="' + ttype + '"} ' + valueETH);
  }

  // 3. supply
  const supply = await Supply.fetch();
  if (supply) {
    out.push("# HELP circulating_supply Circulating Supply");
    out.push("# TYPE circulating_supply gauge");
    out.push("circulating_supply " + supply.circulatingSupply.toString());

    out.push("# HELP total_staked Total Staked Tokens");
    out.push("# TYPE total_staked gauge");
    out.push("total_staked " + supply.totalStaked.toString());

    out.push("# HELP staking_target Staking Target");
    out.push("# TYPE staking_target gauge");
    out.push("staking_target " + supply.stakingTarget.toString());

    out.push("# HELP staking_target_pct Reaching staking target, in percents");
    out.push("# TYPE staking_target_pct gauge");
    out.push(
      "staking_target_pct " +
        supply.totalStaked.mul(100).div(supply.stakingTarget).toString()
    );

    // out.push("total_locked " + supply.totalLocked.toString());
    out.push("# HELP locked number of locked tokens");
    out.push("# TYPE locked gauge");
    out.push(
      'locked{where="governance"} ' + supply.lockedByGovernance.toString()
    );
    out.push('locked{where="vestings"} ' + supply.lockedVestings.toString());
    out.push('locked{where="rewards"} ' + supply.lockedRewards.toString());
    out.push('locked{where="time"} ' + supply.timeLocked.toString());
  }

  // 4. Number of members (per tag)
  out.push("");
  const total = await Wallets.fetchCount("");
  out.push("# TYPE members_total gauge");
  out.push("members_total " + total);
  const vested = await Wallets.fetchCount("vested");
  out.push("# TYPE members_total_vested gauge");
  out.push("members_total_vested " + vested);
  const voters = await Wallets.fetchCount("voter");
  out.push("# TYPE members_total_voters gauge");
  out.push("members_total_voters " + voters);
  const supports = await Wallets.fetchCount("supports");
  out.push("# TYPE members_total_supports gauge");
  out.push("members_total_supports " + supports);
  const withdrawn = await Wallets.fetchCount("withdrawn");
  out.push("# TYPE members_total_withdrawn gauge");
  out.push("members_total_withdrawn " + withdrawn);

  // 5. Number of votes (per status)
  out.push("");
  out.push("# HELP votings number of votings");
  out.push("# TYPE votings gauge");
  const counts = await Votings.fetchCounts();
  for (const v of counts) {
    out.push('votings{status="' + v.status + '"} ' + v.total);
  }

  // 6. Status estimates - of downloaded user state history
  out.push("");
  const blocksWithStatus = (await prisma.memberEvent.groupBy({
      where: { eventName: "Status" },
      by: [ "blockNumber" ],
  })).reduce((map: any, obj: any) => {
      map[obj.blockNumber] = 1;
      return map;
  }, {});

  const blocksWithoutStatusTotal= (await prisma.memberEvent.groupBy({
      where: { eventName: { not: "Status" }},
      by: [ "blockNumber" ],
  })).map((x: any) => (
      1 - ( blocksWithStatus[x.blockNumber] || 0)
  )).reduce((partialSum, a) => (partialSum + a), 0);

  out.push("# HELP blocks_without_shares returns the estimate amount of history to be downloaded");
  out.push("# TYPE blocks_without_shares gauge");
  out.push("blocks_without_status " + blocksWithoutStatusTotal);
  out.push("# HELP blocks_with_status returns the estimate amount of history blocks that were already downloaded");
  out.push("# TYPE blocks_with_status gauge");
  out.push("blocks_with_status "+ Object.keys(blocksWithStatus).length);

  const addressWithStatus = (await prisma.memberEvent.groupBy({
      where: { eventName: "Status" },
      by: [ "address" ],
  })).reduce((map: any, obj: any) => {
      map[obj.address] = 1;
      return map;
  }, {});
  const addressWithRewardsTotal = (await prisma.memberEvent.groupBy({
      where: { eventName: { not: "Status" }},
      by: [ "address" ],
  })).map((x: any) => (
      1 - (addressWithStatus[x.address] || 0)
  )).reduce((partialSum, a) => (partialSum + a), 0);
  out.push("# HELP address_without_status returns the amount of members that have no any shares history checked");
  out.push("# TYPE address_without_status gauge");
  out.push("address_without_status " + addressWithRewardsTotal);
  out.push("# HELP address_with_status returns the estimate amount of addresses that were already downloaded");
  out.push("# TYPE address_with_status gauge");
  out.push("address_with_status " + Object.keys(addressWithStatus).length);

  res.status(200).send(out.join("\n"));
}
