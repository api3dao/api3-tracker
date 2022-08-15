import React from "react";
import { Prisma } from "@prisma/client";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { StakingTrend } from "../components/StakingTrend";

export default {
  title: "Overview/StakingTrend",
  component: StakingTrend,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof StakingTrend>;

const Template: ComponentStory<typeof StakingTrend> = (args) => (
  <StakingTrend {...args} />
);

export const Min = Template.bind({});
Min.args = {
  apr: new Prisma.Decimal(2.5),
  totalStaked: new Prisma.Decimal(1),
  stakingTarget: new Prisma.Decimal(100),
};

export const Downtrend = Template.bind({});
Downtrend.args = {
  apr: new Prisma.Decimal(50),
  totalStaked: new Prisma.Decimal(200),
  stakingTarget: new Prisma.Decimal(100),
};

export const Uptrend = Template.bind({});
Uptrend.args = {
  apr: new Prisma.Decimal(5),
  totalStaked: new Prisma.Decimal(100),
  stakingTarget: new Prisma.Decimal(200),
};

export const Max = Template.bind({});
Max.args = {
  apr: new Prisma.Decimal(75),
  totalStaked: new Prisma.Decimal(100),
  stakingTarget: new Prisma.Decimal(200),
};
