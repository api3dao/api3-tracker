import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { RewardsList } from "../components/RewardsList";

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
      isCurrent: true,
      epoch: 3333,
      createdAt: new Date(),
      apr: 14.75,
      rewardsPct: 0.2829,
      members: 8000,
      totalStake: 55481434,
      stakedRewards: 13756546,
      totalShares: 58903799,
      mintedShares: 156944,
      releaseDate: new Date(),
      blockNumber: 2828258,
      blockTx:
        "0xd29d9e55df72365e1e9b096b8850a6b0f612819d47d1175055c380721dcc8d18",
    },
  ],
};
