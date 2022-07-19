import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Header } from "../components/Header";

export default {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args) => <Header {...args} />;

export const Overview = Template.bind({});
Overview.args = {
  active: "/",
};

export const Rewards = Template.bind({});
Rewards.args = {
  active: "/rewards",
};

export const Wallets = Template.bind({});
Wallets.args = {
  active: "/wallets",
};

export const Votings = Template.bind({});
Votings.args = {
  active: "/votings",
};

export const Treasury = Template.bind({});
Treasury.args = {
  active: "/treasury",
};
