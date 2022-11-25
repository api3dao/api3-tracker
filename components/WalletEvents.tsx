import React from "react";
import Link from "next/link";
import { ethers } from "ethers";
import {
  IWallet,
  IVoting,
  IWebConfig,
  IWalletEvent,
} from "./../services/types";
import {
  toHex,
  niceDate,
  niceDateTime,
  toCurrency,
  noDecimals,
  withDecimals,
} from "./../services/format";
import { Address, InternalAddress, BlockNumber } from "./../components/Ethscan";

export interface IWalletEventsListProps {
  wallet: IWallet;
  list: Array<IWalletEvent>;
  votings: Array<IVoting>;
  webconfig: IWebConfig;
}

interface IEventDetails {
  wallet: IWallet;
  eventName: string;
  address: string;
  data: any;
  votings: Array<IVoting>;
  webconfig: IWebConfig;
}

interface IWalletEventsRowProps {
  row: IWalletEvent;
  wallet: IWallet;
  index: number;
  votings: Array<IVoting>;
  webconfig: IWebConfig;
}

interface IEventGasTotals {
  gasUsed: number | undefined;
  gasPrice: number | undefined;
  feeUsd: number | undefined;
}

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

interface IVotingLinkProps {
  id: number;
  address: string;
  votings: Array<IVoting>;
  webconfig: IWebConfig;
}

const VotingLink = (props: IVotingLinkProps) => {
  const isSecondary = true;
  const id = props.id * (isSecondary ? 2 : 1) + "";
  const href = `/votings/${id}`;
  let title = `#${props.id}`;
  for (const v of props.votings) {
    if (v.id == id) {
      return <Link href={href} legacyBehavior>{v.name}</Link>;
    }
  }
  return <span> {title}</span>;
};

