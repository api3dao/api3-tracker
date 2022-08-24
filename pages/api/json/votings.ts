import type { NextApiRequest, NextApiResponse } from "next";
import { IVoting } from "../../../services/types";
import { Votings } from "../../../services/api";
import { stringify } from "superjson";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const list: Array<IVoting> = await Votings.fetchAll();
  res.status(200).json(JSON.parse(stringify(list)).json);
}
