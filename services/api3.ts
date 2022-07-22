import { Prisma } from '@prisma/client'

export interface IEpoch {
  isCurrent: number;
  epoch: number; // id of epoch
  createdAt: string; // date of epoch event
  apr: Prisma.Decimal; // APR during this epoch
  rewardsPct: Prisma.Decimal;
  members: number; // Number of members
  totalStake: number; // Total stake
  stakedRewards: number;
  totalShares: number; // Total shares
  mintedShares: number; // # of minted tokens
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
  apr: number;
  totalStaked: number;
  stakingTarget: number;
}

export interface ITreasury {
  title: string;
  address: string;
  valueAPI3: number;
  valueUSDC: number;
}

export interface IVoting {
  id: string;
  vt: string;
  createdAt: Date;
  name: string;
  description?: string;
  transferValue?: number;
  transferToken?: string;
  transferAddress?: string; // can be "invalid"
  transferStatus?: string; // can be "invalid"
  totalGasUsed?: number;
  totalUsd?: number;
  status: string; // expired, execured, rejected
  totalFor: number;
  totalAgainst: number;
  totalStaked: number;
  totalRequired: number;
}

export interface IWallet {
  address: string;
  ensName: string; // ENS domain name
  ensUpdated: Date;
  badges: string;
  userShare: number;
  userStake: number; // number of user stake at the moment of this epoch
  userVotingPower: number; // user voting power at this epoch
  userReward: number; // user reqard for this epoch
  userLockedReward: number; // how much of the reward is still locked
  userDeposited: number;
  userWithdrew: number;
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
  userShare?: number;
  userVotingPower?: number;
}
