import React from "react";

interface IBadgerProps {
  badges: string;
}

const classBadge = "rounded text-xs mr-2 px-2 py-0.5 ";
const badges = [
  {
    name: "vested",
    className: "bg-color-panel-title text-color-body",
    title: "Some shares of this member were vested",
  },
  {
    name: "delegates",
    className: "bg-color-panel-title text-color-body",
    title: "This member is delegating his shares to another member",
  },
  {
    name: "ens",
    className: "bg-color-panel-title text-color-body",
    title: "This member has ENS name",
  },
  {
    name: "voter",
    className: "bg-color-panel-title text-color-body",
    title: "This member participated in votings",
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
  },
  {
    name: "unstaking",
    className: "bg-color-panel-title text-color-body",
    title: "Member in the process of unstaking his shares",
  },
  /* {
    name: "deposited",
    className: "bg-color-error text-color-body",
    title: "Tokens were deposited but not staked",
  }, */
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
              <span className={classBadge + b.className}>{b.name}</span> -{" "}
              <span className="text-xs">{b.title}</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export const MemberBadges = (props: IBadgerProps) => {
  if (props.badges.length == 0) return null;
  return (
    <div className="leading-2 text-xs">
      {badges.map((b: any) =>
        props.badges.indexOf(b.name) === -1 ? null : (
          <span key={b.name} className={classBadge + b.className}>{b.name}</span>
        )
      )}
    </div>
  );
};
