import React from "react";
import { Prisma } from "@prisma/client";
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
  ensUpdated: new Date().toISOString(),
  badges: "withdrawn,vested",
  userShare: new Prisma.Decimal(6702059),
  userStake: new Prisma.Decimal(6999029), // number of user stake at the moment of this epoch
  userVotingPower: new Prisma.Decimal(11.2),
  userReward: new Prisma.Decimal(2126243),
  userLockedReward: new Prisma.Decimal(70000), // how much of the reward is still locked
  userDeposited: new Prisma.Decimal(0),
  userWithdrew: new Prisma.Decimal(19999),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
