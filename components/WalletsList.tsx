import React from "react";
import { IWallet } from "./../services/api3";
import Link from "next/link";
import { niceDateTime, toCurrency } from "./../services/format";

export interface IWalletsListProps {
  list: Array<IWallet>;
}

export const WalletsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">#</th>
      <th className="text-center">Joined</th>
      <th className="text-center">Update</th>
      <th className="text-left">Wallet</th>
      <th className="text-right">Voting Power</th>
      <th className="text-right">%</th>
      <th className="text-right">Owns</th>
      <th className="text-right">Rewards</th>
    </tr>
  </thead>
);

export const WalletsListTr = (row: IWallet) => (
  <tr>
    <td className="text-center">1.</td>
    <td className="text-center max-w-3">
      {niceDateTime(row.createdAt)}
    </td>
    <td className="text-center max-w-3">
      {niceDateTime(row.updatedAt)}
    </td>
    <td className="text-left">
      <Link href={`/wallets/${row.address}`} className="text-bold">
        <div>
          <span className="font-bold">{row.ensName}</span>
          <br />
          <span className="accent">{row.address}</span>
        </div>
      </Link>
    </td>
    <td className="text-right">{toCurrency(row.userVotingPower)}</td>
    <td className="text-right">12%</td>
    <td className="text-right">{toCurrency(row.userShare)}</td>
    <td className="text-right">{toCurrency(row.userReward)}</td>
  </tr>
);

export const WalletsList = (props: IWalletsListProps) => {
  return (
    <div>
      <table className="table invisible lg:visible">
        <WalletsListThead />
        <tbody>
          {props.list.map((row, index) => (
            <WalletsListTr key={index} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
