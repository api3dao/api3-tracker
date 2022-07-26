import React from "react";
import styles from "./TokenCirculating.module.css";
import { ISupply } from "../services/api3";
import { toCurrency } from "../services/format";

export const TokenStaking = (props: ISupply) => {
  return (
    <div className="sm:grid grid-cols-2">
      <div className={styles.cell}>
        <div className={styles.title}>Total Staked</div>
        <strong>
          {toCurrency(props.totalStaked)}
          <span className="md"> tokens</span>
        </strong>
      </div>
      <div className={styles.cell}>
        <div className={styles.title}>Staking Target</div>
        <strong>
          {toCurrency(props.stakingTarget)}
          <span className="md"> tokens</span>
        </strong>
      </div>
    </div>
  );
};
