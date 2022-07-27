import React from "react";

interface IBorderedPanelProps {
  title: string;
  big?: boolean;
  children?: React.ReactNode;
}

export const BorderedPanel = (props: IBorderedPanelProps) => {
  const classTitle =
    "px-5 -translate-y-1/2 " +
    "flex items-center justify-center " +
    "text-color-panel-title whitespace-nowrap " +
    (props.big ? "text-2xl " : "text-lg");
  return (
    <div className="my-8">
      <div className="flex justify-center my-0">
        <div className="w-8 min-w-16px border border-solid border-color-panel-border border-r-0">&nbsp;</div>
        <div className="flex flex-col min-w-220px">
          <div className={classTitle}>{props.title}</div>
          <div>{props.children}</div>
        </div>
        <div className="w-8 min-w-16px border border-solid border-color-panel-border border-l-0"></div>
      </div>
    </div>
  );
};
