import React from "react";
import styles from "./TokenCirculating.module.css";
import { ISupply } from "../services/api3";
import { BorderedPanel } from "../components/BorderedPanel";
import { toCurrency } from "../services/format";

export const TokenCirculating = (props: ISupply) => {
  return (
    <BorderedPanel big={true} title="API3 Circulating Supply">
      <div className="text-center">
        <div className={styles.bigTitle}>{toCurrency(props.circulatingSupply)}</div>
        <div className={styles.title}>Total Locked</div>
        <strong>
          {toCurrency(props.totalLocked)}
          <span className="md"> tokens</span>
        </strong>
      </div>
    </BorderedPanel>
  );
};
