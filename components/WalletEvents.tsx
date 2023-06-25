import React from "react";
import Link from "next/link";
import { Prisma } from "@prisma/client";
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
  toPct4,
  noDecimals,
  withDecimals,
} from "./../services/format";
import { Address, InternalAddress, BlockNumber } from "./../components/Ethscan";

export interface IWalletEventsListProps {
  wallet: IWallet;
  list: Array<IWalletEvent>;
  votings: Array<IVoting>;
  webconfig: IWebConfig;
  showGas: boolean;
}

interface IEventDetails {
  wide: boolean;
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
  showGas: boolean;
}

interface IEventGasTotals {
  gasUsed: number | undefined;
  gasPrice: number | undefined;
  feeUsd: number | undefined;
}

const EventGasTotals = (props: IEventGasTotals) => {
  if (props.gasUsed == 0) return null;
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
      return (
        <Link href={href} legacyBehavior>
          {v.name}
        </Link>
      );
    }
  }
  return <span> {title}</span>;
};

interface ISharesOfUserProps {
  user: Array<string>;
}

const SharesOfUser = (props: ISharesOfUserProps) => {
  if (!props.user || !props.user.length) return null;
  const unstaked = noDecimals(withDecimals(props.user[0], 18));
  const vesting = noDecimals(withDecimals(props.user[1], 18));
  const unstakeAmount = noDecimals(withDecimals(props.user[2], 18));
  const unstakeShares = noDecimals(withDecimals(props.user[3], 18));
  if (
    unstaked === "0" &&
    vesting == "0" &&
    unstakeAmount == "0" &&
    unstakeShares == "0"
  )
    return null;
  const unstakeScheduledFor = parseInt(props.user[4]);
  // lastDelegationUpdateTimestamp   uint256 :  0
  // lastProposalTimestamp   uint256 :  1669559759
  return (
    <div className="text-xs darken">
      {unstaked != "0" ? (
        <span>
          Unstaked:{" "}
          <span className="text-color-panel-title">{toCurrency(unstaked)}</span>{" "}
        </span>
      ) : null}
      {vesting != "0" ? (
        <span>
          Vesting:{" "}
          <span className="text-color-panel-title">{toCurrency(vesting)}</span>.{" "}
        </span>
      ) : null}
      {unstakeAmount != "0" ? (
        <span>
          Unstake Amount:{" "}
          <span className="text-color-panel-title">
            {toCurrency(unstakeAmount)}
          </span>{" "}
        </span>
      ) : null}
      {unstakeShares != "0" ? (
        <span>
          Unstaked:{" "}
          <span className="text-color-panel-title">
            {toCurrency(unstakeShares)}
          </span>{" "}
        </span>
      ) : null}
      {unstakeScheduledFor > 0 ? (
        <span>
          Unstake Scheduled For:{" "}
          <span className="text-color-panel-title">
            {new Date(1000 * unstakeScheduledFor)
              .toISOString()
              .substring(0, 10)}
          </span>{" "}
        </span>
      ) : null}
    </div>
  );
};

