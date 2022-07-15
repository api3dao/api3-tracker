import React from "react";
import styles from "./TokenCirculating.module.css";
import { ISupply } from "../services/api3";
import { BorderedPanel } from "../components/BorderedPanel";

export const TokenCirculating = (props: ISupply) => {
  return (
    <BorderedPanel big={true} title="API3 Circulating Supply">
      <div className="text-center">
        <div className={styles.bigTitle}>{props.circulatingSupply}</div>
        <div className={styles.title}>Total Locked</div>
        <strong>
          {props.totalLocked}
          <span className="md"> tokens</span>
        </strong>
      </div>
    </BorderedPanel>
  );
};
