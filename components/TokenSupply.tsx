import React from "react";
import styles from "./TokenSupply.module.css";
import { ISupply } from "../services/api3";
import { toCurrency } from "../services/format";

export const TokenSupply = (props: ISupply) => {
  return (
    <div className="md:grid grid-cols-4">
      <div className={styles.cell}>
        <h3 className={styles.title}>Locked by governance</h3>
        <strong>{toCurrency(props.lockedByGovernance)} tokens</strong>
      </div>
      <div className={styles.cell}>
        <h3 className={styles.title}>Locked vestings</h3>
        <strong>{toCurrency(props.lockedVestings)} tokens</strong>
      </div>
      <div className={styles.cell}>
        <h3 className={styles.title}>Locked rewards</h3>
        <strong>{toCurrency(props.lockedRewards)} tokens</strong>
      </div>
      <div className={styles.cell}>
        <h3 className={styles.title}>Time locked</h3>
        <strong>{toCurrency(props.timeLocked)} tokens</strong>
      </div>
    </div>
  );
};
