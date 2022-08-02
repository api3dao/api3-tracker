import React from "react";
import { IStakingTrendProps } from "../services/api3";

export const StakingTrend = (props: IStakingTrendProps) => {
  const isMin = props.apr <= 0.025;
  const isMax = props.apr >= 0.75;
  const goingDown = props.totalStaked > props.stakingTarget;
  const dir = "text-center p-3 text-sm " + (
    isMax || isMin ? "text-color-text" : goingDown ? "text-color-error" : "text-color-accent"
  );

  let note = "";
  if (isMin)
    note = "DAO staking target is reached, and APR is at its minimum of 2.5%";
  else if (isMin)
    note =
      "DAO staking target is not reached, and APR is at its maximum of 75%";
  else if (goingDown)
    note =
      "DAO staking target is not reached, so APR will be increased by 1% for the next epoch until it reaches 75%";
  else
    note =
      "DAO staking target is reached, so APR will be decreased by 1% for the next epoch until it reaches 2.5%";

  const debugMsg = `apr=${props.apr} staked=${props.totalStaked} target=${props.stakingTarget}`;
  return (
    <div className={dir} title={debugMsg}>
      {note}
    </div>
  );
};
