import React from "react";
import { IVotingEvent } from "./../services/types";
import Link from "next/link";
import { BlockNumber, Address } from "./../components/Ethscan";
import {
  niceDate,
  niceDateTime,
  toHex,
  toCurrency,
} from "./../services/format";

export interface IVotingEventsListProps {
  list: Array<IVotingEvent>;
}

export const VotingEventsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">#</th>
      <th className="text-center">Date</th>
      <th className="text-center">Block Number</th>
      <th className="text-center">Event</th>
      <th className="text-left">User</th>
      <th className="text-right">Cast</th>
      <th className="text-right">Shares</th>
      <th className="text-right">%</th>
    </tr>
  </thead>
);

export const VotingEventsListTr = (row: IVotingEvent) => (
  <tr>
    <td className="text-center">{(row.index || 0) + 1}.</td>
    <td className="text-center text-sm darken">
      {" "}
      {niceDateTime(row.createdAt)}{" "}
    </td>
    <td className="text-center">
      <BlockNumber txId={toHex(row.txHash)} blockNumber={row.blockNumber} />
    </td>
    <td className="text-center">{row.eventName} </td>
    <td className="text-left">
      <Link href={`/wallets/${toHex(row.address)}`} className="text-bold">
        <div>
          {row.ensName
            ? [
                <span key={0} className="font-bold">
                  {row.ensName}
                </span>,
                <br key={1} />,
              ]
            : null}
          <div className="accent">{toHex(row.address)}</div>
          <div className="darken"></div>
        </div>
      </Link>
<pre>{JSON.stringify(row.data, null, 2)}</pre>
    </td>
    <td className="text-right">Supports</td>
    <td className="text-right">{toCurrency(row.userShare)}</td>
    <td className="text-right">{toCurrency(row.userVotingPower)}%</td>
  </tr>
);

export const VotingEventsList = (props: IVotingEventsListProps) => {
  if (!props.list.length) return null;
  return (
    <div>
      <table className="table invisible lg:visible">
        <VotingEventsListThead />
        <tbody>
          {props.list.map((row, index) => (
            <VotingEventsListTr key={row.id} {...row} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
