import React from "react";

export const Row = () => (
  <tr>
    <td className="c">1.</td>
    <td className="c darken dt">2021-08-01 21:50:00</td>
    <td className="c">
      <span className="badge badge-secondary">Secondary</span>
    </td>
    <td className="l">
      <div>
        <a href="votings/s-0">
          <strong>API3 DAO BD-API Team Proposal</strong>
        </a>
      </div>
      <small className="vote-script">
        Transfer{" "}
        <strong style={{ color: "var(--color-panel-title)" }} title="111,363.670000">
          111,363
        </strong>{" "}
        USDC to{" "}
        <a href="wallets/0xcb943e4fb0bcf7ec3c2e6d263c275b27f07701c6">
          0xcb943e4fb0bcf7ec3c2e6d263c275b27f07701c6
        </a>
      </small>
      <div>
        <small className="darken">
          Spent 0.0562095 ETH in fees, Est $148.17
        </small>
      </div>
    </td>
    <td className="r accent">18.877%</td>
    <td className="r"></td>
    <td className="r">
      <span className="badge">Executed </span>
    </td>
  </tr>
);
