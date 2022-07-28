import { Prisma } from "@prisma/client";

export interface IEpoch {
  isCurrent: number;
  epoch: number; // id of epoch
  createdAt: string; // date of epoch event
  apr: Prisma.Decimal; // APR during this epoch
  rewardsPct: Prisma.Decimal;
  members: number; // Number of members
  totalStake: Prisma.Decimal; // Total stake
  stakedRewards: Prisma.Decimal;
  totalShares: Prisma.Decimal; // Total shares
  mintedShares: Prisma.Decimal; // # of minted tokens
  releaseDate: string; // Date when minted tokens will be released

  blockTx?: string;
  blockNumber?: number;
}

export interface ISupply {
  blockNumber: BigInt;
  circulatingSupply: Prisma.Decimal;

  totalLocked: Prisma.Decimal;
  totalStaked: Prisma.Decimal;
  stakingTarget: Prisma.Decimal;

  lockedByGovernance: Prisma.Decimal;
  lockedVestings: Prisma.Decimal;
  lockedRewards: Prisma.Decimal;
  timeLocked: Prisma.Decimal;
}

export interface IStakingTrendProps {
  apr: Prisma.Decimal;
  totalStaked: Prisma.Decimal;
  stakingTarget: Prisma.Decimal;
}

export interface ITreasury {
  // title of the treasury
  title: string;
  // address of the treasury
  address: string;
  valueAPI3?: Prisma.Decimal;
  valueUSDC?: Prisma.Decimal;
}

export interface IVoting {
  id: string;
  vt: string;
  createdAt: Date;
  name: string;
  description?: string;
  transferValue?: Prisma.Decimal;
  transferToken?: string;
  transferAddress?: string; // can be "invalid"
  transferStatus?: string; // can be "invalid"
  totalGasUsed?: number;
  totalUsd?: number;
  status: string; // expired, executed, rejected
  totalFor: Prisma.Decimal;
  totalAgainst: Prisma.Decimal;
  totalStaked: Prisma.Decimal;
  totalRequired: Prisma.Decimal;
}

export interface IWallet {
  address: string;
  ensName: string; // ENS domain name
  ensUpdated: Date;
  badges: string;
  userShare: Prisma.Decimal;
  userStake: Prisma.Decimal; // number of user stake at the moment of this epoch
  userVotingPower: Prisma.Decimal; // user voting power at this epoch
  userReward: Prisma.Decimal; // user reqard for this epoch
  userLockedReward: Prisma.Decimal; // how much of the reward is still locked
  userDeposited: Prisma.Decimal;
  userWithdrew: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletEvent {
  id: string;
  createdAt: Date;
  txHash: string;
  blockNumber: number;
  txIndex?: number;
  logIndex?: number;
  data: string;
  eventName: string;
  fee?: number;
  gasPrice?: number;
  gasUsed?: number;
  feeUsd?: number;
}

export interface IVotingEvent {
  id: string;
  createdAt: Date;
  txHash: string;
  blockNumber: number;
  txIndex?: number;
  logIndex?: number;
  data: string;
  eventName: string;
  fee?: number;
  gasPrice?: number;
  gasUsed?: number;
  feeUsd?: number;

  address?: string;
  ensName?: string;
  supports?: number;
  userShare?: Prisma.Decimal;
  userVotingPower?: Prisma.Decimal;
}
