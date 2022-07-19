import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { WalletEventsList } from "../components/WalletEvents";

export default {
  title: "Wallets/Events",
  component: WalletEventsList,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof WalletEventsList>;

const Template: ComponentStory<typeof WalletEventsList> = (args) => (
  <WalletEventsList {...args} />
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
    },
  ],
};
