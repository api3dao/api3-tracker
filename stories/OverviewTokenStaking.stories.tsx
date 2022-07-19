import React from "react";
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
