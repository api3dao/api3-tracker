import React from "react";
import { BorderedPanel } from "./BorderedPanel";
import { noDecimals, toCurrency } from "../services/format";
import { IVoting } from "../services/types";
import { Address } from "./Ethscan";

const ucFirst = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const VotingSummary = (props: IVoting) => {
  const title = `API3 DAO ${ucFirst(props.status)} Proposal`;
  let statusClass =
    "text-4xl py-6 my-10 text-align uppercase border border-solid border-color-border";
  let statusText = "";
  if (props.status == "Executed") {
    statusClass += " text-color-accent";
    statusText = "Accepted and Executed";
  }
  if (props.status == "Accepted") {
    statusClass += " text-color-accent";
    statusText = "Passing, not executed";
  }

  return (
    <div className="text-center my-10">
      <h1 className="text-4xl text-color-panel-title uppercase">
        {props.name}
      </h1>
      <h2 className="text-2xl my-8 font-bold text-color-grey text-center">
        {title}
      </h2>
      <p className="text-sm my-8 w-full text-center text-color-grey">
        {props.description}
      </p>
      {props.transferToken ? (
        <div className="my-8 text-sm text-color-grey">
          Transfer{" "}
          <span className="font-bold text-color-grey">
            {noDecimals(toCurrency(props.transferValue))}
          </span>{" "}
          {props.transferToken}{" "}
           to{" "}
          <Address inline={true} className="font-bold text-color-grey" address={props.transferAddress} />
        </div>
      ) : null}
      {statusText ? <div className={statusClass}>{statusText}</div> : null}
      <div className="my-8 min-w-full lg:grid lg:grid-cols-2 lg:justify-center">
        <div className="mx-auto lg:ml-auto lg:mr-5">
          <BorderedPanel title="For" big={true}>
            {props.totalFor.toNumber() > 0 ? (
              <div className="my-10 mt-3">
                {" "}
                <div className="font-bold text-4xl">
                  {noDecimals(toCurrency(props.totalFor))}
                </div>
                <div className="text-sm text-color-grey my-2">
                  votes supported this proposal
                </div>
                <div className="font-bold text-sm">
                  {props.totalFor.mul(100).div(props.totalStaked).toFixed(4)}%
                </div>
              </div>
            ) : (
              <div className="my-20 mt-12 text-sm darken">
                Nobody voted for
              </div>
            )}
          </BorderedPanel>
        </div>
        <div className="lg:max-w-300px">
          <BorderedPanel title="Against" big={true}>
            {props.totalAgainst.toNumber() > 0 ? (
              <div className="my-10 mt-3">
                <div className="font-bold text-4xl">
                  {noDecimals(toCurrency(props.totalAgainst))}
                </div>
                <div className="text-sm text-color-grey my-2">
                  votes against this proposal
                </div>
                <div className="font-bold text-sm">
                  {props.totalAgainst.mul(100).div(props.totalStaked).toFixed(4)}%
                </div>
              </div>
            ) : (
              <div className="my-20 mt-12 text-color-grey text-sm">
                Nobody voted against
              </div>
            )}
          </BorderedPanel>
        </div>
      </div>
      <div className="my-4 text-sm text-color-grey">
        At the time of the proposal DAO had{" "}
        <span className="font-bold text-color-panel-title">
          {noDecimals(toCurrency(props.totalStaked))}
        </span>{" "}
        shares staked,{" "}
        <span className="font-bold text-color-panel-title">
          {noDecimals(toCurrency(props.totalRequired))}
        </span>{" "}
        shares are required for this proposal to be accepted
      </div>

      <div className="my-4 text-sm text-color-grey">
        Spent{" "}
        <span className="font-bold text-color-panel-title">
          {toCurrency(props.totalGasUsed)}
        </span>{" "}
        ETH in fees, Est{" "}
        <span className="font-bold text-color-panel-title">
          ${toCurrency(props.totalUsd)}
        </span>
      </div>
    </div>
  );
};
