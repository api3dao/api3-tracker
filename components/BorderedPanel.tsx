import React from "react";

interface IBorderedPanelProps {
  title: string;
  children?: React.ReactNode;
}

export const BorderedPanel = (props: IBorderedPanelProps) => (
  <div className="bordered-wrapper">
    <div className="bordered-panel">
      <div className="bordered-box">
        <div className="bordered-left"></div>
        <div className="bordered-inner">
          <div className="bordered-title big-title">{props.title}</div>
          <div className="bordered-content">{props.children}</div>
        </div>
        <div className="bordered-right"></div>
      </div>
    </div>
  </div>
);
