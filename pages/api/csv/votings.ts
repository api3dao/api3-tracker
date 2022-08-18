import type { NextApiRequest, NextApiResponse } from "next";
import { IVoting } from "../../../services/types";
import { niceDate, toHex } from "../../../services/format";
import { Votings } from "../../../services/api";
import { stringify } from "csv-stringify/sync";

const NAMES = [
  "ID",
  "TYPE",
  "CREATED",
  "STATUS",
  "NAME",
  "DESCRIPTION",
  "TRANSFER",
  "GAS USED",
  "GAS USD",
  "FOR",
  "AGAINST",
  "STAKED",
  "REQUIRED",
];

const transferString = (src: IVoting): string => {
  if (src.transferStatus) {
    return src.transferStatus; // left for invalid transfer case
  }
  if (!src.transferAddress || !src.transferToken) {
    return "";
  }
  return [
    "transfer",
    src.transferValue,
    src.transferToken,
    "to",
    toHex(src.transferAddress),
  ].join(" ");
};

const toArray = (src: IVoting) => [
  src.id,
  src.vt,
  niceDate(src.createdAt),
  src.status,
  src.name,
  src.description || "",
  transferString(src),
  src.totalGasUsed + "",
  src.totalUsd + "",
  src.totalFor + "",
  src.totalAgainst + "",
  src.totalStaked + "",
  src.totalRequired + "",
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
  const list: Array<IVoting> = await Votings.fetchAll();
  for (let index = 0; index < list.length; index++) {
    out.push(rearrange(columns, toArray(list[index])));
  }
  res.status(200).send(stringify(out));
}

