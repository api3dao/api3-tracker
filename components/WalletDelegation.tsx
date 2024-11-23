import { Prisma } from "@prisma/client";
import React from "react";

import { niceDateTime, noDecimals, toCurrency } from "../services/format";
import { type IDelegation } from "../services/types";

import { InternalAddress } from "./../components/Ethscan";

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
      <th className="text-center">Delegates</th>
    </tr>
  </thead>
);

export const WalletDelegationTr = (props: any) => {
  const { index } = props;
  const {row} = props;
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

export const WalletDelegationRow = (props: any) => {
  const { index } = props;
  const {row} = props;
  return (
    <li className="border-b border-color-grey py-2">
      <div className="flex mr-5 ml-5">
        <div className="text-center text-xs w-8">{(index || 0) + 1}.</div>
        <div className="flex-1 text-xs text-left darken">
          {" "}
          {niceDateTime(row.updatedAt)}{" "}
        </div>
        <div className="text-right text-xs font-bold">
          {noDecimals(toCurrency(row.userShares))}
        </div>
      </div>
      <div className="text-center">
        <InternalAddress className="text-xs" address={row.from} />
      </div>
    </li>
  );
};
export const WalletDelegation = (props: IWalletDelegationProps) => {
  const { from, to } = props;
  const toNZ = to.filter((x: any) => x.userShares != new Prisma.Decimal(0));
  return (
    <div className="text-center mx-auto">
      {from.length > 0 ? (
        <div className="text-sm sm:mb-5 lg:text-xl text-center text-color-panel-title">
          This member delegates to{" "}
          <InternalAddress
            className="text-xs"
            inline={true}
            address={from[0].to}
          />{" "}
        </div>
      ) : null}
      {to.length > 0 ? (
        <div className="text-color-panel-title">
          <h2 className="text-sm lg:text-xl font-bold text-center">
            This member is delegated to{" "}
            {" by "}
            {toNZ.length} members
          </h2>
          <div className="block sm:hidden">
            <ol className="border-t border-color-grey mt-4">
              {to.map((row: IDelegation, index: number) => (
                <WalletDelegationRow key={index} index={index} row={row} />
              ))}
            </ol>
          </div>
          <div className="max-w-screen-lg lg:mx-auto hidden sm:block sm:mx-5">
            <table className="table">
              <WalletDelegationThead />
              <tbody>
                {to.map((row: IDelegation, index: number) => (
                  <WalletDelegationTr key={index} index={index} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="sm:mb-1 text-xs">&nbsp;</div>
      )}
    </div>
  );
};
