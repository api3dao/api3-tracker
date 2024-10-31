import prisma from "../services/db";
import { Batch } from "../services/members";
import { Prisma } from "@prisma/client";
import { Wordlist } from "../services/members";

async function fixDelegateBadges() {
  // Get all members with delegate badge
  const members = await prisma.member.findMany({
    where: {
      badges: {
        contains: "delegate",
      },
    },
  });

  console.log(`Found ${members.length} members with delegate badge`);
  let fixCount = 0;

  for (const member of members) {
    const addr = Buffer.from(member.address);
    const addrHex = addr.toString("hex");

    // Calculate total delegated amount for this member
    const delegated = await Batch.readMemberDelegatedTotal(addr, false);

    // console.log(`\nChecking member ${addrHex}:`);
    // console.log(`Current delegated amount: ${delegated}`);
    // console.log(`Current badges: ${member.badges}`);

    // If no delegation, remove the badge
    if (delegated.equals(new Prisma.Decimal(0))) {
      fixCount++;
      // console.log(`Removing delegate badge for ${addrHex}`);

      // Remove badges directly
      const updatedBadges = Wordlist.remove(member.badges, "delegate");
      const updatedTags = Wordlist.remove(member.tags || "", "delegate");

      // Update database directly
      try {
        await prisma.member.update({
          where: { address: addr },
          data: {
            badges: updatedBadges,
            tags: updatedTags,
            userIsDelegated: new Prisma.Decimal(0),
          },
        });
        // console.log(`Successfully updated database for ${addrHex}`);
        // console.log(`New badges: ${updatedBadges}`);
      } catch (error) {
        console.error(`Failed to update database for ${addrHex}:`, error);
      }
    }
  }

  console.log(`\nAttempted to fix delegate badges for ${fixCount} members`);

  // Verify changes
  const remainingDelegates = await prisma.member.count({
    where: {
      badges: {
        contains: "delegate",
      },
    },
  });

  console.log(`Members still with delegate badge: ${remainingDelegates}`);
}

// Run the fix
fixDelegateBadges()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
