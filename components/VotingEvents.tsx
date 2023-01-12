import React from "react";
import { ethers } from "ethers";
import { IWallet, IVotingEvent } from "./../services/types";
import Link from "next/link";
import { BlockNumber } from "./../components/Ethscan";
import { MemberBadges } from "./../components/MemberClassification";
import {
  niceDateTime,
  noDecimals,
  withDecimals,
  toHex,
  toCurrency,
} from "./../services/format";

export interface IVotingEventsListProps {
  list: Array<IVotingEvent>;
  totalStake: number;
  members: Array<IWallet>;
  showGas: boolean;
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

interface IEventGasTotals {
  gasUsed: number | undefined;
  gasPrice: number | undefined;
  feeUsd: number | undefined;
}

interface IEventDetails {
  eventName: string;
  data: any;
}

const EventDetails = (props: IEventDetails) => {
  if (props.eventName == "CastVote") {
    const supports = props.data[2];
    const votes = noDecimals(
      withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
    );
    return (
      <div className="text-xs darken mt-1 leading-4">
        {supports ? "Supported" : "Voted against"} with{" "}
        <span className="text-color-panel-title">{toCurrency(votes)}</span>{" "}
        tokens
      </div>
    );
  } else {
    // return JSON.stringify(props.data);
    return null;
  }
};

const EventGasTotals = (props: IEventGasTotals) => {
  const price = noDecimals(withDecimals("" + (props.gasPrice || 0), 9));
  return (
    <div className="text-xs text-color-grey leading-6">
      Gas Used: <span className="text-color-panel-title">{props.gasUsed}</span>{" "}
      Gas Price: <span className="text-color-panel-title">{price}</span> GWei,{" "}
      Est.{" "}
      <span className="text-color-panel-title">
        ${parseFloat(props.feeUsd + "").toFixed(2)}
      </span>{" "}
    </div>
  );
};

const votePower = (row: IVotingEvent) => {
  let supports = "";
  let votes = "";
  if (row.eventName == "CastVote") {
    const supported = JSON.stringify(row.data[2]) == "true";
    supports = supported ? "Supports" : "Against";
    votes = noDecimals(
      toCurrency(
        withDecimals(ethers.BigNumber.from(row.data[3]).toString(), 18)
      )
    );
    if (row.totalStake) {
      const total = parseInt(noDecimals(row.totalStake.toString()));
      const abs = parseFloat(
        noDecimals(
          withDecimals(ethers.BigNumber.from(row.data[3]).toString(), 18)
        )
      );
      const pct = ((abs * 100) / total).toFixed(2) + "%";
      return [supports, votes, pct];
    }
  }
  return [supports, votes, ""];
};

export const VotingEventsListTr = (row: IVotingEvent) => {
  const [supports, votes, power] = votePower(row);
  return (
    <tr>
      <td className="text-center">{(row.index || 0) + 1}.</td>
      <td className="text-center text-sm darken">
        {" "}
        {niceDateTime(row.createdAt)}{" "}
      </td>
      <td className="text-center">
        <BlockNumber txId={toHex(row.txHash)} blockNumber={row.blockNumber} />
      </td>
      <td className="text-center text-xs font-bold">{row.eventName} </td>
      <td className="text-left text-sm">
        <Link
          href={`/wallets/${toHex(row.address)}`}
          className="text-bold"
          legacyBehavior
        >
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
          </div>
        </Link>
        <MemberBadges badges={row.badges || ""} />
        <EventDetails data={row.data} eventName={row.eventName} />
        {row.showGas ? (
          <EventGasTotals
            gasUsed={row.gasUsed}
            gasPrice={row.gasPrice}
            feeUsd={parseFloat(row.feeUsd + "")}
          />
        ) : null}{" "}
      </td>
      <td className="text-right text-sm darken">{supports}</td>
      <td className="text-right text-sm">{votes}</td>
      <td className="text-right text-sm darken">{power}</td>
    </tr>
  );
};

export const VotingEventsListRow = (row: IVotingEvent) => {
  const [supports, votes, power] = votePower(row);
  return (
    <li className="border-b border-color-grey pt-2 pb-2">
      <div className="r1 flex">
        <div className="text-xs text-left w-8">{(row.index || 0) + 1}.</div>
        <div className="text-xs text-left w-32 darken">
          {" "}
          {niceDateTime(row.createdAt)}{" "}
        </div>
        <div className="text-xs">
          <BlockNumber txId={toHex(row.txHash)} blockNumber={row.blockNumber} />
        </div>
        <div className="flex-1 text-right text-xs font-bold">
          {row.eventName}{" "}
        </div>
      </div>
      <div className="r3 leading-6 text-xs">
        <Link
          href={`/wallets/${toHex(row.address)}`}
          className="text-bold"
          legacyBehavior
        >
          <div>
            {row.ensName
              ? [
                  <span key={0} className="text-sm font-bold">
                    {row.ensName}
                  </span>,
                  <br key={1} />,
                ]
              : null}
            <div className="accent">{toHex(row.address)}</div>
          </div>
        </Link>
      </div>
      <div className="r4">
        <MemberBadges badges={row.badges || ""} />
      </div>
      <div className="text-right">
        <EventDetails data={row.data} eventName={row.eventName} />
      </div>
      {row.showGas ? (
        <div className="text-right">
          <EventGasTotals
            gasUsed={row.gasUsed}
            gasPrice={row.gasPrice}
            feeUsd={parseFloat(row.feeUsd + "")}
          />
        </div>
      ) : null}
    </li>
  );
};

export const VotingEventsList = (props: IVotingEventsListProps) => {
  if (!props.list.length) return null;
  return (
    <div className="mx-auto">
      <div className="lg:hidden mt-5 ml-5 mr-5">
        <ol className="border-t border-color-grey">
          {props.list.map((row, index) => {
            const member = props.members.filter(
              (x: any) => toHex(row.address) == toHex(x.address)
            );
            return (
              <VotingEventsListRow
                key={row.id}
                {...member[0]}
                {...row}
                index={index}
                showGas={props.showGas}
                totalStake={props.totalStake}
              />
            );
          })}
        </ol>
      </div>
      <div className="max-w-screen-lg mx-auto hidden lg:block">
        <table className="table">
          <VotingEventsListThead />
          <tbody>
            {props.list.map((row, index) => {
              const member = props.members.filter(
                (x: any) => toHex(row.address) == toHex(x.address)
              );
              return (
                <VotingEventsListTr
                  key={row.id}
                  {...member[0]}
                  {...row}
                  index={index}
                  showGas={props.showGas}
                  totalStake={props.totalStake}
                />
              );
            })}
          </tbody>
        </table>
        <div className="pt-6 font-xl">&nbsp;</div>
      </div>
    </div>
  );
};
