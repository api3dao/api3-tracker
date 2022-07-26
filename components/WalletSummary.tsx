import React from "react";
import { BorderedPanel } from "./BorderedPanel";
import { toCurrency } from "../services/format";
import { IWallet } from "../services/api3";
import { TxIcon } from "../components/Ethscan";
import { MemberClassification } from "../components/MemberClassification";

export const WalletSummary = (props: IWallet) => {
  const classTitle =
    "text-sm text-center text-color-grey py-4 border-t border-solid border-color-cell-border uppercase";
  const classValue = "text-2xl mb-10 text-color-panel-title font-bold";
  return (
    <div className="text-center mx-auto my-10">
      <div className="text-4xl text-color-panel-title uppercase">
        Api3 dao member{" "}
        <span className="text-color-accent">{props.ensName}</span>
      </div>
      <div className="text-md leading-10 text-center">
        {props.address} <TxIcon txId={props.address} />
      </div>
      <div className="lg:grid lg:grid-cols-2">
        <BorderedPanel title="VotingPower" big={true}>
          <div className="my-4">
            <span className="text-2xl text-color-panel-title">
              {toCurrency(props.userShare)}
            </span>{" "}
            shares
          </div>
          <div className="text-4xl">
            <span className="text-color-panel-title">
              {props.userVotingPower}%
            </span>
          </div>
          <div className="text-color-grey my-8 mt-4">
            owning{" "}
            <span className="text-color-panel-title">
              {toCurrency(props.userShare)}
            </span>{" "}
            shares
          </div>
        </BorderedPanel>
        <div>
          <div className="lg:mt-6 lg:flex border-t border-b border-solid border-color-panel-border">
            <div className="flex-1">
              <div className={classTitle}>Withdrawn</div>
              <div className={classValue}>
                {toCurrency(props.userWithdrew)}
              </div>
            </div>
            <div className="flex-1">
              <div className={classTitle}>Locked Rewards</div>
              <div className={classValue}>
                {toCurrency(props.userLockedReward)}
              </div>
            </div>
            <div className="flex-1">
              <div className={classTitle}>Deposited</div>
              <div className={classValue}>
                {toCurrency(props.userDeposited)}
              </div>
            </div>
          </div>
          <MemberClassification badges={props.badges} />
        </div>
      </div>
    </div>
  );
};
