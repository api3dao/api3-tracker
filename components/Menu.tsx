import React from "react";
import Link from "next/link";

interface IMenuProps {
  active?: string;
}

interface IMenuItem {
  href: string;
  title: string;
}

const menuItems: Array<IMenuItem> = [
  {
    href: "/",
    title: "API3 DAO",
  },
  {
    href: "/rewards",
    title: "Rewards",
  },
  {
    href: "/wallets",
    title: "Wallets",
  },
  {
    href: "/votings",
    title: "Votings",
  },
  {
    href: "/treasury",
    title: "Treasury",
  },
];

export const Menu = (props: IMenuProps) => {
  // TODO: base URL
  return (
    <div className="desktop-menu">
      {menuItems.map((item) => {
        const classExt = props.active == item.href ? " active" : "";
        return (
          <Link href={item.href} key={item.href}>
            <a className={`menu-item${classExt}`}>{item.title}</a>
          </Link>
        );
      })}
    </div>
  );
};
