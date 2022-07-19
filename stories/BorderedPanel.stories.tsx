import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import { BorderedPanel } from "../components/BorderedPanel";

export default {
  title: "Layout/BorderedPanel",
  component: BorderedPanel,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof BorderedPanel>;

const Template: ComponentStory<typeof BorderedPanel> = (args) => (
  <div style={{ maxWidth: 300, margin: "0px auto" }}>
    <BorderedPanel {...args} />
  </div>
);

const loremIpsum = `
Sed fermentum tempus ante, non vestibulum arcu malesuada ut.
Fusce commodo, purus ut mattis sodales, odio metus tempor libero,
quis iaculis magna mauris et ipsum. In sagittis eros ut efficitur auctor.
Nunc aliquam nisl ac gravida suscipit. Maecenas lobortis hendrerit magna,
at auctor odio mollis a. Ut nec molestie lacus. Mauris dapibus velit
elementum quam varius, eget egestas quam ullamcorper.
Vivamus varius purus id risus volutpat vestibulum. Aenean finibus,
nisi ac congue hendrerit, odio quam gravida nulla, at vestibulum neque felis in libero.
`;

export const Default = Template.bind({});
Default.args = {
  title: "Bordered Panel",
  children: [<div key={0}>{loremIpsum}</div>],
};

export const Big = Template.bind({});
Big.args = {
  title: "Bordered Panel",
  big: true,
  children: [<div key={0}>{loremIpsum}</div>],
};
