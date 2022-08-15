import React from "react";
import { IVoting } from "./../services/api3";
import Link from "next/link";
import { niceDateTime, toPct } from "./../services/format";

export interface IVotingListProps {
  list: Array<IVoting>;
}

export const VotingsListThead = () => (
  <thead>
    <tr>
      <th className="c">#</th>
      <th className="c">Start Date</th>
      <th className="c">Type</th>
      <th className="l">Title</th>
      <th className="r">For</th>
      <th className="r">Against</th>
      <th className="r">Executed</th>
    </tr>
  </thead>
);

interface IVotingItem {
  index: number;
  item: IVoting;
}

export const VotingsListTr = (props: IVotingItem) => {
  const { index, item } = props;
  return (
    <tr>
      <td className="text-center">{1 + index}.</td>
      <td className="text-center">{niceDateTime(item.createdAt)}</td>
      <td className="text-center">
        <span
          className={
            item.vt == "Primary"
              ? "badge badge-primary"
              : "badge badge-secondary"
          }
        >
          {item.vt}
        </span>
      </td>
      <td className="text-left">
        <Link href={`/votings/${item.id}`} className="text-bold">
          {item.name}
        </Link>
      </td>
      <td className="text-right accent">
        {item.totalFor.toNumber() > 0 ? (
          <span>
            {toPct(item.totalFor.mul(100).div(item.totalStaked).round())}
          </span>
        ) : null}
      </td>
      <td className="text-right danger">
        {item.totalAgainst.toNumber() > 0 ? (
          <span>
            {toPct(item.totalAgainst.mul(100).div(item.totalStaked).round())}
          </span>
        ) : null}
      </td>
      <td className="text-right">
        <span className="badge"> {item.status}</span>
      </td>
    </tr>
  );
};

export const VotingsList = (props: IVotingListProps) => {
  return (
    <div>
      <div className="max-w-screen-lg mx-auto hidden lg:block">
        <table className="table invisible lg:visible">
          <VotingsListThead />
          <tbody>
            {props.list.map((item, index) => (
              <VotingsListTr key={item.id} item={item} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
