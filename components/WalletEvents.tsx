import React from "react";
import { ethers } from "ethers";
import { IWallet, IWalletEvent } from "./../services/types";
import {
  toHex,
  niceDateTime,
  toCurrency,
  noDecimals,
  withDecimals,
} from "./../services/format";
import { BlockNumber } from "./../components/Ethscan";

export interface IWalletEventsListProps {
  wallet: IWallet;
  list: Array<IWalletEvent>;
  // TODO: map of votings
}

interface IEventDetails {
  wallet: IWallet;
  eventName: string;
  data: any;
  // TODO: map of votings
}

const EventDetails = (props: IEventDetails) => {
   // const thisWallet = props.wallet.address;
  /*
      case "Delegated(address,address,uint256,uint256)":
      case "UpdatedDelegation(address,address,bool,uint256,uint256)": // from, to, delta, shared, total
      case "Undelegated(address,address,uint256,uint256)":

      case "Staked(address,uint256,uint256,uint256,uint256,uint256,uint256)":
      case "Unstaked(address,uint256,uint256,uint256,uint256)":
      case "ScheduledUnstake(address,uint256,uint256,uint256,uint256)":

      case "TransferredAndLocked(address,address,uint256,uint256,uint256)":
  */
  switch (props.eventName) {
    case "DepositedVesting": {
      // user, amount, start, end, userUnstaked, userVesting
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      const tmStart = parseInt(ethers.BigNumber.from(props.data[2]).toString());
      const dtStart = new Date(tmStart * 1000);
      const tmEnd = parseInt(ethers.BigNumber.from(props.data[3]).toString());
      const dtEnd= new Date(tmEnd * 1000);
      const userUnstaked  = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[4]).toString(), 18)
      );
      const userVesting = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[5]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens. {" "}
          Starts{" "}
          <span className="text-color-panel-title">
            {niceDateTime(dtStart.toISOString())}
          </span>{" "}
          Ends{" "}
          <span className="text-color-panel-title">
            {niceDateTime(dtEnd.toISOString())}
          </span>{" "}
          Unstaked{" "}
          <span className="text-color-panel-title">
            {toCurrency(userUnstaked)}
          </span>{" "}
          tokens.{" "}
          Vesting{" "}
          <span className="text-color-panel-title">
            {toCurrency(userVesting)}
          </span>{" "}
          tokens
        </div>
      );
    }
    
    case "VestedTimelock": {
      // user, amount, userVesting
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      const userVesting = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens. User is vesting{" "}
          <span className="text-color-panel-title">
            {toCurrency(userVesting)}
          </span>{" "}
          tokens
        </div>
      );
    }
    case "DepositedByTimelockManager": {
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens
        </div>
      );
    }
    case "Deposited": {
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens
        </div>
      );
    }
    case "Withdrawn": {
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens
        </div>
      );
    }
    case "UpdatedLastProposalTimestamp": {
      const tm = parseInt(ethers.BigNumber.from(props.data[1]).toString());
      const dt = new Date(tm * 1000);
      return <div className="text-xs darken leading-4">{niceDateTime(dt.toISOString())}</div>;
    }
    case "WithdrawnToPool":
      return null;
  }

  if (props.eventName == "StartVote" || props.eventName == "ExecuteVote") {
    const voteId = "#" + ethers.BigNumber.from(props.data[0]).toString();
    return <div className="text-xs darken leading-4">{voteId}</div>;
  } else if (props.eventName == "CastVote") {
    const voteId = "#" + ethers.BigNumber.from(props.data[0]).toString();
    const supports = props.data[2];
    const votes = noDecimals(
      withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
    );
    return (
      <div className="text-xs darken leading-4">
        {supports ? "Supported" : "Voted against"} {voteId} with{" "}
        <span className="text-color-panel-title">{toCurrency(votes)}</span>{" "}
        tokens
      </div>
    );
  } else {
    return (
      <pre className="text-xs darken">
        {JSON.stringify(props.data, null, 2)}
      </pre>
    );
  }
};

export const WalletEventsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">#</th>
      <th className="text-center" style={{ minWidth: "70px" }}>
        Date
      </th>
      <th className="text-center">Block #</th>
      <th className="text-center">Event</th>
      <th className="text-center">Details</th>
    </tr>
  </thead>
);

interface IWalletEventsRowProps {
  row: IWalletEvent;
  wallet: IWallet;
  index: number;
}

export const WalletEventsListTr = (props: IWalletEventsRowProps) => {
  const { row, index, wallet } = props;
  return (
    <tr>
      <td className="text-center">{(index || 0) + 1}.</td>
      <td className="text-center text-sm darken">
        {" "}
        {niceDateTime(row.createdAt)}{" "}
      </td>
      <td className="text-center">
        <BlockNumber blockNumber={row.blockNumber} txId={toHex(row.txHash)} />
      </td>
      <td className="text-center text-xs px-2 font-bold"> {row.eventName} </td>
      <td className="text-left px-5">
        <div className="text-xs pt-1">
          <EventDetails
            eventName={row.eventName}
            data={row.data}
            wallet={wallet}
          />
        </div>
      </td>
    </tr>
  );
};

export const WalletEventsList = (props: IWalletEventsListProps) => {
  return (
    <div className="max-w-screen-lg mx-auto">
      <table className="table invisible lg:visible">
        <WalletEventsListThead />
        <tbody>
          {props.list.map((row: any, index: number) => (
            <WalletEventsListTr
              key={row.id}
              row={row}
              index={index}
              wallet={props.wallet}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
