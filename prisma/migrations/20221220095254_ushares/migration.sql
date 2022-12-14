-- AlterTable
ALTER TABLE "members" ADD COLUMN     "userUnstake" DECIMAL(60,19) NOT NULL DEFAULT 0.0,
ALTER COLUMN "userShare" SET DEFAULT 0.0,
ALTER COLUMN "userStake" SET DEFAULT 0.0,
ALTER COLUMN "userVotingPower" SET DEFAULT 0.0,
ALTER COLUMN "userReward" SET DEFAULT 0.0,
ALTER COLUMN "userLockedReward" SET DEFAULT 0.0;

-- CreateTable
CREATE TABLE "cache_user_shares" (
    "addr" BYTEA NOT NULL,
    "height" INTEGER NOT NULL,
    "shares" DECIMAL(60,18) NOT NULL,
    "votingPower" DECIMAL(60,18) NOT NULL,
    "delegated" DECIMAL(60,18) NOT NULL,
    "delegatedTo" DECIMAL(60,18) NOT NULL,

    CONSTRAINT "cache_user_shares_pkey" PRIMARY KEY ("addr","height")
);
