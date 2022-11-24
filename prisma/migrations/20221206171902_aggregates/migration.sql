/*
  Warnings:

  - Added the required column `isReleased` to the `member_epochs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "member_delegations_to_key";

-- AlterTable
ALTER TABLE "member_epochs" ADD COLUMN     "isReleased" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "userDelegates" DECIMAL(60,18) NOT NULL DEFAULT 0.0,
ADD COLUMN     "userIsDelegated" DECIMAL(60,18) NOT NULL DEFAULT 0.0;