const EventDetails = (props: IEventDetails) => {
  const thisWallet = props.wallet.address.replace("0x", "").toLowerCase();
  switch (props.eventName) {
    case "Rewards": {
      const userShare = props.data[0];
      const userSharePct = props.data[1];
      const userMintedShares = props.data[2];
      const userReleasedShares = props.data[3];
      const totalShares = props.data[4];
      const mintedShares = props.data[5];
      return (
        <div className="leading-4">
          <div key={0} className="text-xs darken">
            User shares:{" "}
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(userShare))}
            </span>
            {" (owns "}
            <span className="text-color-panel-title">
              {toPct4(userSharePct)}
            </span>{" "}
            out of{" "}
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(totalShares))}
            </span>
            {"). "}
          </div>
          <div key={1} className="text-xs darken">
            Rewarded with{" "}
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(userMintedShares))}
            </span>{" "}
            locked tokens out of{" "}
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(mintedShares))}
            </span>{" "}
            minted{" "}
          </div>
          {userReleasedShares > 0 ? (
            <div key={2} className="text-xs darken">
              Released{" "}
              <span className="text-color-panel-title">
                {noDecimals(toCurrency(userReleasedShares))}
              </span>
            </div>
          ) : null}
        </div>
      );
    }
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
          <span className={props.wide ? "ml-1" : "block"}>
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
          </span>
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
          {from.replace("0x", "").toLowerCase() == thisWallet
            ? " to "
            : " from "}
          <InternalAddress
            className="text-xs"
            inline={true}
            address={
              from.replace("0x", "").toLowerCase() == thisWallet ? to : from
            }
          />{" "}
          <span className="text-color-panel-title">{toCurrency(shares)}</span>{". "}
          <span className={props.wide ? "ml-1" : "block"}>
            Total:{" "}
            <span className="text-color-panel-title">{toCurrency(total)}</span>{". "}
          </span>
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
          {from.replace("0x", "").toLowerCase() == thisWallet
            ? " to "
            : " from "}{" "}
          <InternalAddress
            className="text-xs"
            inline={true}
            address={
              from.replace("0x", "").toLowerCase() == thisWallet ? to : from
            }
          />{" "}
          <span className="text-color-panel-title">{toCurrency(shares)}</span>.
          <span className={props.wide ? "ml-1" : "block"}>
            Delta:{" "}
            <span className="text-color-panel-title">
              {JSON.stringify(delta)}
            </span>{" "}
            Total:{" "}
            <span className="text-color-panel-title">{toCurrency(total)}</span>{" "}
          </span>
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
          <span className="text-color-panel-title">{toCurrency(shares)}</span>
          . Total:{" "}
          <span className="text-color-panel-title">{toCurrency(total)}</span>{" "}
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
          </span>{". "}
          Unstaked{" "}
          <span className="text-color-panel-title">
            {toCurrency(userUnstaked)}
          </span>{" "}
          tokens.
          <span className={props.wide ? "ml-1" : "block"}>
            User has{" "}
            <span className="text-color-panel-title">
              {toCurrency(userShares)}
            </span>{". "}
            Total:{" "}
            <span className="text-color-panel-title">
              {toCurrency(totalStake)}
            </span>{" "}
            stake,{" "}
            <span className="text-color-panel-title">
              {toCurrency(totalShares)}
            </span>{". "}
          </span>
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
          </span>{". "}
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
          tokens,{" "}
          <span className="text-color-panel-title">{toCurrency(shares)}</span>{". "}
          Scheduled for{" "}
          <span className="text-color-panel-title">
            {niceDateTime(dt.toISOString())}
          </span>{" "}
          <span className={props.wide ? "ml-1" : "block"}>
            User:{" "}
            <span className="text-color-panel-title">
              {toCurrency(userShares)}
            </span>{" "}
          </span>
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
          <span className={props.wide ? "ml-1" : "block"}>
            Unstaked{" "}
            <span className="text-color-panel-title">
              {toCurrency(userUnstaked)}
            </span>{" "}
            tokens. Vesting{" "}
            <span className="text-color-panel-title">
              {toCurrency(userVesting)}
            </span>{" "}
            tokens
          </span>
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
      if (props.data.length == 3) {
        const userUnstaked = noDecimals(
          withDecimals(ethers.BigNumber.from(props.data[2]).toString(), 18)
        );
        return (
          <div className="text-xs darken leading-4">
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(amount))}
            </span>{" "}
            tokens,
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(userUnstaked))}
            </span>{" "}
            unstaked
          </div>
        );
      } else {
        return (
          <div className="text-xs darken leading-4">
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(amount))}
            </span>{" "}
            tokens from TimelockManager
          </div>
        );
      }
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

    case "Status":
    case "Shares": {
      // fake event for debugging
      const stake = noDecimals(props.data.stake);
      const totalStake = noDecimals(props.data.totalStake);
      const locked = noDecimals(props.data.locked);
      const shares = noDecimals(props.data.shares);
      const totalShares = noDecimals(props.data.totalShares);
      const votingPower = noDecimals(props.data.votingPower);
      const votingPowerPct = new Prisma.Decimal(props.data.votingPower)
        .mul(100)
        .div(new Prisma.Decimal(props.data.totalShares));
      return (
        <div className="text-xs darken leading-4">
          <div className="text-xs darken">
            Owns{" "}
            <span className="text-color-panel-title">{toCurrency(shares)}</span>{" "}
            shares out of{" "}
            <span className="text-color-panel-title">
              {toCurrency(totalShares)}
            </span>
            .
            <span className={props.wide ? "ml-1" : "block"}>
              Voting Power:{" "}
              <span className="text-color-panel-title">
                {toCurrency(votingPower)}
              </span>{" "}
              ({toPct4(votingPowerPct)})
            </span>
          </div>
          <div className="text-xs darken">
            Staked:{" "}
            <span className="text-color-panel-title">{toCurrency(stake)}</span>{" "}
            tokens out of{" "}
            <span className="text-color-panel-title">
              {toCurrency(totalStake)}
            </span>
            .
            <span className={props.wide ? "ml-1" : "block"}>
              Locked:{" "}
              <span className="text-color-panel-title">
                {toCurrency(locked)}
              </span>{" "}
              tokens.
            </span>
          </div>
          <SharesOfUser user={props.data.user} />
        </div>
      );
    }
  }

  if (props.eventName == "StartVote" || props.eventName == "ExecuteVote") {
    if (typeof props.data[0] == "undefined") {
      return <div className="darken text-xs">NO DETAILS</div>;
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
      return <div className="darken text-xs">NO DETAILS</div>;
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

const isSpecial = (name: string): boolean => {
  return name == "Rewards" || name == "Status" || name == "Shares";
};

export const WalletEventsListTr = (props: IWalletEventsRowProps) => {
  const { row, index, wallet, votings, webconfig } = props;
  const eventNameClass = isSpecial(row.eventName)
    ? "text-center text-xs ps-2 darken"
    : "text-center text-xs px-2 font-bold";
  return (
    <tr>
      <td className="text-center">{(index || 0) + 1}.</td>
      <td className="text-center text-xs darken">
        {" "}
        {niceDateTime(row.createdAt)}{" "}
      </td>
      <td className="text-center">
        <BlockNumber blockNumber={row.blockNumber} txId={toHex(row.txHash)} />
      </td>
      <td className={eventNameClass}> {row.eventName} </td>
      <td className="text-left px-5">
        <div className="text-xs pt-1">
          <EventDetails
            wide={true}
            eventName={row.eventName}
            address={row.address}
            data={row.data}
            wallet={wallet}
            votings={votings}
            webconfig={webconfig}
          />
          {props.showGas ? (
            <EventGasTotals
              gasUsed={row.gasUsed}
              gasPrice={row.gasPrice}
              feeUsd={parseFloat(row.feeUsd + "")}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
};

export const WalletEventsListRow = (props: IWalletEventsRowProps) => {
  const { row, index, wallet, votings, webconfig } = props;
  const eventNameClass = isSpecial(row.eventName)
    ? "flex-1 text-left text-xs ps-2 darken"
    : "flex-1 text-left text-xs px-2 font-bold";
  return (
    <li className="border-b border-color-grey pt-2 pb-2">
      <div className="flex">
        <div className="text-xs text-left w-8">{(index || 0) + 1}.</div>
        <div className="text-xs text-left w-32 darken">
          {" "}
          {niceDateTime(row.createdAt)}{" "}
        </div>
        <div className="text-xs text-left w-24">
          <BlockNumber blockNumber={row.blockNumber} txId={toHex(row.txHash)} />
        </div>
        <div className={eventNameClass}> {row.eventName} </div>
      </div>
      <div className="text-xs pt-1 ml-12">
        <EventDetails
          wide={false}
          eventName={row.eventName}
          address={row.address}
          data={row.data}
          wallet={wallet}
          votings={votings}
          webconfig={webconfig}
        />
      </div>
      <div className="text-xs ml-12">
        {props.showGas ? (
          <EventGasTotals
            gasUsed={row.gasUsed}
            gasPrice={row.gasPrice}
            feeUsd={parseFloat(row.feeUsd + "")}
          />
        ) : null}
      </div>
    </li>
  );
};

const filteredEvents = (props: IWalletEventsListProps): Array<IWalletEvent> => {
  const blocksWithShares = new Map<number, number>();
  props.list.forEach((item: IWalletEvent) => {
    if (item.eventName === "Status" || item.eventName === "Shares") {
      blocksWithShares.set(item.blockNumber, 1);
    }
  });
  return props.list.filter((item: IWalletEvent) => {
    if (
      item.eventName === "Rewards" &&
      blocksWithShares.has(item.blockNumber)
    ) {
      // skip "Rewards" that have "Shares" event in its block
      return false;
    }
    return true;
  });
};

export const WalletEventsList = (props: IWalletEventsListProps) => {
  return (
    <div className="mx-auto mb-20">
      <div className="lg:hidden mt-5 ml-5 mr-5">
        <div className="mb-4 uppercase text-center text-sm">Member Events</div>
        <ol className="border-t border-color-grey">
          {filteredEvents(props).map((row: any, index: number) => (
            <WalletEventsListRow
              key={row.id}
              row={row}
              index={index}
              showGas={props.showGas}
              wallet={props.wallet}
              votings={props.votings}
              webconfig={props.webconfig}
            />
          ))}
        </ol>
      </div>
      <div className="max-w-screen-lg mx-auto hidden lg:block">
        <table className="table">
          <WalletEventsListThead />
          <tbody>
            {filteredEvents(props).map((row: any, index: number) => (
              <WalletEventsListTr
                key={row.id}
                row={row}
                index={index}
                showGas={props.showGas}
                wallet={props.wallet}
                votings={props.votings}
                webconfig={props.webconfig}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
