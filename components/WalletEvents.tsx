import React from "react";
import { IWalletEvent } from "./../services/types";
import { niceDate, toCurrency } from "./../services/format";

export interface IWalletEventsListProps {
  list: Array<IWalletEvent>;
}

export const WalletEventsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">#</th>
      <th className="text-center">Date</th>
      <th className="text-center">Block #</th>
      <th className="text-center">Event</th>
    </tr>
  </thead>
);

export const WalletEventsListTr = (row: IWalletEvent) => (
  <tr>
    <td className="text-center">{row.id}.</td>
    <td className="text-center">{niceDate(row.createdAt)}</td>
    <td className="text-center">{toCurrency(row.blockNumber)} </td>
    <td className="text-left">
      <div className="px-5">
        <strong>Staked </strong>
        <span> amount: </span>
        <strong>1,250,000</strong>
        <span> minted_shares: </span>
        <strong>1,250,000</strong>
        <span> user_unstaked: </span>
        <strong>0</strong>
        <span> user_shares: </span>
        <strong> 1,250,000</strong>
        <span> total_shares: </span>
        <strong>2,580,367</strong>
        <span> total_stake: </span>
        <strong>2,580,367</strong>
      </div>
    </td>
  </tr>
);

export const WalletEventsList = (props: IWalletEventsListProps) => {
  return (
    <div className="max-w-screen-lg mx-auto">
      <table className="table invisible lg:visible">
        <WalletEventsListThead />
        <tbody>
          {props.list.map((row) => (
            <WalletEventsListTr key={row.id} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
