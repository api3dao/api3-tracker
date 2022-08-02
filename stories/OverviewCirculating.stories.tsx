import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { TokenCirculating } from "../components/TokenCirculating";

export default {
  title: "Overview/TokenCirculating",
  component: TokenCirculating,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof TokenCirculating>;

const Template: ComponentStory<typeof TokenCirculating> = (args) => (
  <div className="mx-auto max-w-sm"><TokenCirculating {...args} /></div>
);

export const Default = Template.bind({});
Default.args = {
  blockNumber: 5212755,
  circulatingSupply: 58906004,

  totalLocked: 54850522,
  totalStaked: 54958126,
  stakingTarget: 56878263,

  lockedByGovernance: 21960129,
  lockedVestings: 19718422,
  lockedRewards: 13171971,
  timeLocked: 32890393,
};
