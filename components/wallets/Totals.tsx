import React from "react";
import { BorderedPanel } from "../BorderedPanel";

export const Totals = () => (
  <div>
    <div className="dash-row">
      <div className="dash-col dash-col-2">
        <BorderedPanel title="Voting Power">
          <div>
            <div>
              <strong className="accent" title="6,704,660.005414964796034476">
                6,704,660<span className="darken"> shares</span>
              </strong>
            </div>
            <div>
              <strong className="big-title" title="15.740848%">
                15.741%
              </strong>
            </div>
            <div className="darken">of total voting power</div>
            <div>
              <strong title="6,601,511.511758238351460948">
                <span className="darken"> Owning </span>6,601,511
                <span className="darken"> shares</span>
              </strong>
            </div>
          </div>
        </BorderedPanel>
      </div>
      <div className="dash-col dash-col-2">
        <div className="dash-row">
          <div className="dash-col dash-col-3 cell-t">
            <h3 className="cell-title">Deposited</h3>
            <strong className="big-title" title="7,500,000.000000000000000000">
              7,500,000
            </strong>
          </div>
          <div className="dash-col dash-col-3 cell-t">
            <h3 className="cell-title">Withdrawn</h3>
            <strong className="big-title" title="1,100,000.000000000000000000">
              1,100,000
            </strong>
          </div>
          <div className="dash-col dash-col-3 cell-t">
            <h3 className="cell-title">Locked Rewards</h3>
            <strong
              className="big-title accent"
              title="2,083,075.820686403642488309"
            >
              2,083,075
            </strong>
          </div>
        </div>
        <h3 className="cell-title border-t">Member Classification</h3>
        <ul className="badges">
          <li>
            <span
              className="badge badge-vested"
              title="Some shares of this member are vested"
            >
              vested
            </span>
            <span className="darken">
              {" "}
              - Some shares of this member are vested
            </span>
          </li>
          <li>
            <span
              className="badge badge-withdrawn"
              title="Withdrew tokens in the past"
            >
              withdrawn
            </span>
            <span className="darken"> - Withdrew tokens in the past</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);
