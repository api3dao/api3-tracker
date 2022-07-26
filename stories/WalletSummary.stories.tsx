import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { WalletSummary } from "../components/WalletSummary";

export default {
  title: "Wallets/Summary",
  component: WalletSummary,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof WalletSummary>;

const Template: ComponentStory<typeof WalletSummary> = (args) => (
  <div className="max-w-full mx-auto">
    <WalletSummary {...args} />
  </div>
);

export const Burak = Template.bind({});
Burak.args = {
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
};
