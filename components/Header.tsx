import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Menu } from "./Menu";

interface IHeader {
  active: string;
}

const iconMenu = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    style={{ width: 24, height: 24, fill: "var(--color-accent)" }}
    viewBox="0 0 56 56"
  >
    <g>
      <path
        d="M28,0C12.561,0,0,12.561,0,28s12.561,28,28,28s28-12.561,28-28S43.439,0,28,0z M28,54C13.663,54,2,42.336,2,28
		S13.663,2,28,2s26,11.664,26,26S42.337,54,28,54z"
      />
      <path d="M15,17h26c0.553,0,1-0.448,1-1s-0.447-1-1-1H15c-0.553,0-1,0.448-1,1S14.447,17,15,17z" />
      <path d="M45,31H11c-0.553,0-1,0.448-1,1s0.447,1,1,1h34c0.553,0,1-0.448,1-1S45.553,31,45,31z" />
      <path d="M45,23H11c-0.553,0-1,0.448-1,1s0.447,1,1,1h34c0.553,0,1-0.448,1-1S45.553,23,45,23z" />
      <path d="M41,39H15c-0.553,0-1,0.448-1,1s0.447,1,1,1h26c0.553,0,1-0.448,1-1S41.553,39,41,39z" />
    </g>
  </svg>
);

const iconClose = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    style={{ width: 24, height: 24, fill: "var(--color-error)" }}
    viewBox="0 0 122.88 122.88"
  >
    <path
      fillRule="evenodd"
      d="M61.44,0A61.44,61.44,0,1,1,0,61.44,61.44,61.44,0,0,1,61.44,0ZM74.58,36.8c1.74-1.77,2.83-3.18,5-1l7,7.13c2.29,2.26,2.17,3.58,0,5.69L73.33,61.83,86.08,74.58c1.77,1.74,3.18,2.83,1,5l-7.13,7c-2.26,2.29-3.58,2.17-5.68,0L61.44,73.72,48.63,86.53c-2.1,2.15-3.42,2.27-5.68,0l-7.13-7c-2.2-2.15-.79-3.24,1-5l12.73-12.7L36.35,48.64c-2.15-2.11-2.27-3.43,0-5.69l7-7.13c2.15-2.2,3.24-.79,5,1L61.44,49.94,74.58,36.8Z"
    ></path>
  </svg>
);

interface IHeaderState {
  mobileOpen: boolean;
}

export const Header = (props: IHeader) => {
  const [state, setState] = React.useState<IHeaderState>({
    mobileOpen: false,
  });
  const hide = () => {
    setState({ ...state, mobileOpen: false });
  };
  const toggle = () => {
    setState({ ...state, mobileOpen: !state.mobileOpen });
  };
  return (
    <div>
      <header className="fixed bg-color-body w-full z-10 top-0 left-0 lg:pb-1 border-b border-1px border-solid">
        <div className="hidden lg:flex items-center mx-auto max-w-screen-lg">
          <div className="flex flex-col py-2">
            <Link
              href="/"
              className="text-color-menu-active text-5xl py-2 text-center font-bold"
            >
              API3 DAO Tracker
            </Link>
            <span className="text-color-accent text-sm text-left">
              on-chain analytics: members, staking rewards, API3 token supply
            </span>
          </div>
          <div className="flex-1">&nbsp;</div>
          <Menu active={props.active} />
        </div>
        <div className="lg:hidden flex p-3">
          <div className="flex-1">
            <Link href="/" onClick={hide} className="block w-8 h-8">
              <Image
                src="/API3x32-white-iso.png"
                width={32}
                height={32}
                alt="API3 DAO Tracker"
              />
            </Link>
          </div>
          <button
            name="toggle-mobile-menu"
            aria-label="Toggle Mobile Menu"
            onClick={toggle}
          >
            {state.mobileOpen ? iconClose : iconMenu}
          </button>
        </div>
        {state.mobileOpen ? (
          <div className="lg:hidden lg:p-5 border-t border-1px border-solid">
            <Menu active={props.active} />
          </div>
        ) : (
          false
        )}
      </header>
      <div className="my-4 lg:my-14">&nbsp;</div>
    </div>
  );
};
