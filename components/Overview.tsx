import React from "react";
import { BorderedPanel } from "./BorderedPanel";
import { IEpoch } from "./../services/api3";
import { niceDate, toCurrency } from "../services/format";

export const Epoch = (props: IEpoch) => {
  const title = props.isCurrent ? "Current Epoch" : "Previous Epoch";
  const darkenTitle = "text-sm leading-6 text-color-grey font-bold uppercase";
  const classTitle = "text-sm leading-6 text-color-title font-bold uppercase";
  return (
    <BorderedPanel big={true} title={title}>
      <div style={{ textAlign: "center" }}>
        <div className={classTitle}>
          <span className="darken">Epoch #</span>
          {props.epoch}
        </div>
        <div className="text-3xl uppercase m-0">
          APR: <strong className="font-bold">{props.apr+'%'}</strong>
        </div>
        <div className="mb-8 leading-6">
          <span className={darkenTitle}>Epoch Rewards: </span>
          <strong className="accent">{props.rewardsPct+'%'}</strong>
        </div>
        <div className="leading-6">
          {props.isCurrent ? (
            <span className={darkenTitle}>Staked now: </span>
          ) : (
            <span className={darkenTitle}>
              Staked at the end of epoch:{" "}
            </span>
          )}
          <strong>{toCurrency(props.totalStake)}</strong>
        </div>
        {props.isCurrent ? (
          <div className="leading-6">
            <span className={darkenTitle}>Including rewards: </span>
            <strong>{toCurrency(props.stakedRewards)}</strong>
          </div>
        ) : null}
        <div className="py-8">
          {props.isCurrent ? (
            <div className={classTitle}>
              <strong> ~{toCurrency(props.mintedShares)}</strong>
              <span className={darkenTitle}>
                {" "}
                API3 tokens to be minted{" "}
              </span>
            </div>
          ) : null}
          <div className="leading-6">
            <div className={darkenTitle}>
              {niceDate(props.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </BorderedPanel>
  );
};
