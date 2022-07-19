import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { WalletsList } from "../components/WalletsList";

export default {
  title: "Wallets/WalletsList",
  component: WalletsList,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof WalletsList>;

const Template: ComponentStory<typeof WalletsList> = (args) => (
  <WalletsList {...args} />
);

export const Example = Template.bind({});
Example.args = {
  list: [
    {
      address: "0x5846711b4b7485392c1f0feaec203aa889071717",
      ensName: "bbenligiray.eth",
      ensUpdated: new Date(),
      badges: "withdrawn,vested",
      userShare: 6702059,
      userStake: 6999029, // number of user stake at the moment of this epoch
      userVotingPower: 11.2,
      userReward: 2126243,
      userLockedReward: 70000, // how much of the reward is still locked
      userDeposited: 0,
      userWithdrew: 19999,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};
