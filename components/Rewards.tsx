import React from "react";
import { Prisma } from "@prisma/client";
import { IEpoch, ISupply } from "./../services/api3";
import { niceDate, toCurrency, toPct } from "./../services/format";
import { StakingTrend } from "../components/StakingTrend";

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
        {toCurrency(props.latest.epoch)}
      </span>{" "}
      with APR{" "}
      <span className="text-bold text-color-panel-title">
        {toPct(props.latest.apr)}
      </span>{" "}
      which means the next reward will be{" "}
      <span className="text-bold text-color-panel-title">
        {toPct(props.latest.rewardsPct)}
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
      <a
        href={`https://etherscan.io/tx/${epoch.blockTx}#eventlog`}
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        {toCurrency(epoch.blockNumber)}
      </a>
    </td>
    <td className="text-center">{niceDate(epoch.createdAt)}</td>
    <td className="text-center darken">{epoch.apr + "%"}</td>
    <td className="text-center accent">{epoch.rewardsPct + "%"}</td>
    <td className="text-right darken">{toCurrency(epoch.members)}</td>
    <td className="text-right darken">{toCurrency(epoch.totalStake)}</td>
    <td className="text-right accent">{toCurrency(epoch.mintedShares)}</td>
    <td className="text-center">{niceDate(epoch.releaseDate)}</td>
  </tr>
);

export interface IRewardsListProps {
  list: Array<IEpoch>;
}

export const RewardsList = (props: IRewardsListProps) => {
  return (
    <div className="max-w-screen-lg mx-auto">
      <table className="table invisible lg:visible">
        <RewardsListThead />
        <tbody>
          {props.list.map((e) => (
            <RewardsListTr key={e.epoch} {...e} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
