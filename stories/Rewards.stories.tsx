import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Prisma } from "@prisma/client";
import { RewardsList } from "../components/Rewards";

export default {
  title: "Rewards/List",
  component: RewardsList,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RewardsList>;

const Template: ComponentStory<typeof RewardsList> = (args) => (
  <RewardsList {...args} />
);

export const Default = Template.bind({});
Default.args = {
  list: [
    {
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
  ],
};
