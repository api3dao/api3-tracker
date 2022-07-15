import React from "react";
import { IContract } from "../services/webconfig";
import styles from "./ContractsList.module.css";
import { BorderedPanel } from "./BorderedPanel";
import { Address } from "./Ethscan";

interface IContractsListProps {
  contracts: Array<IContract>;
}

export const ContractsList = (props: IContractsListProps) => (
  <BorderedPanel title="API3 Smart Contracts" big={true}>
    <ul className={styles.ul}>
      {props.contracts.map((contract: IContract) => (
        <li key={contract.name} className={styles.li}>
          <label className={styles.title}>{contract.title}</label>
          <Address address={contract.address} />
        </li>
      ))}
    </ul>
  </BorderedPanel>
);
