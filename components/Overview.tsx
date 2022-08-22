import React from "react";
import { BorderedPanel } from "./BorderedPanel";
import { IEpoch } from "./../services/types";
import { niceDate, toCurrency, toPct } from "../services/format";

export const Epoch = (props: IEpoch) => {
  const title = props.isCurrent ? "Current Epoch" : "Previous Epoch";
  const darkenTitle = "text-xs text-color-grey font-bold uppercase";
  const classTitle = "text-xs text-color-title font-bold uppercase";
  return (
    <div className="max-w-220px mx-auto">
      <BorderedPanel big={true} title={title}>
        <div className="text-center">
          <div className={classTitle}>
            <span className="darken">Epoch #</span>
            {props.epoch}
          </div>
          <div className="text-3xl uppercase m-0">
            APR: <strong className="font-bold">{toPct(props.apr)}</strong>
          </div>
          <div className="mb-3">
            <span className={darkenTitle}>Epoch Rewards: </span>
            <strong className="accent">{toPct(props.rewardsPct)}</strong>
          </div>
          <div className="my-0">
            {props.isCurrent ? (
              <span className={darkenTitle}>Staked now: </span>
            ) : (
              <span className={darkenTitle}>Staked at the end of epoch: </span>
            )}
            <strong>{toCurrency(props.totalStake)}</strong>
          </div>
          {props.isCurrent ? (
            <div className="">
              <span className={darkenTitle}>Including rewards: </span>
              <strong>{toCurrency(props.stakedRewards)}</strong>
            </div>
          ) : null}
          <div className="pt-8">
            {props.isCurrent ? (
              <div className={classTitle}>
                <strong> ~{toCurrency(props.mintedShares)}</strong>
                <span className={darkenTitle}> API3 tokens to be minted </span>
              </div>
            ) : (
              <div className={classTitle}>
                <strong> {toCurrency(props.mintedShares)}</strong>
                <span className={darkenTitle}> API3 tokens minted </span>
              </div>
            )}
            <div className="mb-4">
              <div className={darkenTitle}>{niceDate(props.createdAt)}</div>
            </div>
          </div>
        </div>
      </BorderedPanel>
    </div>
  );
};
