import React from "react";
import { BorderedPanel } from "./BorderedPanel";
import { InternalAddress } from "./../components/Ethscan";
import {
  toPct4,
  toHex,
  niceDateTime,
  noDecimals,
  toCurrency,
} from "../services/format";
import { Prisma } from "@prisma/client";
import { IDelegation } from "../services/types";
import { TxIcon } from "../components/Ethscan";

export interface IWalletDelegationProps {
  from: Array<IDelegation>;
  to: Array<IDelegation>;
  userIsDelegated: Prisma.Decimal;
}
export const WalletDelegationThead = () => (
  <thead>
    <tr>
      <th className="text-center">#</th>
      <th className="text-center" style={{ minWidth: "70px" }}>
        Date
      </th>
      <th className="text-center">From</th>
      <th className="text-center">Shares</th>
    </tr>
  </thead>
);

export const WalletDelegationTr = (props: any) => {
  const { index } = props;
  const row: IDelegation = props.row;
  return (
    <tr>
      <td className="text-center">{(index || 0) + 1}.</td>
      <td className="text-center text-sm darken">
        {" "}
        {niceDateTime(row.updatedAt)}{" "}
      </td>
      <td className="text-center">
        <InternalAddress className="text-xs" address={row.from} />
      </td>
      <td className="text-right">{noDecimals(toCurrency(row.userShares))}</td>
    </tr>
  );
};
export const WalletDelegation = (props: IWalletDelegationProps) => {
  const { from, to } = props;
  const toNZ = to.filter((x: any) => x.userShares != new Prisma.Decimal(0));
  return (
    <div className="max-w-screen-lg text-center mx-auto">
      {from.length > 0 ? (
        <div className="text-xl text-center text-color-panel-title">
          This member delegates his {noDecimals(toCurrency(from[0].userShares))}{" "}
          shares to{" "}
          <InternalAddress
            className="text-xs"
            inline={true}
            address={from[0].to}
          />{" "}
        </div>
      ) : null}
      {to.length > 0 ? (
        <div className="text-color-panel-title">
          <h2 className="text-xl font-bold text-center">
            This member is delegated{" "}
            {noDecimals(toCurrency(props.userIsDelegated))}
            {" shares by "}
            {toNZ.length} members
          </h2>
          <table className="table invisible lg:visible">
            <WalletDelegationThead />
            <tbody>
              {to.map((row: IDelegation, index: number) => (
                <WalletDelegationTr key={index} index={index} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};
