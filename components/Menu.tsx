import React from "react";

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
          <a
            href={item.href}
            key={item.href}
            className={`menu-item${classExt}`}
          >
            {item.title}
          </a>
        );
      })}
    </div>
  );
};
