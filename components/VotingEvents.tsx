import React from "react";
import { IVotingEvent } from "./../services/api3";
import Link from "next/link";
import { toCurrency } from "./../services/format";

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
    <td className="text-center">{row.id}.</td>
    <td className="text-center">
      {row.createdAt.toISOString().replace("T", " ")}
    </td>
    <td className="text-center">{toCurrency(row.blockNumber)} </td>
    <td className="text-center">{row.eventName} </td>
    <td className="text-left">
      <Link href={`wallets/${row.address}`} className="text-bold">
        <div>
          {row.ensName
            ? [
                <span key={0} className="font-bold">
                  {row.ensName}
                </span>,
                <br key={1} />,
              ]
            : null}
          <div className="accent">{row.address}</div>
          <div className="darken">
            Gas Used: 473402, Gas Price: 33 GWei, Est $39.7
          </div>
        </div>
      </Link>
    </td>
    <td className="text-right">Supports</td>
    <td className="text-right">{toCurrency(row.userShare)}</td>
    <td className="text-right">{toCurrency(row.userVotingPower)}%</td>
  </tr>
);

export const VotingEventsList = (props: IVotingEventsListProps) => {
  return (
    <div>
      <table className="table invisible lg:visible">
        <VotingEventsListThead />
        <tbody>
          {props.list.map((row) => (
            <VotingEventsListTr key={row.id} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};