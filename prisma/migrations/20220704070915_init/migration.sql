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
    "members" BIGINT NOT NULL,
    "totalStake" BIGINT NOT NULL,
    "totalShares" BIGINT NOT NULL,
    "mintedShares" BIGINT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epochs_pkey" PRIMARY KEY ("epoch")
);

-- CreateTable
CREATE TABLE "member_epochs" (
    "epoch" INTEGER NOT NULL,
    "address" BYTEA NOT NULL,
    "userShare" BIGINT NOT NULL,
    "userStake" BIGINT NOT NULL,
    "userVotingPower" DECIMAL(10,2) NOT NULL,
    "userReward" BIGINT NOT NULL,

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
    "userShares" BIGINT NOT NULL,

    CONSTRAINT "member_delegations_pkey" PRIMARY KEY ("from")
);

-- CreateTable
CREATE TABLE "members" (
    "address" BYTEA NOT NULL,
    "ensName" TEXT NOT NULL,
    "ensUpdated" TIMESTAMP(3) NOT NULL,
    "badges" TEXT NOT NULL,
    "userShare" BIGINT NOT NULL,
    "userStake" BIGINT NOT NULL,
    "userVotingPower" DECIMAL(10,2) NOT NULL,
    "userReward" BIGINT NOT NULL,
    "userLockedReward" BIGINT NOT NULL,
    "userDeposited" BIGINT NOT NULL,
    "userWithdrew" BIGINT NOT NULL,
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
    "data" JSONB,
    "fee" BIGINT,
    "gasPrice" BIGINT,
    "gasUsed" BIGINT,
    "feeUsd" DECIMAL(10,2),
    "address" BYTEA NOT NULL,
    "supports" INTEGER NOT NULL DEFAULT 0,
    "userShare" BIGINT NOT NULL,
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
    "transferValue" BIGINT,
    "transferToken" TEXT,
    "totalGasUsed" BIGINT,
    "totalUsd" DECIMAL(10,2),

    CONSTRAINT "voting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ens_event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "address" BYTEA,
    "name" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" BYTEA NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "data" JSONB,
    "fee" BIGINT,
    "gasPrice" BIGINT,
    "gasUsed" BIGINT,
    "feeUsd" DECIMAL(10,2),

    CONSTRAINT "ens_event_pkey" PRIMARY KEY ("id")
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
    "value" BIGINT NOT NULL,
    "decimals" INTEGER NOT NULL,

    CONSTRAINT "treasuries_pkey" PRIMARY KEY ("ts","ttype")
);

-- CreateTable
CREATE TABLE "api3_supply" (
    "ts" TIMESTAMP(3) NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "circulatingSupply" BIGINT NOT NULL,
    "totalLocked" BIGINT NOT NULL,
    "totalStaked" BIGINT NOT NULL,
    "stakingTarget" BIGINT NOT NULL,
    "lockedByGovernance" BIGINT NOT NULL,
    "lockedVestings" BIGINT NOT NULL,
    "lockedRewards" BIGINT NOT NULL,
    "timeLocked" BIGINT NOT NULL,

    CONSTRAINT "api3_supply_pkey" PRIMARY KEY ("ts")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_delegations_to_key" ON "member_delegations"("to");

-- CreateIndex
CREATE UNIQUE INDEX "members_address_key" ON "members"("address");

-- AddForeignKey
ALTER TABLE "member_epochs" ADD CONSTRAINT "member_epochs_address_fkey" FOREIGN KEY ("address") REFERENCES "members"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_events" ADD CONSTRAINT "member_events_address_fkey" FOREIGN KEY ("address") REFERENCES "members"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_delegations" ADD CONSTRAINT "member_delegations_from_fkey" FOREIGN KEY ("from") REFERENCES "members"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_delegations" ADD CONSTRAINT "member_delegations_to_fkey" FOREIGN KEY ("to") REFERENCES "members"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_event" ADD CONSTRAINT "voting_event_address_fkey" FOREIGN KEY ("address") REFERENCES "members"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_event" ADD CONSTRAINT "voting_event_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "voting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
