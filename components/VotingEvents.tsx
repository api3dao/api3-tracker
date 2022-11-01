import React from "react";
import { ethers } from "ethers";
import { IVotingEvent } from "./../services/types";
import Link from "next/link";
import { BlockNumber } from "./../components/Ethscan";
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
      <div className="text-xs darken leading-4">
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

export const VotingEventsListTr = (row: IVotingEvent) => {
  let supports = "";
  let votes = "";
  let power = <div></div>;
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
      // power = (<div>{abs}<br />{pct}<br />{total}</div>);
      power = <span>{pct}</span>;
    }
  }
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
        <EventGasTotals
          gasUsed={row.gasUsed}
          gasPrice={row.gasPrice}
          feeUsd={parseFloat(row.feeUsd + "")}
        />
        <EventDetails data={row.data} eventName={row.eventName} />
      </td>
      <td className="text-right text-sm darken">{supports}</td>
      <td className="text-right text-sm">{votes}</td>
      <td className="text-right text-sm darken">{power}</td>
    </tr>
  );
};

export const VotingEventsList = (props: IVotingEventsListProps) => {
  if (!props.list.length) return null;
  return (
    <div>
      <table className="table invisible lg:visible">
        <VotingEventsListThead />
        <tbody>
          {props.list.map((row, index) => (
            <VotingEventsListTr
              key={row.id}
              {...row}
              index={index}
              totalStake={props.totalStake}
            />
          ))}
        </tbody>
      </table>
      <div className="pt-6 font-xl">&nbsp;</div>
    </div>
  );
};
