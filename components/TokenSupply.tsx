import React from "react";

import { noDecimals, toCurrency } from "../services/format";
import { type ISupply } from "../services/types";

export const TokenSupply = (props: ISupply) => {
  const classTitle = "text-sm text-center pb-2 text-color-cell-title uppercase";
  const classCell = "text-sm text-center py-2 lg:min-h-96px";
  return (
    <div className="md:grid grid-cols-2 mx-auto">
      <div className={classCell}>
        <h3 className={classTitle}>Locked by governance</h3>
        <strong>{noDecimals(toCurrency(props.lockedByGovernance))}</strong>
      </div>
      <div className={classCell}>
        <h3 className={classTitle}>Locked rewards</h3>
        <strong>{noDecimals(toCurrency(props.lockedRewards))}</strong>
      </div>
    </div>
  );
};
