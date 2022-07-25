import React from "react";
import { Prisma } from "@prisma/client";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Epoch } from "../components/Overview";

export default {
  title: "Overview/Epoch",
  component: Epoch,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Epoch>;

const Template: ComponentStory<typeof Epoch> = (args) => (
  <div style={{ maxWidth: 300, margin: "0px auto" }}>
    <Epoch {...args} />
  </div>
);

export const CurrrentEpoch = Template.bind({});
CurrrentEpoch.args = {
  isCurrent: 1,
  epoch: 3333,
  createdAt: new Date().toISOString(),
  apr: new Prisma.Decimal(14.75),
  rewardsPct: new Prisma.Decimal(0.2829),
  members: 8000,
  totalStake: new Prisma.Decimal(55481434),
  stakedRewards: new Prisma.Decimal(13756546),
  totalShares: new Prisma.Decimal(58903799),
  mintedShares: new Prisma.Decimal(156944),
  releaseDate: new Date().toISOString(),
};

export const PreviousEpoch = Template.bind({});
PreviousEpoch.args = {
  isCurrent: 0,
  epoch: 3332,
  createdAt: new Date().toISOString(),
  apr: new Prisma.Decimal(14.75),
  rewardsPct: new Prisma.Decimal(0.2829),
  members: 8000,
  totalStake: new Prisma.Decimal(55481434),
  stakedRewards: new Prisma.Decimal(13756546),
  totalShares: new Prisma.Decimal(58903799),
  mintedShares: new Prisma.Decimal(156944),
  releaseDate: new Date().toISOString(),
};
