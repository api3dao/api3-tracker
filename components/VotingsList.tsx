import React from "react";
import { Prisma } from "@prisma/client";
import { IVoting } from "./../services/types";
import Link from "next/link";
import { withDecimals, niceDate, toPct } from "./../services/format";
import { Address } from "./Ethscan";

export interface IVotingListProps {
  list: Array<IVoting>;
}

export const VotingsListThead = () => (
  <thead>
    <tr>
      <th className="c">#</th>
      <th className="c">Start Date</th>
      <th className="c">Type</th>
      <th className="l">Title</th>
      <th className="r">For</th>
      <th className="r">Against</th>
      <th className="r">Executed</th>
    </tr>
  </thead>
);

interface ITransferProps {
  transferValue?: string | number | Prisma.Decimal | undefined;
  transferToken?: string | undefined;
  transferAddress?: string | Buffer;
}

export const TransferDetails = (props: ITransferProps) => {
  if (!props.transferToken || !props.transferValue) return null;
  return (
    <div className="text-sm">
      <span className="darken">Transfer</span>{" "}
      <span className="text-color-grey font-bold">{props.transferToken}</span>{" "}
      <span className="darken">to</span>{" "}
      <Address
        inline={true}
        className="font-bold text-color-grey"
        address={props.transferAddress}
      />
    </div>
  );
};

interface IVotingItem {
  index: number;
  item: IVoting;
}

interface IVotingGasTotals {
  totalGasUsed: number;
  totalUsd: number;
}

const VotingGasTotals = (props: IVotingGasTotals) => {
  return (<div className="text-xs text-color-grey">
    Spent{" "}
    <span className="text-color-panel-title">{withDecimals(props.totalGasUsed + '', 7)}</span>{" "}
    ETH in fees, Est.{" "}
    <span className="text-color-panel-title">${parseFloat(props.totalUsd + '').toFixed(2)}</span>{" "}
  </div>);
};

export const VotingsListTr = (props: IVotingItem) => {
  const { index, item } = props;
  return (
    <tr>
      <td className="text-center">{1 + index}.</td>
      <td className="text-center text-sm darken">{niceDate(item.createdAt)}</td>
      <td className="text-center">
        <span
          className={
            item.vt.toUpperCase() == "PRIMARY"
              ? "badge badge-primary"
              : "badge badge-secondary"
          }
        >
          {item.vt}
        </span>
      </td>
      <td className="text-left">
        <Link href={`/votings/${item.id}`} className="text-bold">
          {item.name}
        </Link>
        {item.transferValue ? <TransferDetails {...item} /> : null}
        <VotingGasTotals {...item} />
        {/*<div>{JSON.stringify(item, null, 2)}</div>*/}
      </td>
      <td className="text-right accent">
        {item.totalFor.toNumber() > 0 ? (
          <span>
            {toPct(item.totalFor.mul(100).div(item.totalStaked).round())}
          </span>
        ) : null}
      </td>
      <td className="text-right danger">
        {item.totalAgainst.toNumber() > 0 ? (
          <span>
            {toPct(item.totalAgainst.mul(100).div(item.totalStaked).round())}
          </span>
        ) : null}
      </td>
      <td className="text-right">
        <span className="badge"> {item.status}</span>
      </td>
    </tr>
  );
};

export const VotingsList = (props: IVotingListProps) => {
  return (
    <div>
      <div className="max-w-screen-lg mx-auto hidden lg:block">
        <table className="table invisible lg:visible">
          <VotingsListThead />
          <tbody>
            {props.list.map((item, index) => (
              <VotingsListTr key={item.id} item={item} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
