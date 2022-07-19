import React from "react";
import styles from "./Footer.module.css";

export const Footer = () => {
  // TODO: last block
  // TODO: source link
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerCopyright}>
          <span></span>
          <span className={styles.mdiv}>
            {" "}
            © 2022 <a href="https://api3.org">API3.org</a>
          </span>
          <span className="desktop-only"> | </span>
          <span className={styles.mdiv}>
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://github.com/api3dao/api3-tracker"
            >
              Github Source
            </a>
          </span>
          <span className="desktop-only"> | </span>
          <span className={styles.mdiv}>Last block: 15,125,158</span>
        </div>
      </div>
    </footer>
  );
};
