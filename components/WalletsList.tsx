import React from "react";
import { IWallet } from "./../services/types";
import Link from "next/link";
import {
  toHex,
  niceDate,
  niceDateTime,
  toCurrency,
} from "./../services/format";

export interface IWalletsListProps {
  list: Array<IWallet>;
}

export const WalletsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">#</th>
      <th className="text-center">Joined</th>
      <th className="text-center">Updated</th>
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
    <td className="text-center">{1 + (row.index || 0)}.</td>
    <td className="text-center text-xs max-w-3">{niceDate(row.createdAt)}</td>
    <td className="text-center text-xs darken max-w-3">{niceDateTime(row.updatedAt)}</td>
    <td className="text-left">
      <Link href={`/wallets/${toHex(row.address)}`} className="text-bold">
        {row.ensName ? (
          <div>
            <span className="font-bold">{row.ensName}</span>
            <br />
            <span className="accent" style={{ fontFamily: "monospace", cursor:"pointer" }}>{toHex(row.address)}</span>
          </div>
        ) : (
          <div>
            <span className="accent" style={{ fontFamily: "monospace", cursor:"pointer" }}>{toHex(row.address)}</span>
          </div>
        )}
      </Link>
    </td>
    <td className="text-right">{toCurrency(row.userVotingPower)}</td>
    <td className="text-right">0%</td>
    <td className="text-right">{toCurrency(row.userShare)}</td>
    <td className="text-right">{toCurrency(row.userReward)}</td>
  </tr>
);

export const WalletsList = (props: IWalletsListProps) => {
  return (
    <div className="max-w-screen-lg mx-auto">
      <table className="table invisible lg:visible">
        <WalletsListThead />
        <tbody>
          {props.list.map((row, index) => (
            <WalletsListTr key={index} {...row} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
