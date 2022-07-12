import React from "react";
import { BorderedPanel } from "../BorderedPanel";
import { TxIcon } from "../Ethscan";

export const Box = () => (
  <BorderedPanel title="Primary Treasury">
    <div style={{ textAlign: "center", marginBottom: 20}}>
      <span className="darken">0x556e…3ce0 </span>
      <TxIcon txId="0x556ecbb0311d350491ba0ec7e019c354d7723ce0" />
    </div>
    <div>
      <div style={{ marginBottom: 20}}>
        <h3 className="cell-title">
          API3
        </h3>
        <div>
          <strong className="darken big-title" title="0">
            0
          </strong>
        </div>
      </div>
      <div>
        <h3 className="cell-title">
          USDC
        </h3>
        <div>
          <strong className="big-title" title="18,386,610.393974">
            18,386,610
          </strong>
        </div>
      </div>
    </div>
  </BorderedPanel>
);
