import React from "react";

export const Delegated = () => (
  <tr>
    <td className="l">
      <span>
        <a
          style={{ display: "inline-block", marginRight: 10 }}
          href="wallets/0x00704fe459dd9ea5b23a2254333a8dce5485b6d1"
        >
          <div>
            <span className="badges">
              <span
                className="badge badge-withdrawn"
                title="Withdrew tokens in the past"
              >
                withdrawn
              </span>
              <span
                className="badge badge-delegates"
                title="Delegates his stake to another member"
              >
                delegates
              </span>
            </span>
            <span></span>
          </div>
          <div>0x00704fe459dd9ea5b23a2254333a8dce5485b6d1</div>
        </a>
      </span>
    </td>
    <td className="r" title="581.623991795650317975">
      581
    </td>
  </tr>
);
