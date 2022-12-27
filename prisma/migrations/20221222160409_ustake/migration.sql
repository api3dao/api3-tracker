/*
  Warnings:

  - Added the required column `locked` to the `cache_user_shares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stake` to the `cache_user_shares` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `cache_user_shares` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cache_user_shares" ADD COLUMN     "locked" DECIMAL(60,18) NOT NULL,
ADD COLUMN     "stake" DECIMAL(60,18) NOT NULL,
ADD COLUMN     "user" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "cache_total_shares" (
    "height" INTEGER NOT NULL,
    "totalStake" DECIMAL(60,18) NOT NULL,
    "totalShares" DECIMAL(60,18) NOT NULL,

    CONSTRAINT "cache_total_shares_pkey" PRIMARY KEY ("height")
);
