import React from "react";
import styles from "./BorderedPanel.module.css";

interface IBorderedPanelProps {
  title: string;
  big?: boolean;
  children?: React.ReactNode;
}

export const BorderedPanel = (props: IBorderedPanelProps) => (
  <div className={styles.wrapper}>
    <div className={styles.panel}>
      <div className={styles.box}>
        <div className={styles.left}></div>
        <div className={styles.inner}>
          <div className={styles.title + (props.big ? ' big-title':'')}>{props.title}</div>
          <div className={styles.content}>{props.children}</div>
        </div>
        <div className={styles.right}></div>
      </div>
    </div>
  </div>
);
