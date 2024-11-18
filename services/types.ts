import { Prisma } from "@prisma/client";

export const Decimal = Prisma.Decimal;

export interface IBlockEvent {
  createdAt: string;
  txHash: string;
  blockNumber: number;
}

export interface IBlockNumber {
  blockNumber?: number;
}

export interface IContract {
  name: string;
  title: string;
  address: string;
  minBlock?: number;
  batchSize?: number;
  watch?: number;
}

export interface IWebPage {
  slug: string;
  siteName?: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface IWebConfig {
  github?: string;
  ethscan?: string;
  opengraph: IWebPage;
  pages: Map<string, IWebPage>;
  contracts?: Array<IContract>;
}

export interface IEpoch {
  isCurrent: number;
  epoch: number; // id of epoch
  createdAt: string; // date of epoch event
  apr: Prisma.Decimal; // APR during this epoch
  rewardsPct: Prisma.Decimal;
  newApr: Prisma.Decimal; // APR for the next epoch
  newRewardsPct: Prisma.Decimal;
  members: number; // Number of members
  totalStake: Prisma.Decimal; // Total stake
  stakedRewards: Prisma.Decimal;
  totalShares: Prisma.Decimal; // Total shares
  mintedShares: Prisma.Decimal; // # of minted tokens
  releaseDate: string; // Date when minted tokens will be released
  isReleased: number;

  totalDeposits: Prisma.Decimal;
  totalWithdrawals: Prisma.Decimal;
  totalUnlocked: Prisma.Decimal;
  totalLocked: Prisma.Decimal;

  txHash?: string;
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
  valueETH?: Prisma.Decimal;
}

export interface IVoting {
  id: string;
  vt: string;
  createdAt: string;
  name: string;
  description?: string;
  transferValue?: Prisma.Decimal;
  transferToken?: string;
  transferAddress?: string;
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
  index?: number; // row index
  ensName: string; // ENS domain name
  ensUpdated: string;
  badges: string;
  tags?: string;
  userShare: Prisma.Decimal;
  userStake: Prisma.Decimal; // number of user stake at the moment
  userUnstake: Prisma.Decimal; // number of user stake at the moment
  userVotingPower: Prisma.Decimal; // user voting power
  userReward: Prisma.Decimal; // user reqard for this epoch
  userLockedReward: Prisma.Decimal; // how much of the reward is still locked
  userDeposited: Prisma.Decimal;
  userWithdrew: Prisma.Decimal;
  userDelegates: Prisma.Decimal;
  userIsDelegated: Prisma.Decimal;
  createdAt: string;
  updatedAt: string;
}

export interface IDelegation {
  from: string;
  to: string;
  userShares: Prisma.Decimal;
  updatedAt: string;
}

export interface IWalletEvent {
  index?: number; // row index
  id: string;
  createdAt: string;
  address: string;
  txHash: string;
  blockNumber: number;
  txIndex?: number;
  logIndex?: number;
  data: string;
  eventName: string;
  fee?: number;
  gasPrice?: number;
  gasUsed?: number;
  feeUsd?: Prisma.Decimal;
}

export interface IVotingEvent {
  id: string;
  index?: number;
  createdAt: string;
  txHash: string;
  blockNumber: number;
  txIndex?: number;
  logIndex?: number;
  data: string;
  eventName: string;
  fee?: number;
  gasPrice?: number;
  gasUsed?: number;
  feeUsd?: Prisma.Decimal;

  address?: string;
  badges?: string;
  ensName?: string;
  supports?: number;
  showGas: boolean;
  totalStake?: number;
  userShare?: Prisma.Decimal;
  userVotingPower?: Prisma.Decimal;
}
