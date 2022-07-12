import React from "react";

export const Row = () => (
  <tr>
    <td className="c">1.</td>
    <td className="c darken dt">2021-07-08 12:55:02</td>
    <td className="c">
      <a
        href="https://etherscan.io/tx/0x220c79795306ee0f8fb9ca396d3cf2713ce2771af339678c1d08d7bd5c196da4#eventlog"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        12,786,816
      </a>
    </td>
    <td className="l entry darken">
      <div>
        <span>
          <strong style={{ color: "var(--color-panel-title)" }}>
            Delegated{" "}
          </strong>
          <span> </span>
          <span>
            from:{" "}
            <a href="wallets/0x915c0b8e03d8f6b2a18e6032edd896061db40a31">
              0x915c0b8e03d8f6b2a18e6032edd896061db40a31
            </a>
          </span>
          <span> shares: </span>
          <strong
            style={{ color: "var(--color-panel-title)" }}
            title="1.000000000000000000"
          >
            1
          </strong>
          <span> total_delegated_to: </span>
          <strong
            style={{ color: "var(--color-panel-title)" }}
            title="1.000000000000000000"
          >
            1
          </strong>
        </span>
      </div>
      <div>
        <small className="darken">
          Gas Used: 146354, Gas Price: 27 GWei, Est $9.32
        </small>
      </div>
    </td>
  </tr>
);

export const History = () => (
  <div>
    <div className="desktop-only">
      <table className="table events-table">
        <thead>
          <tr>
            <th className="c">#</th>
            <th className="c">Date</th>
            <th className="c" style={{ whiteSpace: "nowrap", width: 133 }}>
              Block #
            </th>
            <th className="l">Event</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
);
