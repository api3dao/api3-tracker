import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "./../../services/db";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const out = ["# HELP up Server is running", "# TYPE up gauge", "up 1", ""];

  const status = await prisma.syncStatus.findMany({
    where: { id: 1 },
  });
  if (status.length > 0) {
    out.push(
      "# HELP downloaded_block_number: latest downloaded into caches block number ",
    );
    out.push("# TYPE downloaded_block_number gauge");
    out.push("downloaded_block_number " + status[0].downloaded);

    out.push("# HELP processed_block_number: latest processed block number");
    out.push("# TYPE processed_block_number gauge");
    out.push("processed_block_number " + status[0].processed);
  }

  res.status(200).send(out.join("\n"));
}
