import React from "react";
import { IWallet } from "./../services/types";
import Link from "next/link";
import {
  toHex,
  niceDate,
  niceDateTime,
  toPct, noDecimals,
  toCurrency,
} from "./../services/format";
import { MemberBadges } from "./../components/MemberClassification";

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
      <th className="text-right">%</th>
      <th className="text-right">Voting Power</th>
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
          <div className="">
            <div className="leading-1 font-bold">{row.ensName}</div>
            <div className="leading-1 accent" style={{ fontFamily: "monospace", cursor:"pointer" }}>{toHex(row.address)}</div>
          </div>
        ) : (
          <div>
            <span className="accent" style={{ fontFamily: "monospace", cursor:"pointer" }}>{toHex(row.address)}</span>
          </div>
        )}
      </Link>
      <MemberBadges badges={row.badges} />
    </td>
    <td className="text-right">{toPct(row.userVotingPower)}</td>
    <td className="text-right">{noDecimals(toCurrency(row.userShare))}</td>
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
