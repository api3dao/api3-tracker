import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Footer } from "../components/Footer";

export default {
  title: "Layout/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Footer>;

const Template: ComponentStory<typeof Footer> = (args) => <Footer {...args} />;

export const Default = Template.bind({});
Default.args = {
  github: "https://github.com/api3dao/api3-tracker",
  blockNumber: 15125158,
}
