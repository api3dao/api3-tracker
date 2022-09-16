import React from "react";
import { ISupply } from "../services/types";
import { noDecimals, toCurrency } from "../services/format";

export const TokenStaking = (props: ISupply) => {
  const classTitle =
    "text-sm text-center mt-4 pb-2 text-color-cell-title uppercase";
  const classCell =
    "text-sm text-center py-4 lg:min-h-96px border-t border-solid border-color-cell-border";
  const classValue = "font-bold";
  return (
    <div className="sm:grid grid-cols-2">
      <div className={classCell}>
        <div className={classTitle}>Total Staked</div>
        <span className={classValue}>
          {noDecimals(toCurrency(props.totalStaked))}
          <span className="md"> tokens</span>
        </span>
      </div>
      <div className={classCell}>
        <div className={classTitle}>Staking Target</div>
        <span className={classValue}>
          {noDecimals(toCurrency(props.stakingTarget))}
          <span className="md"> tokens</span>
        </span>
      </div>
    </div>
  );
};
