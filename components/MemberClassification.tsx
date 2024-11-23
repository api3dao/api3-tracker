import React from "react";

interface IBadgerProps {
  badges: string;
}

const classBadge = "rounded text-xs mr-2 px-2 py-0.5 ";
const badges = [
  {
    name: "delegate", /// previously: delegates
    className: "bg-color-warning text-color-body",
    title: "This member is delegated to vote by another member",
  },
  {
    name: "delegator", /// previously: delegates
    className: "bg-color-panel-title text-color-body",
    title: "This member is delegating to another member",
  },
  {
    name: "proposer",
    className: "bg-color-success text-color-body",
    title: "This member created proposals",
  },
  {
    name: "voter",
    className: "bg-color-panel-title text-color-body",
    title: "This member voted for proposals",
  },
  /* {
    name: "vested",
    className: "bg-color-panel-title text-color-body",
    title: "Some shares of this member were vested",
  },
  {
    name: "withdrawn",
    className: "bg-color-error text-color-panel-title",
    title: "Withdrew tokens in the past",
  },
  {
    name: "supporter",
    className: "bg-color-success text-color-body",
    title: "API3 tokens are not vested, member can withdraw, but never did",
  }, */
  {
    name: "unstaking",
    className: "bg-color-panel-title text-color-body",
    title: "Member is unstaking their shares",
  },
  /* {
    name: "deposited",
    className: "bg-color-error text-color-body",
    title: "Tokens were deposited but not staked",
  }, */
];

export const MemberClassification = (props: IBadgerProps) => {
  if (props.badges.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="uppercase text-center text-sm">Member classification</div>
      <ul className="mt-4 ml-4 lg:ml-0">
        {badges.map((b: any) =>
          props.badges.includes(b.name) ? (
            <li
              className="text-sm text-center lg:text-left leading-6 text-color-grey"
              key={b.name}
            >
              <span className={classBadge + b.className}>{b.name}</span> -{" "}
              <span className="text-xs">{b.title}</span>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export const MemberBadges = (props: IBadgerProps) => {
  if (props.badges.length === 0) return null;
  return (
    <div className="leading-2 text-xs">
      {badges.map((b: any) =>
        props.badges.includes(b.name) ? (
          <span title={b.title} key={b.name} className={classBadge + b.className}>{b.name}</span>
        ) : null
      )}
    </div>
  );
};
