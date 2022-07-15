export interface IEpoch {
  isCurrent: boolean;
  epoch: number; // id of epoch
  createdAt: Date; // date of epoch event
  apr: number; // APR during this epoch
  members: number; // Number of members
  totalStake: number; // Total stake
  totalShares: number; // Total shares
  mintedShares: number; // # of minted tokens
  releaseDate: Date; // Date when minted tokens will be released
}

export interface ISupply {
  blockNumber: number;
  circulatingSupply: number;

  totalLocked: number;
  totalStaked: number;
  stakingTarget: number;

  lockedByGovernance: number;
  lockedVestings: number;
  lockedRewards: number;
  timeLocked: number;
}

export interface IStakingTrendProps {
  apr: number;
  totalStaked: string;
  stakingTarget: string;
}

export interface ITreasury {
  title: string;
  address: string;
  valueAPI3: number;
  valueUSDC: number;
}
