import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { Supply, ITreasuryType, Treasuries } from "../../services/api";
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
    out.push("# HELP treasury_api3: API3 tokens in the treasury");
    out.push("# TYPE treasury_api3: gauge");
    out.push('treasury_api3{name="' + ttype + '"} ' + valueAPI3);
    out.push("# HELP treasury_usdc: USDC tokens in the treasury");
    out.push("# TYPE treasury_usdc: gauge");
    out.push('treasury_usdc{name="' + ttype + '"} ' + valueUSDC);
  }

  // 3. supply
  const supply = await Supply.fetch();
  if (supply) {
    out.push("# HELP cirulating_supply Circulating Supply");
    out.push("# TYPE cirulating_supply gauge");
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

  // 4. TODO: Number of members (per tag)
  // 5. TODO: Number of votes (per status)
  // 6. TODO: Shares estimates

  res.status(200).send(out.join("\n"));
}
