import { stringify } from "csv-stringify/sync";
import type { NextApiRequest, NextApiResponse } from "next";

import { Wallets } from "../../../services/api";
import { niceDate, toHex } from "../../../services/format";
import { type IWallet } from "../../../services/types";

const numericQuery = (input: any, defaultValue: number): number => {
  if (input === undefined) return defaultValue;
  return input as number;
};

const NAMES = [
  "ADDRESS",
  "ENS",
  "BADGES",
  "SHARE",
  "STAKE",
  "VOTING POWER",
  "REWARDS",
  "LOCKED REWARD",
  "DEPOSITED",
  "WITHDRAWN",
  "CREATED",
  "UPDATED",
];

const toArray = (src: IWallet) => [
  toHex(src.address),
  src.ensName,
  src.badges,
  src.userShare + "",
  src.userStake + "",
  src.userVotingPower + "",
  src.userReward + "",
  src.userLockedReward + "",
  src.userDeposited + "",
  src.userWithdrew + "",
  niceDate(src.createdAt),
  niceDate(src.updatedAt),
];

const rearrange = (
  columns: Array<number>,
  full: Array<string>,
): Array<string> => {
  if (columns.length === 0) return full;
  return columns.map((ci: number) => full[ci]);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  const columns = [];
  if (req.query.columns) {
    const cols = (req.query.columns as string).split(",");
    for (const col of cols) {
      const found = NAMES.indexOf(col.toUpperCase());
      if (found === -1) {
        res.status(400).send("ERROR: invalid column " + col);
        return;
      }
      columns.push(found);
    }
  }

  const out = [rearrange(columns, NAMES)];
  const q: string = (req.query.q as string) || "";
  const take = numericQuery(req.query.take, 100);
  const skip = numericQuery(req.query.skip, 0);

  const response = await Wallets.fetchList(q, { take, skip });
  for (let index = 0; index < response.list.length; index++) {
    out.push(rearrange(columns, toArray(response.list[index])));
  }
  if (req.query.filename) {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.query.filename}.csv`,
    );
  }
  res.status(200).send(stringify(out));
}
