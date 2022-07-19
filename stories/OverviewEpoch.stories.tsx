import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Epoch } from "../components/Overview";

export default {
  title: "Overview/Epoch",
  component: Epoch,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Epoch>;

const Template: ComponentStory<typeof Epoch> = (args) => (
  <div style={{ maxWidth: 300, margin: "0px auto" }}>
    <Epoch {...args} />
  </div>
);

export const CurrrentEpoch = Template.bind({});
CurrrentEpoch.args = {
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
};

export const PreviousEpoch = Template.bind({});
PreviousEpoch.args = {
  isCurrent: false,
  epoch: 3332,
  createdAt: new Date(),
  apr: 14.75,
  rewardsPct: 0.2829,
  members: 8000,
  totalStake: 55481434,
  stakedRewards: 13756546,
  totalShares: 58903799,
  mintedShares: 156944,
  releaseDate: new Date(),
};
