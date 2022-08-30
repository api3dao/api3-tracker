import type { NextApiRequest, NextApiResponse } from "next";
import { IWallet } from "../../../services/types";
import { Wallets } from "../../../services/api";
import { stringify } from "superjson";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const { q = "" } = req.query;
  const list: Array<IWallet> = await Wallets.fetchList(q + "");
  res.status(200).json(JSON.parse(stringify(list)).json);
}
