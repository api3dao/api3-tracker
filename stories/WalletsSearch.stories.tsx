import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { WalletsSearch } from "../components/WalletsSearch";

export default {
  title: "Wallets/WalletsSearch",
  component: WalletsSearch,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof WalletsSearch>;

const Template: ComponentStory<typeof WalletsSearch> = (args) => (
  <WalletsSearch {...args} />
);

export const NoValue = Template.bind({});
NoValue.args = {
   value: "",
   onChange: () => {},
};

export const WithValue = Template.bind({});
WithValue.args = {
   value: "some-ens-name.eth",
   onChange: () => {},
};
