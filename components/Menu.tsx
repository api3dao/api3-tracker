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

export const Menu = () => {
  // TODO: base URL
  // TODO: define active from current route
  return (
    <div className="desktop-menu">
      {menuItems.map((item) => (
        <a href={item.href} key={item.href} className="menu-item">
          {item.title}
        </a>
      ))}
    </div>
  );
};
