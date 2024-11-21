import { isNumber } from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "superjson";

import { Wallets } from "../../../services/api";

const numericQuery = (input: any, defaultValue: number): number => {
  if (input === undefined) return defaultValue;
  if (isNumber(input)) return input;
  return Number.parseInt(input);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const { q = "" } = req.query;
  const take = numericQuery(req.query.take, 100);
  const skip = numericQuery(req.query.skip, 0);
  const response = await Wallets.fetchList(q + "", { take, skip });
  res.status(200).json(JSON.parse(stringify(response)).json);
}
