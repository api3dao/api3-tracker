import {uniq} from "lodash";
import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "superjson";

import { Wallets, Votings, VotingEvents } from "../../../../services/api";
import { serializable } from "../../../../services/format";
import { type IVoting, type IVotingEvent } from "../../../../services/types";

const uniqueArray = (arr: Array<any>): Array<any> => {
  return uniq(arr.filter((item) => item !== ""));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const id = req.query.id as string || "";
  const results = await Promise.all([
    Votings.fetch(id),
    VotingEvents.fetchList(id),
  ]);
  const voting: IVoting | null = results[0];
  const events: Array<IVotingEvent> = results[1];
  const addresses = uniqueArray(events.map((x: any) => x.address));
  const members = await Wallets.fetchByAddresses(addresses);
  const out = {
      id,
      voting: serializable(voting),
      events: serializable(events),
      members: serializable(members),
  };
  res.status(200).json(JSON.parse(stringify(out)).json);
}

