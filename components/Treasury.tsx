import React from "react";

import { BorderedPanel } from "../components/BorderedPanel";
import { TxIcon } from "../components/Ethscan";
import { shorten, noDecimals, toCurrency } from "../services/format";
import { type ITreasury } from "../services/types";

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
          <h3 className="text-sm text-color-cell-title">API3</h3>
          <div className="text-center text-bold text-3xl">
            {noDecimals(toCurrency(props.valueAPI3))}
          </div>
        </div>
        <div className="text-center my-5">
          <h3 className="text-sm text-color-cell-title">USDC</h3>
          <div className="text-center text-bold text-3xl">
            {noDecimals(toCurrency(props.valueUSDC))}
          </div>
        </div>
        <div className="text-center my-5">
          <h3 className="text-sm text-color-cell-title">ETH</h3>
          <div className="text-center text-bold text-3xl">
            {noDecimals(toCurrency(props.valueETH))}
          </div>
        </div>
      </div>
    </BorderedPanel>
  );
};
