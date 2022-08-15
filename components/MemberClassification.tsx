import React from "react";

interface IBadgerProps {
  badges: string;
}

const classBadge = "rounded text-xs px-2 py-0.5 ";
const badges = [
  {
    name: "vested",
    className: "bg-color-panel-title",
    title: "Some shares of this member are vested",
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
];

export const MemberClassification = (props: IBadgerProps) => {
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
