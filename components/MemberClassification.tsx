import React from "react";

interface IBadgerProps {
  badges: string;
}

const classBadge = "rounded text-xs px-2 py-0.5 ";
const badges = [
  {
    name: "vested",
    className: "bg-color-panel-title",
    title: "Some shares of this member were vested",
  },
  {
    name: "delegates",
    className: "bg-color-panel-title",
    title: "This member is delegating his shares to another member",
  },
  {
    name: "ens",
    className: "bg-color-panel-title",
    title: "This member has ENS name",
  },
  {
    name: "voter",
    className: "bg-color-panel-title",
    title: "This member participated in votings",
  },
  {
    name: "withdrawn",
    className: "bg-color-error text-color-panel-title",
    title: "withdrew tokens in the past",
  },
  {
    name: "supporter",
    className: "bg-color-success",
    title: "API3 tokens are not vested, member can withdraw, but never did",
  },
  {
    name: "unstaking",
    className: "bg-color-panel-title",
    title: "Member in the process of unstaking his shares",
  },
  {
    name: "not-staking",
    className: "bg-color-panel-title",
    title: "Tokens were deposited but not staked",
  },
];

export const MemberClassification = (props: IBadgerProps) => {
  if (props.badges.length == 0) return null;
  return (
    <div className="mt-4">
      <div className="uppercase text-center text-sm">Member classification</div>
      <ul className="mt-4">
        {badges.map((b: any) =>
          props.badges.indexOf(b.name) === -1 ? null : (
            <li
              className="text-sm text-left leading-6 text-color-grey"
              key={b.name}
            >
              <span className={classBadge + b.className}>{b.name}</span> -
              {b.title}
            </li>
          )
        )}
      </ul>
    </div>
  );
};
