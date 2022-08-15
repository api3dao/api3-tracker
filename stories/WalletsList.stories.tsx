import React from "react";
import { Prisma } from "@prisma/client";
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
      ensUpdated: new Date().toISOString(),
      badges: "withdrawn,vested",
      userShare: new Prisma.Decimal( 6702059 ),
      userStake: new Prisma.Decimal( 6999029 ), // number of user stake at the moment of this epoch
      userVotingPower: new Prisma.Decimal(11.2),
      userReward: new Prisma.Decimal( 2126243 ),
      userLockedReward: new Prisma.Decimal( 70000 ), // how much of the reward is still locked
      userDeposited: new Prisma.Decimal( 0 ),
      userWithdrew: new Prisma.Decimal( 19999 ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};
