import React from "react";

import { noDecimals, toCurrency } from "../services/format";
import { type ISupply } from "../services/types";

export const TokenSupply = (props: ISupply) => {
  const classTitle =
    "text-sm text-center mt-4 pb-2 text-color-cell-title uppercase";
  const classCell =
    "text-sm text-center py-4 lg:min-h-96px border-t border-solid border-color-cell-border";
  return (
    <div className="md:grid grid-cols-3 mx-auto">
      <div className={classCell}>
        <h3 className={classTitle}>Locked by governance</h3>
        <strong>
          {noDecimals(toCurrency(props.lockedByGovernance))} tokens
        </strong>
      </div>
      <div className={classCell}>
        <h3 className={classTitle}>Locked vestings</h3>
        <strong>{noDecimals(toCurrency(props.lockedVestings))} tokens</strong>
      </div>
      <div className={classCell}>
        <h3 className={classTitle}>Locked rewards</h3>
        <strong>{noDecimals(toCurrency(props.lockedRewards))} tokens</strong>
      </div>
    </div>
  );
};
