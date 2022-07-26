import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { StakingTrend } from "../components/StakingTrend";

export default {
  title: "Overview/StakingTrend",
  component: StakingTrend,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof StakingTrend>;

const Template: ComponentStory<typeof StakingTrend> = (args) => (
  <StakingTrend {...args} />
);

export const Min = Template.bind({});
Min.args = {
  apr: 0.00003,
  totalStaked: 1,
  stakingTarget: 100,
};

export const Downtrend = Template.bind({});
Downtrend.args = {
  apr: 0.5,
  totalStaked: 200,
  stakingTarget: 100,
};

export const Uptrend = Template.bind({});
Uptrend.args = {
  apr: 0.5,
  totalStaked: 100,
  stakingTarget: 200,
};

export const Max = Template.bind({});
Max.args = {
  apr: 0.75,
  totalStaked: 100,
  stakingTarget: 200,
};
