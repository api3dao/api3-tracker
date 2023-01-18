import React from "react";
import { Prisma } from "@prisma/client";
import { IWallet } from "./../services/types";
import Link from "next/link";
import {
  toHex,
  niceDate,
  niceDateTime,
  toPct4,
  noDecimals,
  toCurrency,
} from "./../services/format";
import { MemberBadges } from "./../components/MemberClassification";

export interface IWalletsListProps {
  list: Array<IWallet>;
  total: any;
}

export const WalletsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">#</th>
      <th className="text-center">Joined</th>
      <th className="text-center">Updated</th>
      <th className="text-left">Wallet</th>
      <th className="text-right">Owns</th>
      <th className="text-right">%</th>
      <th className="text-right">Voting Power</th>
    </tr>
  </thead>
);

interface IWalletsListRow {
  row: IWallet;
  index: number;
  totalVotingPower: Prisma.Decimal;
}

export const WalletsListTr = (props: IWalletsListRow) => {
  const row = props.row;
  const userVotingPower = new Prisma.Decimal(row.userVotingPower)
    .mul(100)
    .div(props.totalVotingPower);
  const cls =
    "text-right text-xs " +
    (row.userVotingPower > new Prisma.Decimal(0.0) ? "" : "darken");
  const skipped = row.userVotingPower < new Prisma.Decimal(0.0001);
  return (
    <tr>
      <td className="text-center">{1 + (props.index || 0)}.</td>
      <td className="text-center text-xs max-w-3">{niceDate(row.createdAt)}</td>
      <td className="text-center text-xs darken max-w-3">
        {niceDateTime(row.updatedAt)}
      </td>
      <td className="text-left">
        <Link
          href={`/wallets/${toHex(row.address)}`}
          className="text-bold"
        >
          {row.ensName ? (
            <div className="">
              <div className="text-color-panel-title leading-1 font-bold">{row.ensName}</div>
              <div
                className="leading-1 accent"
                style={{ fontFamily: "monospace", cursor: "pointer" }}
              >
                {toHex(row.address)}
              </div>
            </div>
          ) : (
            <div>
              <span
                className="accent"
                style={{ fontFamily: "monospace", cursor: "pointer" }}
              >
                {toHex(row.address)}
              </span>
            </div>
          )}
        </Link>
        <MemberBadges badges={row.badges} />
      </td>
      <td className={cls}>
        {row.userShare > new Prisma.Decimal(0.0)
          ? noDecimals(toCurrency(row.userShare))
          : "-"}
      </td>
      <td className={cls}>{skipped ? "" : toPct4(userVotingPower)}</td>
      <td className={cls}>
        {skipped ? "-" : noDecimals(toCurrency(row.userVotingPower))}
      </td>
    </tr>
  );
};

export const WalletsListRow = (props: IWalletsListRow) => {
  const row = props.row;
  const userVotingPower = new Prisma.Decimal(row.userVotingPower)
    .mul(100)
    .div(props.totalVotingPower);

  const cls =
    "flex-1 text-right text-xs " +
    (row.userVotingPower > new Prisma.Decimal(0.0) ? "" : "darken");
  const skipped = row.userVotingPower < new Prisma.Decimal(0.0001);
  return (
    <li className="border-b border-color-grey pt-2 pb-2">
      <div className="r1 flex">
        <div className="text-xs text-left w-8">{(props.index || 0) + 1}.</div>
        <div className="text-xs text-left w-32 darken">
          {" "}
          {niceDateTime(row.createdAt)}{" "}
        </div>
        <div className={cls}>{skipped ? "" : toPct4(userVotingPower)}</div>
      </div>
      {skipped ? null : (
        <div className="text-xs text-right">
          <span className="darken"> Voting Power: </span>
          {noDecimals(toCurrency(row.userVotingPower))}
        </div>
      )}
      {row.userShare > new Prisma.Decimal(0.0) ? (
        <div className="text-xs text-right">
          <span className="darken"> Owns: </span>
          {noDecimals(toCurrency(row.userShare))}
        </div>
      ) : null}
      <Link
        href={`/wallets/${toHex(row.address)}`}
        className="text-bold"
        legacyBehavior
      >
        {row.ensName ? (
          <div className="ml-8 r2-ens">
            <div className="leading-1 font-bold">{row.ensName}</div>
            <div
              className="text-xs leading-1 accent"
              style={{ fontFamily: "monospace", cursor: "pointer" }}
            >
              {toHex(row.address)}
            </div>
          </div>
        ) : (
          <div className="ml-8 r2-no-ens">
            <span
              className="text-xs accent"
              style={{ fontFamily: "monospace", cursor: "pointer" }}
            >
              {toHex(row.address)}
            </span>
          </div>
        )}
      </Link>
      {row.badges ? (
        <div className="ml-8">
          <MemberBadges badges={row.badges} />
        </div>
      ) : null}
    </li>
  );
};

export const WalletsList = (props: IWalletsListProps) => {
  return (
    <div className="mx-auto">
      <div className="lg:hidden mt-5 ml-5 mr-5">
        <ol className="border-t border-color-grey">
          {props.list.map((row, index) => {
            return (
              <WalletsListRow
                key={index}
                totalVotingPower={props.total}
                row={row}
                index={index}
              />
            );
          })}
        </ol>
      </div>
      <div className="max-w-screen-lg mx-auto hidden lg:block">
        <table className="table">
          <WalletsListThead />
          <tbody>
            {props.list.map((row, index) => {
              return (
                <WalletsListTr
                  key={index}
                  totalVotingPower={props.total}
                  row={row}
                  index={index}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
