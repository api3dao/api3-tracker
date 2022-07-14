import React from "react";
import Link from "next/link";
import styles from "./Menu.module.css";

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
    <div className={styles.desktopMenu}>
      {menuItems.map((item) => {
        const classExt = props.active == item.href ? styles.menuItemActive : styles.menuItem;
        return (
          <Link href={item.href} key={item.href}>
            <a className={classExt}>{item.title}</a>
          </Link>
        );
      })}
    </div>
  );
};
