import React from "react";
import { Prisma } from "@prisma/client";
import { IEpoch, ISupply } from "./../services/types";
import { noDecimals, niceDate, toCurrency, toPct } from "./../services/format";
import { StakingTrend } from "../components/StakingTrend";
import { BorderedPanel } from "../components/BorderedPanel";

export interface IRewardsSummaryProps {
  supply: ISupply;
  latest: IEpoch;
  totalMinted: Prisma.Decimal;
}

export const RewardsSummary = (props: IRewardsSummaryProps) => (
  <div className="my-6 mx-5 lg:mx-0">
    <p className="text-center text-color-grey">
      API3 DAO minted{" "}
      <span className="text-bold text-color-panel-title">
        {toCurrency(props.totalMinted)}
      </span>{" "}
      API3 tokens as staking rewards for its members.
    </p>
    <p className="text-center text-color-grey my-2">
      Current Epoch is{" "}
      <span className="text-bold text-color-panel-title">
        {toCurrency(props.latest.epoch + 1)}
      </span>{" "}
      with APR{" "}
      <span className="text-bold text-color-panel-title">
        {toPct(props.latest.newApr)}
      </span>{" "}
      which means the next reward will be{" "}
      <span className="text-bold text-color-panel-title">
        {toPct(props.latest.newRewardsPct)}
      </span>{" "}
      to your current stake and your locked rewards.
    </p>
    <StakingTrend
      apr={props.latest.apr}
      totalStaked={props.supply.totalStaked}
      stakingTarget={props.supply.stakingTarget}
    />
  </div>
);

export const RewardsListSmScreen = (epoch: IEpoch) => (
  <div className="px-3">
    <BorderedPanel title={`Epoch ${toCurrency(epoch.epoch)}`}>
      <div className="text-center">
        Block#{" "}
        <a
          href={`https://etherscan.io/tx/${epoch.txHash}#eventlog`}
          rel="nofollow noopener noreferrer"
          target="_blank"
        ></a>
      </div>
      <div className="text-center darken">{niceDate(epoch.createdAt)}</div>
      <div className="text-center darken">
        APR:{" "}
        <span className="text-bold text-2xl text-color-panel-title">
          {toPct(epoch.apr)}
        </span>
      </div>
      <div className="text-center darken">
        Rewards:{" "}
        <span className="text-bold text-color-panel-title">
          {toPct(epoch.rewardsPct)}
        </span>
      </div>
      <div className="text-center darken">
        Members:{" "}
        <span className="text-bold text-color-panel-title">
          {toCurrency(epoch.members)}
        </span>
      </div>
      <div className="text-center darken">
        Total Staked:{" "}
        <span className="text-bold text-color-panel-title">
          {toCurrency(epoch.totalStake)}
        </span>
      </div>
      <div className="text-center darken">
        Minted:{" "}
        <span className="text-bold text-color-panel-title">
          {toCurrency(epoch.mintedShares)}
        </span>
      </div>
      <div className="text-center darken mb-5">
        Release Date:{" "}
        <span className="text-bold text-color-panel-title">
          {niceDate(epoch.releaseDate)}
        </span>
      </div>
    </BorderedPanel>
  </div>
);

export const RewardsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">Epoch</th>
      <th className="text-center">Block</th>
      <th className="text-center">Rewards Date</th>
      <th className="text-center">APR</th>
      <th className="text-center">Rewards</th>
      <th className="text-right">Members</th>
      <th className="text-right">Staked</th>
      <th className="text-right">Minted</th>
      <th className="text-center">Release Date</th>
    </tr>
  </thead>
);

export const RewardsListTr = (epoch: IEpoch) => (
  <tr>
    <td className="text-center">{toCurrency(epoch.epoch)}</td>
    <td className="text-center">
      {epoch.blockNumber ? (
        <a
          href={`https://etherscan.io/tx/${epoch.txHash}#eventlog`}
          rel="nofollow noopener noreferrer"
          target="_blank"
        >
          {toCurrency(epoch.blockNumber)}
        </a>
      ) : null}
    </td>
    <td className="text-center">{niceDate(epoch.createdAt)}</td>
    <td className="text-center darken">{toPct(epoch.apr)}</td>
    <td className="text-center accent">{toPct(epoch.rewardsPct)}</td>
    <td className="text-right darken">{toCurrency(epoch.members)}</td>
    <td className="text-right darken">
      {noDecimals(toCurrency(epoch.totalStake))}
    </td>
    <td className="text-right accent">
      {noDecimals(toCurrency(epoch.mintedShares))}
    </td>
    <td className="text-center">
      {(!epoch.isReleased)
        ? niceDate(epoch.releaseDate)
        : <span className="text-sm darken">released</span>}
    </td>
  </tr>
);

export interface IRewardsListProps {
  list: Array<IEpoch>;
}

export const RewardsList = (props: IRewardsListProps) => {
  return (
    <div>
      <div className="lg:hidden">
        {props.list.map((e) => (
          <RewardsListSmScreen key={e.epoch} {...e} />
        ))}
      </div>
      <div className="max-w-screen-lg mx-auto hidden lg:block">
        <table className="table">
          <RewardsListThead />
          <tbody>
            {props.list.map((e) => (
              <RewardsListTr key={e.epoch} {...e} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
