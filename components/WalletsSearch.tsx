import React from "react";
import { Debounced } from "../services/debounced";

export interface IWalletsSearchProps {
  value: any;
  onChange: Function;
}

export const WalletsSearch = (props: IWalletsSearchProps) => {
  const placeholder =
    "Enter ENS name, tag or wallet address to find DAO member";
  const onChange = (e: any) => {
    Debounced.start(
      "search",
      () => {
        props.onChange(e.target.value);
      },
      300
    );
  };
  return (
    <div className="max-w-screen-lg mx-auto">
      <input
        className="w-full text-left bg-color-body p-3 text-color-grey rounded border border-1 border-color-text leading-6"
        type="text"
        autoFocus={true}
        defaultValue={props.value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
};
