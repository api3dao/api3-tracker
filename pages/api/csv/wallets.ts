import type { NextApiRequest, NextApiResponse } from "next";
import { IWallet } from "../../../services/types";
import { niceDate, toHex } from "../../../services/format";
import { Wallets } from "../../../services/api";
import { stringify } from "csv-stringify/sync";

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

const rearrange = (columns: Array<number>, full: Array<string>): Array<string> => {
   if (columns.length === 0) return full;
   return columns.map((ci: number) => (full[ci]));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const columns = [];
  if (req.query.columns) {
    let cols = (req.query.columns as string).split(",");
    for (let ci = 0; ci < cols.length; ci++) {
      let found = NAMES.indexOf(cols[ci].toUpperCase());
      if (found === -1) {
        res.status(400).send("ERROR: invalid column " + cols[ci]);
        return;
      }
      columns.push(found);
    }
  }

  const out = [rearrange(columns, NAMES)];
  const list: Array<IWallet> = await Wallets.fetchList();
  for (let index = 0; index < list.length; index++) {
    out.push(rearrange(columns, toArray(list[index])))
  }
  res.status(200).send(stringify(out));
}
