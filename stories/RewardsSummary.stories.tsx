import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Prisma } from "@prisma/client";
import { RewardsSummary } from "../components/Rewards";

// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

export default {
  title: "Rewards/Summary",
  component: RewardsSummary,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RewardsSummary>;

const TemplateSummary: ComponentStory<typeof RewardsSummary> = (args) => (
  <RewardsSummary {...args} />
);

export const Template = TemplateSummary.bind({});
Template.args = {
  totalMinted: new Prisma.Decimal(1000000),
  supply: {
    blockNumber: BigInt(5212755),
    circulatingSupply: new Prisma.Decimal(58906004),
    totalLocked: new Prisma.Decimal(54850522),
    totalStaked: new Prisma.Decimal(54958126),
    stakingTarget: new Prisma.Decimal(56878263),
    lockedByGovernance: new Prisma.Decimal(21960129),
    lockedVestings: new Prisma.Decimal(19718422),
    lockedRewards: new Prisma.Decimal(13171971),
    timeLocked: new Prisma.Decimal(32890393),
  },
  latest: {
    isCurrent: 1,
    epoch: 3333,
    createdAt: new Date().toISOString(),
    apr: new Prisma.Decimal(14.75),
    rewardsPct: new Prisma.Decimal(0.2829),
    members: 8000,
    totalStake: new Prisma.Decimal(55481434),
    stakedRewards: new Prisma.Decimal(13756546),
    totalShares: new Prisma.Decimal(58903799),
    mintedShares: new Prisma.Decimal(156944),
    releaseDate: new Date().toISOString(),
    blockNumber: 2828258,
    txHash:
      "0xd29d9e55df72365e1e9b096b8850a6b0f612819d47d1175055c380721dcc8d18",
  },
};
