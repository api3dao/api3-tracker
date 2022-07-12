import React from "react";

export const Row = () => (
  <tr>
    <td className="c">1.</td>
    <td className="c darken dt">2021-07-08 12:55:02</td>
    <td className="c darken dt">2022-07-06 13:49:38</td>
    <td className="l">
      <div className="l eth-address">
        <a href="wallets/0x5846711b4b7485392c1f0feaec203aa889071717">
          <div>
            <span className="badges">
              <span
                className="badge badge-vested"
                title="Some shares of this member are vested"
              >
                vested
              </span>
              <span
                className="badge badge-withdrawn"
                title="Withdrew tokens in the past"
              >
                withdrawn
              </span>
            </span>
            <strong className="ens">bbenligiray.eth</strong>
          </div>
          <div>0x5846711b4b7485392c1f0feaec203aa889071717</div>
        </a>
      </div>
      <div>
        <small className="darken">
          Spent 0.487919 ETH in fees, Est $1547.67
        </small>
      </div>
    </td>
    <td className="r enough_power" title="6,704,660.005414964796034476">
      6,704,660
    </td>
    <td title="15.740848" className="r enough_power">
      15.741%
    </td>
    <td className="r darken" title="6,601,511.511758238351460948">
      6,601,511
    </td>
    <td className="r" title="2,083,075.820686403642488309">
      2,083,075
    </td>
  </tr>
);
