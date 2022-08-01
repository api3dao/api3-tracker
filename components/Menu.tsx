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
    <div className="lg:flex lg:items-end">
      {menuItems.map((item) => {
        const classHover =
          "hover:text-color-menu-hover hover:border-color-menu-hover";
        const classCommon =
          "block text-center leading-10 lg:inline lg:mx-1 lg:px-2";
        const classFont = "text-bold lg:border-b-4 lg:border-b-solid";

        const classActive =
          "bg-color-menu-active text-color-body lg:bg-transparent lg:text-color-menu-active lg:border-color-menu-active";
        const classInactive = "text-color-grey lg:border-transparent";
        const classFull = [
          classHover,
          classCommon,
          classFont,
          props.active == item.href ? classActive : classInactive,
        ].join(" ");

        return (
          <Link href={item.href} key={item.href}>
            <a className={classFull}>{item.title}</a>
          </Link>
        );
      })}
    </div>
  );
};
