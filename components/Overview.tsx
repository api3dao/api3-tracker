import React from "react";
import styles from "./Overview.module.css";
import { BorderedPanel } from "./BorderedPanel";
import { IEpoch } from "./../services/api3";

export const Epoch = (props: IEpoch) => {
  const title = props.isCurrent ? "Current Epoch" : "Previous Epoch";
  return (
    <BorderedPanel big={true} title={title}>
      <div style={{ textAlign: "center" }}>
        <div className={styles.title}>
          <span className="darken">Epoch #</span>
          {props.epoch}
        </div>
        <h2 className={styles.h2}>
          APR: <strong className={styles.bigTitle}>{props.apr}%</strong>
        </h2>
        <div className={styles.row20}>
          <span className={styles.darkenTitle}>Epoch Rewards: </span>
          <strong className="accent">{props.rewardsPct}%</strong>
        </div>
        <div className={styles.row}>
          {props.isCurrent ? (
            <span className={styles.darkenTitle}>Staked now: </span>
          ) : (
            <span className={styles.darkenTitle}>
              Staked at the end of epoch:{" "}
            </span>
          )}
          <strong>{props.totalStake}</strong>
        </div>
        {props.isCurrent ? (
          <div className={styles.row}>
            <span className={styles.darkenTitle}>Including rewards: </span>
            <strong>{props.stakedRewards}</strong>
          </div>
        ) : null}
        <div className={styles.padded}>
          {props.isCurrent ? (
            <div className={styles.title}>
              <strong> ~{props.mintedShares}</strong>
              <span className={styles.darkenTitle}>
                {" "}
                API3 tokens to be minted{" "}
              </span>
            </div>
          ) : null}
          <div className={styles.row}>
            <div className={styles.darkenTitle}>
              {props.createdAt.toISOString()}
            </div>
          </div>
        </div>
      </div>
    </BorderedPanel>
  );
};
