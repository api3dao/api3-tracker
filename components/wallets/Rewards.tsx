import React from "react";

export const Row = (_props: any) => (
  <tr>
    <td className="c">2,689</td>
    <td className="c">
      <a
        href="https://etherscan.io/tx/0xd29d9e55df72365e1e9b096b8850a6b0f612819d47d1175055c380721dcc8d18#eventlog"
        rel="nofollow noopener noreferrer"
        target="_blank"
      >
        12,828,258
      </a>
    </td>
    <td className="c">2021-07-15 00:15:53</td>
    <td className="r darken">38.75%</td>
    <td className="r darken" title="35,129,025.194755896953608802">
      35,129,025
    </td>
    <td className="r darken" title="261,061.591344590056127846">
      261,061
    </td>
    <td className="r accent">0.7432%</td>
    <td className="r" title="7,500,000.000000000000000000">
      7,500,000
    </td>
    <td className="r accent" title="55,736.301369863013698630">
      55,736
    </td>
    <td className="c">2022-07-14 00:15:53</td>
  </tr>
);

export const History = () => (
  <div className="desktop-only">
    <table className="table epochs-table">
      <thead>
        <tr>
          <th className="c">Epoch</th>
          <th className="c">Block</th>
          <th className="c">Rewards Date</th>
          <th className="r">APR</th>
          <th className="r">Total</th>
          <th className="r">Minted</th>
          <th className="r">Reward</th>
          <th className="r">Shares</th>
          <th className="r">Received</th>
          <th className="c">Release Date</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
);
