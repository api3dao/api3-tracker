import React from "react";
import { toCurrency } from "../services/format";

export interface IFooterProps {
  blockNumber?: number;
  github?: string;
}

export const Footer = (props: IFooterProps) => {
  const { blockNumber, github } = props;
  return (
    <footer>
      <div className="bg-color-body text-color-text md:fixed md:bottom-0 md:left-0 md:z-20 w-full">
        <div className="text-center my-2 text-sm">
          <span className="text-center block leading-6 md:inline md:text-left">
            {" "}
            © 2022 <a href="https://api3.org">API3.org</a>
          </span>
          {github ? (
            <span className="hidden md:inline">&nbsp; | &nbsp;</span>
          ) : null}
          {github ? (
            <span className="text-center block leading-6 md:inline md:text-left">
              <a target="_blank" rel="noreferrer noopener" href={github}>
                Github Source
              </a>
            </span>
          ) : null}
          {blockNumber ? (
            <span className="hidden md:inline">&nbsp; | &nbsp;</span>
          ) : null}
          {blockNumber ? (
            <span className="text-center block leading-6 md:inline md:text-left">
              Last block:{" "}
              <span className="font-bold">{toCurrency(blockNumber)}</span>
            </span>
          ) : null}
        </div>
      </div>
    </footer>
  );
};
