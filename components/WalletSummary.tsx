import React from "react";
import { BorderedPanel } from "./BorderedPanel";
import { toPct4, toHex, noDecimals, toCurrency } from "../services/format";
import { Prisma } from "@prisma/client";
import { IWallet } from "../services/types";
import { TxIcon } from "../components/Ethscan";
import { MemberClassification } from "../components/MemberClassification";

export interface IWalletSummaryProps {
  wallet: IWallet
  total: any;
}
export const WalletSummary = (props: IWalletSummaryProps) => {
  const classTitle =
    "text-sm text-center text-color-grey py-4 border-t border-solid border-color-cell-border uppercase";
  const classValue = "text-2xl mb-10 text-color-panel-title font-bold";
  const { wallet } = props;
  const userVotingPower = new Prisma.Decimal(wallet.userShare).div(props.total);
  return (
    <div className="max-w-screen-lg text-center mx-auto my-10">
      {wallet.ensName ? (
        <div className="text-4xl text-color-panel-title uppercase">
          API3 DAO member{" "}
          <span className="text-color-accent">{wallet.ensName}</span>
        </div>
      ) : null}
      <div className="text-md leading-10 text-center">
        {toHex(wallet.address)} <TxIcon txId={toHex(wallet.address)} />
      </div>
      <div className="lg:grid lg:grid-cols-2">
        <BorderedPanel title="Voting Power" big={true}>
          <div className="my-4">
            <span className="text-2xl text-color-panel-title">
              {noDecimals(toCurrency(wallet.userShare))}
            </span>{" "}
            shares
          </div>
          <div className="text-4xl">
            <span className="text-color-panel-title">
              {toPct4(userVotingPower)}
            </span>
          </div>
          <div className="text-color-grey my-8 mt-4">
            owning{" "}
            <span className="text-color-panel-title">
              {noDecimals(toCurrency(wallet.userShare))}
            </span>{" "}
            shares
          </div>
        </BorderedPanel>
        <div>
          <div className="lg:mt-6 lg:flex border-t border-b border-solid border-color-panel-border">
            <div className="flex-1">
              <div className={classTitle}>Withdrawn</div>
              <div className={classValue}>{noDecimals(toCurrency(wallet.userWithdrew))}</div>
            </div>
            {/*props.userLockedReward ? (
              <div className="flex-1">
                <div className={classTitle}>Locked Rewards</div>
                <div className={classValue}>
                  {noDecimals(toCurrency(wallet.userLockedReward))}
                </div>
              </div>
            ): null*/}
            <div className="flex-1">
              <div className={classTitle}>Deposited</div>
              <div className={classValue}>
                {noDecimals(toCurrency(wallet.userDeposited))}
              </div>
            </div>
          </div>
          <MemberClassification badges={wallet.badges} />
        </div>
      </div>
    </div>
  );
};
