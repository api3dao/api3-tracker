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

const INDEXES = {
  ADDRESS: 0,
  ENS: 1,
  BADGES: 2,
};

const toArray = (src: IWallet) => [
  toHex(src.address),
  src.ensName,
  src.badges,
  src.userShare + '',
  src.userStake + '',
  src.userVotingPower + '',
  src.userReward + '',
  src.userLockedReward + '',
  src.userDeposited + '',
  src.userWithdrew + '',
  niceDate(src.createdAt),
  niceDate(src.updatedAt),
];

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const out = [NAMES];
  const list: Array<IWallet> = await Wallets.fetchList();
  for (let index = 0; index < list.length; index++) {
    out.push(toArray(list[index]));
  }
  res.status(200).send(stringify(out));
}
