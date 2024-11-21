import { Prisma } from "@prisma/client";
import React from "react";

import { type IStakingTrendProps } from "../services/types";

export const StakingTrend = (props: IStakingTrendProps) => {
  const aprPct = new Prisma.Decimal(props.apr).div(100);
  const isMin = aprPct <= new Prisma.Decimal(0.025);
  const isMax = aprPct >= new Prisma.Decimal(0.75);

  const stakedLessThanTarget =
    new Prisma.Decimal(props.totalStaked) <
    new Prisma.Decimal(props.stakingTarget);

  let dir = "text-center p-3 text-sm ";
  if (isMin || !stakedLessThanTarget) {
    dir += "text-color-error";
  } else if (isMax) {
    dir += "";
  } else {
    dir += "text-color-accent";
  }

  let note = "";
  note = stakedLessThanTarget ? "DAO staking target is not reached" : "DAO staking target is reached";
  if (isMin) {
    note += ", and APR is at its minimum of 2.5%";
  } else if (isMax) {
    note += ", and APR is at its maximum of 75%";
  } else {
    note += ", so APR will ";
    note += stakedLessThanTarget ? "increase by 1% for the next epochs until the target is met or APR reaches 75%" : "decrease by 1% for the next epochs until APR reaches 2.5%";
  }

  const debugMsg = `apr=${props.apr} staked=${props.totalStaked} target=${props.stakingTarget}`;
  return (
    <div className={dir} title={debugMsg}>
      {note}
    </div>
  );
};
