-- DropForeignKey
ALTER TABLE "member_delegations" DROP CONSTRAINT "member_delegations_from_fkey";

-- DropForeignKey
ALTER TABLE "member_delegations" DROP CONSTRAINT "member_delegations_to_fkey";

-- DropForeignKey
ALTER TABLE "member_epochs" DROP CONSTRAINT "member_epochs_address_fkey";

-- DropForeignKey
ALTER TABLE "member_events" DROP CONSTRAINT "member_events_address_fkey";

-- DropForeignKey
ALTER TABLE "voting_event" DROP CONSTRAINT "voting_event_address_fkey";
