import React from "react";
import { Prisma } from "@prisma/client";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TokenStaking } from "../components/TokenStaking";

export default {
  title: "Overview/TokenStaking",
  component: TokenStaking,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof TokenStaking>;

const Template: ComponentStory<typeof TokenStaking> = (args) => (
  <TokenStaking {...args} />
);

export const Default = Template.bind({});
Default.args = {
  blockNumber: BigInt(5212755),
  circulatingSupply: new Prisma.Decimal(58906004),

  totalLocked: new Prisma.Decimal(54850522),
  totalStaked: new Prisma.Decimal(54958126),
  stakingTarget: new Prisma.Decimal(56878263),

  lockedByGovernance: new Prisma.Decimal(21960129),
  lockedVestings: new Prisma.Decimal(19718422),
  lockedRewards: new Prisma.Decimal(13171971),
  timeLocked: new Prisma.Decimal(32890393),
};
