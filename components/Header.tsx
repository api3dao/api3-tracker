import React from "react";
import { Menu } from "./Menu";
import styles from './Header.module.css';

interface IHeader {
  active: string;
}

export const Header = (props: IHeader) => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.navBrand}>
          <span className={styles.navBrandLabel}>
            API3 DAO Tracker
          </span>
          <span className={styles.navBrandSlogan}>
            <span></span>on-chain analytics: members, staking rewards, API3
            token supply
          </span>
        </div>
        <div className={styles.middle}></div>
        <Menu active={props.active} />
      </div>
    </header>
  );
};
