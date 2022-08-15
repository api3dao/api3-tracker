import React from "react";
import { Prisma } from "@prisma/client";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Treasury } from "../components/Treasury";

export default {
  title: "Treasury/Treasury",
  component: Treasury,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Treasury>;

const Template: ComponentStory<typeof Treasury> = (args) => (
  <div className="max-w-sm mx-auto">
    <Treasury {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: "Secondary Treasury",
  address: "0x556ecbb0311d350491ba0ec7e019c354d7723ce0",
  valueAPI3: new Prisma.Decimal(7021201.23947),
  valueUSDC: new Prisma.Decimal(17664560.23939),
};
