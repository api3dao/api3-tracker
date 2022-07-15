import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { TokenSupply } from "../components/TokenSupply";

export default {
  title: "Overview/TokenSupply",
  component: TokenSupply,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof TokenSupply>;

const Template: ComponentStory<typeof TokenSupply> = (args) => ( <TokenSupply {...args} />);

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


