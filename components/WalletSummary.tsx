import React from "react";
import { BorderedPanel } from "./BorderedPanel";
import { toPct, toHex, toCurrency } from "../services/format";
import { IWallet } from "../services/types";
import { TxIcon } from "../components/Ethscan";
import { MemberClassification } from "../components/MemberClassification";

export const WalletSummary = (props: IWallet) => {
  const classTitle =
    "text-sm text-center text-color-grey py-4 border-t border-solid border-color-cell-border uppercase";
  const classValue = "text-2xl mb-10 text-color-panel-title font-bold";
  return (
    <div className="max-w-screen-lg text-center mx-auto my-10">
      {props.ensName ? (
        <div className="text-4xl text-color-panel-title uppercase">
          API3 DAO member{" "}
          <span className="text-color-accent">{props.ensName}</span>
        </div>
      ) : null}
      <div className="text-md leading-10 text-center">
        {toHex(props.address)} <TxIcon txId={toHex(props.address)} />
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
              {toPct(props.userVotingPower)}
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
              <div className={classValue}>{toCurrency(props.userWithdrew)}</div>
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
