import React from "react";

import {
  noDecimals,
  niceDateTime,
  toCurrency,
  toPct,
} from "../services/format";

import { type IEpoch } from "./../services/types";
import { BorderedPanel } from "./BorderedPanel";

export const Epoch = (props: IEpoch) => {
  const title = props.isCurrent ? "Current Epoch" : "Previous Epoch";
  const nextDt = new Date(props.createdAt);
  nextDt.setDate(nextDt.getDate() + 7);
  const epochDt = props.isCurrent ? nextDt : new Date(props.createdAt);
  const darkenTitle = "text-xs text-color-grey font-bold uppercase";
  const classTitle = "text-xs text-color-title font-bold uppercase";
  return (
    <div className="max-w-220px mx-auto">
      <BorderedPanel big={true} title={title}>
        <div className="text-center">
          <div className={classTitle}>
            <span className="darken">Epoch #</span>
            {props.isCurrent ? props.epoch + 1 : props.epoch}
          </div>
          <div className="text-3xl uppercase m-0">
            APR: <strong className="font-bold">{toPct(props.isCurrent ? props.newApr : props.apr)}</strong>
          </div>
          <div className="mb-3">
            <span className={darkenTitle}>Epoch Rewards: </span>
            <strong className="accent">{toPct(props.isCurrent ? props.newRewardsPct : props.rewardsPct)}</strong>
          </div>
            {props.isCurrent ? (
<div className="mb-10">&nbsp;</div>
            ) : (
          <div className="my-0">
              <span className={darkenTitle}>Staked at the end of epoch: </span>
              <strong>{noDecimals(toCurrency(props.totalStake))}</strong>
</div>
            )}
          <div className="pt-8">
            {props.isCurrent ? (
null
            ) : (
              <div className={classTitle}>
                <strong> {noDecimals(toCurrency(props.mintedShares))}</strong>
                <span className={darkenTitle}> API3 tokens minted </span>
              </div>
            )}
            <div className="mb-4">
              <div className={darkenTitle}>{niceDateTime(epochDt.toISOString())}</div>
            </div>
          </div>
        </div>
      </BorderedPanel>
    </div>
  );
};
