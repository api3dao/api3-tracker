import React from "react";
import { IVoting } from "./../services/api3";
import Link from "next/link";
import { toPct } from "./../services/format";

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

export const VotingsListTr = (row: IVoting) => (
  <tr>
    <td className="text-center">{row.id}.</td>
    <td className="text-center">{row.createdAt.toISOString()}</td>
    <td className="text-center">
      <span
        className={
          row.vt == "Primary" ? "badge badge-primary" : "badge badge-secondary"
        }
      >
        {row.vt}
      </span>
    </td>
    <td className="text-left">
      <Link href={`votings/${row.id}`} className="text-bold">
        {row.name}
      </Link>
    </td>
    <td className="text-right accent">
      {row.totalFor.toNumber() > 0 ? (
        <span>{toPct(row.totalFor.div(row.totalStaked))}</span>
      ) : null}
    </td>
    <td className="text-right danger">
      {row.totalAgainst.toNumber() > 0 ? (
        <span>{toPct(row.totalAgainst.div(row.totalStaked))}</span>
      ) : null}
    </td>
    <td className="text-right">
      <span className="badge"> {row.status}</span>
    </td>
  </tr>
);

export const VotingsList = (props: IVotingListProps) => {
  return (
    <div>
      <table className="table invisible lg:visible">
        <VotingsListThead />
        <tbody>
          {props.list.map((row) => (
            <VotingsListTr key={row.id} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
