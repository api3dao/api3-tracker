import React from "react";
import { ISupply } from "../services/types";
import { BorderedPanel } from "../components/BorderedPanel";
import { noDecimals, toCurrency } from "../services/format";

export const TokenCirculating = (props: ISupply) => {
  const classTitle =
    "text-sm text-center leading-8 text-color-cell-title uppercase";
  const classValue = "font-bold";
  return (
    <BorderedPanel big={true} title="API3 Circulating Supply">
      <div className="text-center mb-4">
        <div className="font-bold mb-8 text-3xl">
          {noDecimals(toCurrency(props.circulatingSupply))}
        </div>
        <div className={classTitle}>Total Locked</div>
        <div className={classValue}>
          {noDecimals(toCurrency(props.totalLocked))}
          <span className="md"> tokens</span>
        </div>
      </div>
    </BorderedPanel>
  );
};
