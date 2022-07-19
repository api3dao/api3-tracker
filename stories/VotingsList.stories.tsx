import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { VotingsList } from "../components/VotingsList";

export default {
  title: "Votings/List",
  component: VotingsList,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof VotingsList>;

const Template: ComponentStory<typeof VotingsList> = (args) => (
  <VotingsList {...args} />
);

export const Example = Template.bind({});
Example.args = {
  list: [
    {
      id: "1",
      vt: "Primary",
      createdAt: new Date(),
      name: "API3 DAO BD-API Team Proposal",
      transferValue: 111363,
      transferToken: "USDC",
      transferAddress: "0xcb943e4fb0bcf7ec3c2e6d263c275b27f07701c6",
      transferStatus: "",
      totalGasUsed: 0.0562095,
      totalUsd: 148.17,
      status: "executed",
      totalFor: 20000,
      totalAgainst: 0,
      totalStaked: 100000,
      totalRequired: 50000,
    },
    {
      id: "2",
      vt: "Secondary",
      createdAt: new Date(),
      name: "Yet another Team Proposal",
      transferValue: 111363,
      transferToken: "USDC",
      transferAddress: "0xcb943e4fb0bcf7ec3c2e6d263c275b27f07701c6",
      transferStatus: "",
      totalGasUsed: 0.0562095,
      totalUsd: 148.17,
      status: "executed",
      totalFor: 20000,
      totalAgainst: 23,
      totalStaked: 100000,
      totalRequired: 15000,
    },
  ],
};
