import React from "react";
import { TxIcon } from "../Ethscan";

export const Row = () => (
  <tr>
    <td className="c">2.</td>
    <td className="c darken dt">2021-08-01 21:50:00</td>
    <td className="c">
      <a
        href="https://etherscan.io/tx/0xf7c79b1b78ef7bc5691ffd1b0f75a955f9be5d323f674e8a822e5b76b2b7df56#eventlog"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        12,942,126
      </a>
    </td>
    <td className="c darken entry">CastVote</td>
    <td className="l">
      <div className="eth-address">
        <span>
          <a
            style={{ display: "inline-block", marginRight: 10 }}
            href="wallets/0x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a"
          >
            <div>
              <span className="badges">
                <span
                  className="badge badge-vested"
                  title="Some shares of this member are vested"
                >
                  vested
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
            <div>0x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a</div>
          </a>
          <TxIcon txId="0x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a" />
        </span>
      </div>
      <div>
        <small className="darken">
          Gas Used: 473402, Gas Price: 33 GWei, Est $39.7
        </small>
      </div>
    </td>
    <td className="c">Supports</td>
    <td className="r" title="1,000,000.000000000000000000">
      1,000,000
    </td>
    <td className="r darken shares-pct">2.254%</td>
  </tr>
);


export const History = () => (
  <div className="desktop-only">
<table className="table table-events">
<thead><tr><th className="c">#</th><th className="c">Date</th><th className="c">Block Number</th><th className="c">Event</th><th className="l">User</th><th className="l">Cast</th><th className="l">Shares</th><th className="l">%</th></tr></thead>
<tbody></tbody>
</table>
</div>
);