const EventDetails = (props: IEventDetails) => {
  const thisWallet = props.wallet.address;
  switch (props.eventName) {
    case "TransferredAndLocked": {
      // source, recipient, amount, release start, release end
      const source: string = props.data[0];
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
      );
      const tmStart = parseInt(ethers.BigNumber.from(props.data[3]).toString());
      const dtStart = new Date(tmStart * 1000);
      const tmEnd = parseInt(ethers.BigNumber.from(props.data[4]).toString());
      const dtEnd = new Date(tmEnd * 1000);
      return (
        <div className="text-xs darken leading-4">
          source: <Address className="text-xs" inline={true} address={source} />{" "}
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens. Release start:{" "}
          <span className="text-color-panel-title">
            {niceDate(dtStart.toISOString())}
          </span>
          {", "}
          end:{" "}
          <span className="text-color-panel-title">
            {niceDate(dtEnd.toISOString())}
          </span>{" "}
        </div>
      );
    }
    case "Delegated": {
      // from, to, shares, total
      const from: string = props.data[0];
      const to: string = props.data[1];
      const shares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
      );
      const total = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          {from == thisWallet ? " to " : " from "}
          <InternalAddress
            className="text-xs"
            inline={true}
            address={from == thisWallet ? to : from}
          />{" "}
          <span className="text-color-panel-title">{toCurrency(shares)}</span>{" "}
          shares. Total:{" "}
          <span className="text-color-panel-title">{toCurrency(total)}</span>{" "}
          shares.{" "}
        </div>
      );
    }
    case "UpdatedDelegation": {
      // from, to, delta, shares, total
      const from: string = props.data[0];
      const to: string = props.data[1];
      const delta = props.data[2];
      const shares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
      );
      const total = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[4]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          {from == thisWallet ? " to " : " from "}{" "}
          <InternalAddress
            className="text-xs"
            inline={true}
            address={from == thisWallet ? to : from}
          />{" "}
          <span className="text-color-panel-title">{toCurrency(shares)}</span>{" "}
          shares. Delta:{" "}
          <span className="text-color-panel-title">
            {JSON.stringify(delta)}
          </span>{" "}
          Total:{" "}
          <span className="text-color-panel-title">{toCurrency(total)}</span>{" "}
          shares.{" "}
        </div>
      );
    }
    case "Undelegated": {
      // from, to, shares, total
      const from: string = props.data[0];
      const to: string = props.data[1];
      const shares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
      );
      const total = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          {from == thisWallet ? " to " : " from "}{" "}
          <InternalAddress
            className="text-xs"
            inline={true}
            address={from == thisWallet ? to : from}
          />{" "}
          <span className="text-color-panel-title">{toCurrency(shares)}</span>{" "}
          shares. Total:{" "}
          <span className="text-color-panel-title">{toCurrency(total)}</span>{" "}
          shares.{" "}
        </div>
      );
    }

    case "Staked": {
      // user, amount, minted_shares, user_unstaked, user_shares, total_shares, total_stake
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      const mintedShares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
      );
      const userUnstaked = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
      );
      const userShares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[4]).toString(), 18)
      );
      const totalShares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[5]).toString(), 18)
      );
      const totalStake = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[6]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens. Minted{" "}
          <span className="text-color-panel-title">
            {toCurrency(mintedShares)}
          </span>{" "}
          shares. Unstaked{" "}
          <span className="text-color-panel-title">
            {toCurrency(userUnstaked)}
          </span>{" "}
          tokens. User has{" "}
          <span className="text-color-panel-title">
            {toCurrency(userShares)}
          </span>{" "}
          shares. Total:{" "}
          <span className="text-color-panel-title">
            {toCurrency(totalStake)}
          </span>{" "}
          stake,{" "}
          <span className="text-color-panel-title">
            {toCurrency(totalShares)}
          </span>{" "}
          shares.{" "}
        </div>
      );
    }
    case "Unstaked": {
      // user, amount, user_unstaked, total_shares, total_stake
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      const userUnstaked = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
      );
      const totalShares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
      );
      const totalStake = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[4]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens. Unstaked{" "}
          <span className="text-color-panel-title">
            {toCurrency(userUnstaked)}
          </span>{" "}
          tokens. Total:{" "}
          <span className="text-color-panel-title">
            {toCurrency(totalStake)}
          </span>{" "}
          stake,{" "}
          <span className="text-color-panel-title">
            {toCurrency(totalShares)}
          </span>{" "}
          shares.{" "}
        </div>
      );
    }
    case "ScheduledUnstake": {
      // user, amount, shares, scheduled_for, user_shares
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      const shares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
      );
      const tm = parseInt(ethers.BigNumber.from(props.data[3]).toString());
      const dt = new Date(tm * 1000);
      const userShares = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[4]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens,
          <span className="text-color-panel-title">
            {toCurrency(shares)}
          </span>{" "}
          shares. Scheduled for{" "}
          <span className="text-color-panel-title">
            {niceDateTime(dt.toISOString())}
          </span>{" "}
          User:{" "}
          <span className="text-color-panel-title">
            {toCurrency(userShares)}
          </span>{" "}
          shares.{" "}
        </div>
      );
    }
    case "DepositedVesting": {
      // user, amount, start, end, userUnstaked, userVesting
      const amount = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[1]).toString(), 18)
      );
      const tmStart = parseInt(ethers.BigNumber.from(props.data[2]).toString());
      const dtStart = new Date(tmStart * 1000);
      const tmEnd = parseInt(ethers.BigNumber.from(props.data[3]).toString());
      const dtEnd = new Date(tmEnd * 1000);
      const userUnstaked = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[4]).toString(), 18)
      );
      const userVesting = noDecimals(
        withDecimals(ethers.BigNumber.from(props.data[5]).toString(), 18)
      );
      return (
        <div className="text-xs darken leading-4">
          <span className="text-color-panel-title">{toCurrency(amount)}</span>{" "}
          tokens. Starts{" "}
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
          tokens. Vesting{" "}
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
      return (
        <div className="text-xs darken leading-4">
          {niceDateTime(dt.toISOString())}
        </div>
      );
    }
    case "WithdrawnToPool":
      return null;
  }

  if (props.eventName == "StartVote" || props.eventName == "ExecuteVote") {
    if (typeof props.data[0] == "undefined") {
       return (<div className="darken text-xs">NO DETAILS</div>);
    }
    const voteId = parseInt(ethers.BigNumber.from(props.data[0]).toString());
    return (
      <div className="text-xs darken leading-4">
        <VotingLink
          id={voteId}
          address={props.address}
          votings={props.votings}
          webconfig={props.webconfig}
        />{" "}
      </div>
    );
  } else if (props.eventName == "CastVote") {
    if (typeof props.data[0] == "undefined") {
       return (<div className="darken text-xs">NO DETAILS</div>);
    }
    const voteId = parseInt(ethers.BigNumber.from(props.data[0]).toString());
    const supports = props.data[2];
    const votes = noDecimals(
      withDecimals(ethers.BigNumber.from(props.data[3]).toString(), 18)
    );
    return (
      <div className="text-xs darken leading-4">
        {supports ? "Supported" : "Voted against"}{" "}
        <VotingLink
          id={voteId}
          address={props.address}
          votings={props.votings}
          webconfig={props.webconfig}
        />{" "}
        with <span className="text-color-panel-title">{toCurrency(votes)}</span>{" "}
        tokens.
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

export const WalletEventsListTr = (props: IWalletEventsRowProps) => {
  const { row, index, wallet, votings, webconfig } = props;
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
            address={row.address}
            data={row.data}
            wallet={wallet}
            votings={votings}
            webconfig={webconfig}
          />
          <EventGasTotals
            gasUsed={row.gasUsed}
            gasPrice={row.gasPrice}
            feeUsd={parseFloat(row.feeUsd + "")}
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
              votings={props.votings}
              webconfig={props.webconfig}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
