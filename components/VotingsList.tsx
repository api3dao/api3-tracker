import React from "react";
import { Prisma } from "@prisma/client";
import { IVoting } from "./../services/types";
import Link from "next/link";
import {
  noDecimals,
  toCurrency,
  withDecimals,
  niceDate,
  toPct,
} from "./../services/format";
import { Address } from "./Ethscan";

export interface IVotingListProps {
  list: Array<IVoting>;
  showGas: boolean;
}

export const VotingsListThead = () => (
  <thead>
    <tr>
      <th className="c w-6">#</th>
      <th className="c w-24">Start Date</th>
      <th className="c w-24">Type</th>
      <th className="l">Title</th>
      <th className="r pr-2 w-10">Votes</th>
      <th className="c w-10">Status</th>
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
    <div className="text-sm leading-6">
      <span className="darken">Transfer</span>{" "}
      {props.transferValue.toString() != "0" ? (
        <span className="text-color-grey font-bold">
          {toCurrency(props.transferValue.toString())}
        </span>
      ) : null}{" "}
      <span className="darken">{props.transferToken}</span>{" "}
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
  showGas: boolean;
}

interface IVotingGasTotals {
  totalGasUsed?: number;
  totalUsd?: number;
}

const VotingGasTotals = (props: IVotingGasTotals) => {
  if (!props.totalGasUsed || !props.totalUsd) return null;
  return (
    <div className="text-xs text-color-grey leading-6">
      Spent{" "}
      <span className="text-color-panel-title">
        {withDecimals(props.totalGasUsed + "", 7)}
      </span>{" "}
      ETH in fees, Est.{" "}
      <span className="text-color-panel-title">
        ${parseFloat(props.totalUsd + "").toFixed(2)}
      </span>{" "}
    </div>
  );
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
        <Link href={`/votings/${item.id}`} className="text-bold" legacyBehavior>
          {item.name}
        </Link>
        {item.transferValue ? <TransferDetails {...item} /> : null}
        {props.showGas ? <VotingGasTotals {...item} /> : null}
      </td>
      <td className="text-right text-xs pr-2">
        {item.totalFor.toNumber() > 0 ? (
          <div className="accent">
            {toPct(item.totalFor.mul(100).div(item.totalStaked).toFixed(2))}
          </div>
        ) : null}
        {item.totalAgainst.toNumber() > 0 ? (
          <div className="text-color-error">
            {toPct(item.totalAgainst.mul(100).div(item.totalStaked).toFixed(2))}
          </div>
        ) : null}
      </td>
      <td className="text-right">
        <span className="badge"> {item.status}</span>
      </td>
    </tr>
  );
};

export const VotingsListRow = (props: IVotingItem) => {
  const { index, item } = props;
  return (
    <li className="border-b border-color-grey pt-2 pb-2">
      <div className="r1 flex">
        <div className="text-xs text-left w-8">{(index || 0) + 1}.</div>
        <div className="text-xs text-left w-32 darken">
          {" "}
          {niceDate(item.createdAt)}{" "}
        </div>
        <div className="flex-1 text-right">
          <span
            className={
              item.vt.toUpperCase() == "PRIMARY"
                ? "badge badge-primary"
                : "badge badge-secondary"
            }
          >
            {item.vt}
          </span>
        </div>
      </div>
      <div className="r2 text-left">
        <Link
          href={`/votings/${item.id}`}
          className="text-xs text-bold"
          legacyBehavior
        >
          {item.name}
        </Link>
      </div>

      <div className="r3 flex">
        <div className="flex-1">
          {item.totalStaked.toNumber() > 0 ? (
            <div className="text-sm darken">
              Staked:{" "}
              <span className="font-bold text-color-panel-title">
                {noDecimals(toCurrency(item.totalStaked))}{" "}
              </span>
            </div>
          ) : null}

          {item.totalFor.toNumber() > 0 ? (
            <div className="text-sm darken">
              For:{" "}
              <span className="font-bold text-color-panel-title">
                {noDecimals(toCurrency(item.totalFor))}{" "}
              </span>
              {item.totalStaked.toNumber() > 0
                ? toPct(item.totalFor.mul(100).div(item.totalStaked).toFixed(2))
                : null}
            </div>
          ) : null}

          {item.totalAgainst.toNumber() > 0 ? (
            <div className="text-sm darken">
              Against:{" "}
              {item.totalStaked.toNumber() > 0
                ? toPct(
                    item.totalAgainst.mul(100).div(item.totalStaked).toFixed(2)
                  )
                : null}
            </div>
          ) : null}
        </div>
        <div className="text-right">
          <span className="badge"> {item.status}</span>
        </div>
      </div>
      {item.transferValue ? (
        <div className="r4 text-right">
          <TransferDetails {...item} />
        </div>
      ) : null}
      {props.showGas ? (
        <div className="r5 text-right">
          <VotingGasTotals {...item} />
        </div>
      ) : null}
    </li>
  );
};

export const VotingsList = (props: IVotingListProps) => {
  return (
    <div className="mx-auto">
      <div className="lg:hidden mt-5 ml-5 mr-5">
        <ol className="border-t border-color-grey">
          {props.list.map((item, index) => (
            <VotingsListRow
              showGas={props.showGas}
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </ol>
      </div>
      <div className="max-w-screen-lg mx-auto hidden lg:block">
        <table className="table">
          <VotingsListThead />
          <tbody>
            {props.list.map((item, index) => (
              <VotingsListTr
                showGas={props.showGas}
                key={item.id}
                item={item}
                index={index}
              />
            ))}
          </tbody>
        </table>
        <div className="mb-100">&nbsp;</div>
      </div>
    </div>
  );
};
