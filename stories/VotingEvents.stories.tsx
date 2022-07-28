import React from "react";
import { Prisma } from "@prisma/client";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { VotingEventsList } from "../components/VotingEvents";

export default {
  title: "Votings/Events",
  component: VotingEventsList,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof VotingEventsList>;

const Template: ComponentStory<typeof VotingEventsList> = (args) => (
  <VotingEventsList {...args} />
);

export const Example = Template.bind({});
Example.args = {
  list: [
    {
      id: "1",
      createdAt: new Date(),
      txHash: "",
      blockNumber: 12942126,
      data: "",
      eventName: "CastVote",
      gasPrice: 33,
      gasUsed: 473402,
      feeUsd: 39.7,
      address: "0x3146f17d9bef9dadd00e61c87cabe6f9bef79b2a",
      ensName: "",
      supports: 1,
      userShare: new Prisma.Decimal(1000000),
      userVotingPower: new Prisma.Decimal(0.225),
    },
  ],
};
