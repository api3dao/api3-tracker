import React from "react";
import { Menu } from "./Menu";

interface IHeader {
  active: string
}

export const Header = (props: IHeader) => {
  return (
    <header className="">
      <div className="inner">
        <div className="nav-brand">
          <span className="nav-brand__label">API3 DAO Tracker</span>
          <span className="nav-brand__slogan">
            <span></span>on-chain analytics: members, staking rewards, API3
            token supply
          </span>
        </div>
        <div className="mid"></div>
        <Menu active={props.active}  />
      </div>
    </header>
  );
};
