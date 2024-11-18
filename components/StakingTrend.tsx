import React from "react";
import { Prisma } from "@prisma/client";
import { IStakingTrendProps } from "../services/types";

export const StakingTrend = (props: IStakingTrendProps) => {
  const aprPct = new Prisma.Decimal(props.apr).div(100);
  const isMin = aprPct <= new Prisma.Decimal(0.025);
  const isMax = aprPct >= new Prisma.Decimal(0.75);

  const goingUp =
    new Prisma.Decimal(props.totalStaked) <
    new Prisma.Decimal(props.stakingTarget);
  const dir =
    "text-center p-3 text-sm " +
    (isMin || !goingUp
      ? "text-color-error"
      : !isMax
      ? "text-color-accent"
      : "");

  let note = "";
  if (isMin)
    note = "DAO staking target is reached, and APR is at its minimum of 2.5%";
  else if (isMin)
    note =
      "DAO staking target is not reached, and APR is at its maximum of 75%";
  else if (goingUp && !isMax)
    note =
      "DAO staking target is not reached, so APR will increase by 1% for the next epochs until the target is met or APR reaches 75%";
  else
    note =
      "DAO staking target is reached, so APR will decrease by 1% for the next epochs until APR reaches 2.5%";

  const debugMsg = `apr=${props.apr} staked=${props.totalStaked} target=${props.stakingTarget}`;
  return (
    <div className={dir} title={debugMsg}>
      {note}
    </div>
  );
};
