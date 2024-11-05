import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "superjson";

import { Votings } from "../../../services/api";
import { type IVoting } from "../../../services/types";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const list: Array<IVoting> = await Votings.fetchAll();
  res.status(200).json(JSON.parse(stringify(list)).json);
}
