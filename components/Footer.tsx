import React from "react";

export const Footer = () => {
  // TODO: last block
  // TODO: source link
  return (
    <footer>
      <div className="inner">
        <div className="copyright">
          <span></span> <span className="mdiv"> © 2022 Enormous Cloud </span>
          <span className="desktop-only"> | </span>
          <span className="mdiv">
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://github.com/EnormousCloud/api3-dao-tracker"
            >
              Github Source
            </a>
          </span>
          <span className="desktop-only"> | </span>
          <span className="mdiv">Last block: 15,125,158</span>
        </div>
      </div>
    </footer>
  );
};
