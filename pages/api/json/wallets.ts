import type { NextApiRequest, NextApiResponse } from "next";
import { Wallets } from "../../../services/api";
import { stringify } from "superjson";

const numericQuery = (input: any, defaultValue: number): number => {
  if (typeof input === 'undefined') return defaultValue;
  if (typeof input === 'number') return input;
  return parseInt(input);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const { q = "" } = req.query;
  const take = numericQuery(req.query.take, 100);
  const skip = numericQuery(req.query.skip, 0);
  const response = await Wallets.fetchList(q + "", { take, skip });
  res.status(200).json(JSON.parse(stringify(response)).json);
}
