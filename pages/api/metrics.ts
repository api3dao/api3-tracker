// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
  // TODO: treasury balances
  // TODO: DAO supply
  // TODO: APR and pool totals

  res
    .status(200)
    .send(
      ["# HELP up Server is running", "# TYPE up gauge", "up 1"].join("\n")
    );
}
