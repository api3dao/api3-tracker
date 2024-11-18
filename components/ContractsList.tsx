import React from "react";
import { IContract } from "../services/types";
import { BorderedPanel } from "./BorderedPanel";
import { Address } from "./Ethscan";

interface IContractsListProps {
  contracts: Array<IContract>;
}

export const ContractsList = (props: IContractsListProps) => (
  <BorderedPanel title="API3 Smart Contracts" big={true}>
    <div className="mt-0 mb-4 py-0">
      <div className="disclaimer mb-2 text-center uppercase text-xs text-color-error">
        Please do not send money to these contracts <br />
        and just use the DAO UI to deposit/stake/vote
      </div>
      {props.contracts.map((contract: IContract) => (
        <div key={contract.name} className="mb-2">
          <label className="text-color-cell-title text-xs font-bold">
            {contract.title}
          </label>
          <Address address={contract.address} />
        </div>
      ))}
    </div>
  </BorderedPanel>
);
