import React from "react";
import styles from "./Treasury.module.css";
import { ITreasury } from "../services/api3";
import { TxIcon } from "../components/Ethscan";
import { BorderedPanel } from "../components/BorderedPanel";
import { shorten } from "../services/format";

export const Treasury = (props: ITreasury) => {
  return (
    <BorderedPanel title={props.title} big={true}>
      <div className="flex justify-center y-5">
        <span className="darken">{shorten(props.address, 4)}</span>
        &nbsp;
        <TxIcon txId={props.address} />
      </div>
      <div>
        <div className="text-center my-5">
          <h3 className={styles.title}>API3</h3>
          <div className="text-center">
            <strong className={styles.bigTitle}>{props.valueAPI3}</strong>
          </div>
        </div>
        <div className="text-center my-5">
          <h3 className={styles.title}>USDC</h3>
          <div className={styles.bigTitle}>
            <strong className={styles.bigTitle}>{props.valueUSDC}</strong>
          </div>
        </div>
      </div>
    </BorderedPanel>
  );
};
