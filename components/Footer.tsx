import React from "react";

import { toCurrency } from "../services/format";

export interface IFooterProps {
  blockNumber?: number;
  github?: string;
  terms?: string;
  showGas: boolean;
  changeGas: Function;
}

export const Footer = (props: IFooterProps) => {
  const { blockNumber, github, terms } = props;
  const year = new Date().getFullYear();
  // const onToggleGas = () => { localStorage.setItem("GAS", showGas ? "HIDDEN" : "VISIBLE"); props.changeGas(!showGas); };
  return (
    <footer>
      <div className="bg-color-body border-t border-2px border-solid border-color-cell-border text-color-text md:fixed md:bottom-0 md:left-0 md:z-20 w-full">
        <div className="text-center my-2 text-sm">
          <span className="xs:py-4 sm:py-0 xs:text-xl sm:text-sm text-center block leading-6 md:inline md:text-left">
            {" "}
            © {year} <a href="https://api3.org">API3.org</a>
          </span>
          {terms ? (
            <span className="hidden md:inline">&nbsp; | &nbsp;</span>
          ) : null}
          {terms ? (
            <span className="text-center block leading-6 md:inline md:text-left">
              <a
                className="xs:py-4 sm:py-0 xs:text-xl sm:text-sm"
                target="_blank"
                rel="noreferrer noopener"
                href={terms}
              >
                Terms
              </a>
            </span>
          ) : null}
          {github ? (
            <span className="hidden md:inline">&nbsp; | &nbsp;</span>
          ) : null}
          {github ? (
            <span className="text-center block leading-6 md:inline md:text-left">
              <a
                className="xs:py-4 sm:py-0 xs:text-xl sm:text-sm"
                target="_blank"
                rel="noreferrer noopener"
                href={github}
              >
                Github Source
              </a>
            </span>
          ) : null}
          {blockNumber ? (
            <span className="hidden md:inline">&nbsp; | &nbsp;</span>
          ) : null}
          {blockNumber ? (
            <span className="xs:py-4 sm:py-0 xs:text-xl sm:text-sm text-center block leading-6 md:inline md:text-left">
              Last block:{" "}
              <span className="font-bold">{toCurrency(blockNumber)}</span>
            </span>
          ) : null}
        </div>
      </div>
    </footer>
  );
};
