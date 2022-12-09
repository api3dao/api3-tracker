import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

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
  out.push("# HELP head_block_number: latest block number at cloudflare or other external JSON+RPC provider");
  out.push("# TYPE head_block_number gauge");
  out.push("head_block_number " + headBlock);

  const status = await prisma.syncStatus.findMany({
    where: { id: 1 },
  });
  if (status.length > 0) {
    out.push("# HELP downloaded_block_number: latest downloaded into caches block number ");
    out.push("# TYPE downloaded_block_number gauge");
    out.push("downloaded_block_number " + status[0].downloaded);

    out.push("# HELP processed_block_number: latest processed block number");
    out.push("# TYPE processed_block_number gauge");
    out.push("processed_block_number  " + status[0].processed);
  }

  // 2. TODO: treasuries balances
  // 3. TODO: supply
  // 4. TODO: Number of members (per tag)
  // 5. TODO: Number of votes (per status)
  // 6. TODO: Shares estimates

  res.status(200).send(out.join("\n"));
}
