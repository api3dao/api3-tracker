import React from "react";

import { BorderedPanel } from "../components/BorderedPanel";
import { noDecimals, toCurrency } from "../services/format";
import { type ISupply } from "../services/types";

export const TokenCirculating = (props: ISupply) => {
  return (
    <BorderedPanel big={true} title="Circulating Supply">
      <div className="text-center mb-4">
        <div className="font-bold mb-8 text-3xl">
          {noDecimals(toCurrency(props.circulatingSupply))}
        </div>
        <div className="text-sm text-center leading-8 text-color-cell-title uppercase">
          Total Locked
        </div>
        <div className="font-bold">
          {noDecimals(toCurrency(props.totalLocked))}
        </div>
      </div>
    </BorderedPanel>
  );
};
