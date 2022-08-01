import React from "react";
import { toCurrency } from "../services/format";

export const Footer = () => {
  // TODO: last block
  // TODO: source link

  const githubLink = "https://github.com/api3dao/api3-tracker";
  const lastBlock = 15125158;
  return (
    <footer className="bg-color-body text-color-text">
      <div className="md:fixed md:bottom-0 md:left-0 md:z-20 w-full">
        <div className="text-center my-2 text-sm">
          <span className="text-center block leading-6 md:inline md:text-left">
            {" "}
            © 2022 <a href="https://api3.org">API3.org</a>
          </span>
          <span className="hidden md:inline">&nbsp; | &nbsp;</span>
          <span className="text-center block leading-6 md:inline md:text-left">
            <a target="_blank" rel="noreferrer noopener" href={githubLink}>
              Github Source
            </a>
          </span>
          <span className="hidden md:inline">&nbsp; | &nbsp;</span>
          <span className="text-center block leading-6 md:inline md:text-left">
            Last block: {toCurrency(lastBlock)}
          </span>
        </div>
      </div>
    </footer>
  );
};
