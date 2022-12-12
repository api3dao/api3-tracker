-- CreateEnum
CREATE TYPE "VotingType" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "TreasuryType" AS ENUM ('PRIMARY', 'SECONDARY', 'V1');

-- CreateTable
CREATE TABLE "epochs" (
    "epoch" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" BYTEA NOT NULL,
    "apr" DECIMAL(10,2) NOT NULL,
    "rewardsPct" DECIMAL(10,4) NOT NULL,
    "newApr" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "newRewardsPct" DECIMAL(10,4) NOT NULL DEFAULT 0.0,
    "members" INTEGER NOT NULL,
    "totalStake" DECIMAL(60,18) NOT NULL,
    "totalShares" DECIMAL(60,18) NOT NULL,
    "mintedShares" DECIMAL(60,18) NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" INTEGER NOT NULL,
    "isReleased" INTEGER NOT NULL DEFAULT 0,
    "stakedRewards" DECIMAL(60,18) NOT NULL,
    "totalDeposits" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "totalWithdrawals" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "totalUnlocked" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "totalLocked" DECIMAL(60,18) NOT NULL DEFAULT 0.0,

    CONSTRAINT "epochs_pkey" PRIMARY KEY ("epoch")
);

-- CreateTable
CREATE TABLE "member_epochs" (
    "epoch" INTEGER NOT NULL,
    "address" BYTEA NOT NULL,
    "userShare" DECIMAL(60,18) NOT NULL,
    "userStake" DECIMAL(60,18) NOT NULL,
    "userVotingPower" DECIMAL(10,2) NOT NULL,
    "userReward" DECIMAL(60,18) NOT NULL,
    "isReleased" INTEGER NOT NULL DEFAULT 0,
    "userTotalDeposits" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "userTotalWithdrawals" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "userTotalUnlocked" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "userTotalLocked" DECIMAL(60,18) NOT NULL DEFAULT 0.0,

    CONSTRAINT "member_epochs_pkey" PRIMARY KEY ("epoch","address")
);

-- CreateTable
CREATE TABLE "member_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "address" BYTEA NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" BYTEA NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "eventName" TEXT NOT NULL,
    "data" JSONB,
    "fee" BIGINT,
    "gasPrice" BIGINT,
    "gasUsed" BIGINT,
    "feeUsd" DECIMAL(10,2),

    CONSTRAINT "member_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_delegations" (
    "from" BYTEA NOT NULL,
    "to" BYTEA NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userShares" DECIMAL(60,18) NOT NULL,

    CONSTRAINT "member_delegations_pkey" PRIMARY KEY ("from")
);

-- CreateTable
CREATE TABLE "members" (
    "address" BYTEA NOT NULL,
    "ensName" TEXT NOT NULL,
    "ensUpdated" TIMESTAMP(3) NOT NULL,
    "badges" TEXT NOT NULL,
    "userShare" DECIMAL(60,18) NOT NULL,
    "userStake" DECIMAL(60,18) NOT NULL,
    "userVotingPower" DECIMAL(10,2) NOT NULL,
    "userReward" DECIMAL(60,18) NOT NULL,
    "userLockedReward" DECIMAL(60,18) NOT NULL,
    "userDelegates" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "userIsDelegated" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
    "userDeposited" DECIMAL(60,18) NOT NULL,
    "userWithdrew" DECIMAL(60,18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "voting_event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" BYTEA NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "eventName" TEXT NOT NULL,
    "data" JSONB,
    "fee" BIGINT,
    "gasPrice" BIGINT,
    "gasUsed" BIGINT,
    "feeUsd" DECIMAL(10,2),
    "address" BYTEA NOT NULL,
    "supports" INTEGER NOT NULL DEFAULT 0,
    "userShare" DECIMAL(60,18) NOT NULL,
    "userVotingPower" DECIMAL(10,2) NOT NULL,
    "votingId" TEXT,

    CONSTRAINT "voting_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting" (
    "id" TEXT NOT NULL,
    "vt" "VotingType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transferValue" DECIMAL(60,18),
    "transferToken" TEXT,
    "transferAddress" BYTEA,
    "totalGasUsed" BIGINT,
    "totalUsd" DECIMAL(10,2),
    "totalFor" DECIMAL(60,18) NOT NULL,
    "totalAgainst" DECIMAL(60,18) NOT NULL,
    "totalStaked" DECIMAL(60,18) NOT NULL,
    "totalRequired" DECIMAL(60,18) NOT NULL,

    CONSTRAINT "voting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_ethereum" (
    "ts" TIMESTAMP(3) NOT NULL,
    "usd" DECIMAL(10,2) NOT NULL,
    "eur" DECIMAL(10,2) NOT NULL,
    "rub" DECIMAL(10,2) NOT NULL,
    "cny" DECIMAL(10,2) NOT NULL,
    "cad" DECIMAL(10,2) NOT NULL,
    "jpy" DECIMAL(10,2) NOT NULL,
    "gbp" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "price_ethereum_pkey" PRIMARY KEY ("ts")
);

-- CreateTable
CREATE TABLE "treasuries" (
    "ts" TIMESTAMP(3) NOT NULL,
    "ttype" "TreasuryType" NOT NULL,
    "address" BYTEA NOT NULL,
    "token" TEXT NOT NULL,
    "tokenAddress" BYTEA NOT NULL,
    "value" DECIMAL(60,18) NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "treasuries_pkey" PRIMARY KEY ("ts","ttype","token")
);

-- CreateTable
CREATE TABLE "api3_supply" (
    "ts" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "circulatingSupply" DECIMAL(60,18) NOT NULL,
    "totalLocked" DECIMAL(60,18) NOT NULL,
    "totalStaked" DECIMAL(60,18) NOT NULL,
    "stakingTarget" DECIMAL(60,18) NOT NULL,
    "lockedByGovernance" DECIMAL(60,18) NOT NULL,
    "lockedVestings" DECIMAL(60,18) NOT NULL,
    "lockedRewards" DECIMAL(60,18) NOT NULL,
    "timeLocked" DECIMAL(60,18) NOT NULL,

    CONSTRAINT "api3_supply_pkey" PRIMARY KEY ("ts")
);

-- CreateTable
CREATE TABLE "cache_blocks" (
    "hash" BYTEA NOT NULL,
    "height" BIGINT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "cache_blocks_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "cache_tx" (
    "hash" BYTEA NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "cache_tx_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "cache_receipts" (
    "hash" BYTEA NOT NULL,
    "receipt" JSONB NOT NULL,

    CONSTRAINT "cache_receipts_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "cache_logs" (
    "hash" BYTEA NOT NULL,
    "contract" BYTEA NOT NULL,
    "logs" JSONB NOT NULL,

    CONSTRAINT "cache_logs_pkey" PRIMARY KEY ("hash","contract")
);

-- CreateTable
CREATE TABLE "cache_ens" (
    "address" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "cache_ens_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "sync_status" (
    "id" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "downloaded" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sync_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_address_key" ON "members"("address");

-- AddForeignKey
ALTER TABLE "voting_event" ADD CONSTRAINT "voting_event_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
