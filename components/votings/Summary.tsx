import React from "react";

interface IGroupProps {
  title: string;
  emptyText?: string;
  items?: any;
}

export const Group = (_props: IGroupProps) => {
  // TODO: use Row with strong type
  return <div className="desktop-only"></div>;
};

export const Summary = (props: any) => {
  const votings = props.votings || [];
  return votings.length == 0 ? (
    <div className="votings-groups">
      <Group
        title="Pending Proposals"
        emptyText="There are no pending proposals"
      />
      <Group
        title="Executed Proposals"
        emptyText="There are no executed proposals"
      />
      <Group title="Invalid Proposals" />
      <Group
        title="Rejected Proposals"
        emptyText="There are no rejected proposals"
      />
    </div>
  ) : (
    <div className="votings-empty">
      {" "}
      There were no votings in the DAO so far{" "}
    </div>
  );
};
