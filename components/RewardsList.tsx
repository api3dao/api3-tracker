import React from "react";
// import styles from "./RewardsList.module.css";
import { IEpoch } from "./../services/api3";
import { toCurrency } from "./../services/format";

export const RewardsListThead = () => (
  <thead>
    <tr>
      <th className="text-center">Epoch</th>
      <th className="text-center">Block</th>
      <th className="text-center">Rewards Date</th>
      <th className="text-right">APR</th>
      <th className="text-right">Rewards</th>
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
    <td className="text-center">{epoch.createdAt.toISOString()}</td>
    <td className="text-right darken">{epoch.apr}%</td>
    <td className="text-center accent">{epoch.rewardsPct}%</td>
    <td className="text-right darken">{toCurrency(epoch.members)}</td>
    <td className="text-right darken">{toCurrency(epoch.totalStake)}</td>
    <td className="text-right accent">{toCurrency(epoch.mintedShares)}</td>
    <td className="text-center">{epoch.releaseDate.toISOString()}</td>
  </tr>
);

export interface IRewardsListProps {
  list: Array<IEpoch>;
}

export const RewardsList = (props: IRewardsListProps) => {
  return (
    <div>
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
