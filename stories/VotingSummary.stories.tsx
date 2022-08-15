import React from "react";
import { Prisma } from "@prisma/client";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { VotingSummary } from "../components/VotingSummary";

export default {
  title: "Votings/Summary",
  component: VotingSummary,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof VotingSummary>;

const Template: ComponentStory<typeof VotingSummary> = (args) => (
  <div className="max-w-full mx-auto">
    <VotingSummary {...args} />
  </div>
);

export const Executed = Template.bind({});
Executed.args = {
  name: "BUSINESS DEVELOPMENT TEAM, AUGUST-OCTOBER 2022",
  vt: "Secondary",
  status: "Executed",
  description: `
   https://gateway.pinata.cloud/ipfs/QmYt3LF3AmzVv6Ctbsg1w13vg98RDmyZAhkLh8dMoXQT84
   https://forum.api3.org/t/business-development-team-proposal-august-october-2022-cycle-8/1540`,
  transferValue: new Prisma.Decimal(26738),
  transferToken: "USDC",
  transferAddress: "0xe2279b907f027cc89fe744b2b5cf46f978e502d3",
  totalFor: new Prisma.Decimal(117138),
  totalAgainst: new Prisma.Decimal(12800),
  totalStaked: new Prisma.Decimal(42420299),
  totalRequired: new Prisma.Decimal(6363044),
  totalGasUsed: 0.0261812,
  totalUsd: 38.76,
};

export const Rejected = Template.bind({});
Rejected.args = {
  name: "Some Rejected Proposal",
  vt: "Primary",
  status: "Rejected",
  description: `
   https://gateway.pinata.cloud/ipfs/QmYt3LF3AmzVv6Ctbsg1w13vg98RDmyZAhkLh8dMoXQT84
   https://forum.api3.org/t/business-development-team-proposal-august-october-2022-cycle-8/1540`,
  transferValue: new Prisma.Decimal(26738),
  transferToken: "USDC",
  transferAddress: "0xe2279b907f027cc89fe744b2b5cf46f978e502d3",
  totalFor: new Prisma.Decimal(117138),
  totalAgainst: new Prisma.Decimal(10900000),
  totalStaked: new Prisma.Decimal(42420299),
  totalRequired: new Prisma.Decimal(6363044),
  totalGasUsed: 0.0261812,
  totalUsd: 38.76,
};

export const Pending = Template.bind({});
Pending.args = {
  name: "BUSINESS DEVELOPMENT TEAM, AUGUST-OCTOBER 2022",
  vt: "Secondary",
  status: "Pending",
  description: `
   https://gateway.pinata.cloud/ipfs/QmYt3LF3AmzVv6Ctbsg1w13vg98RDmyZAhkLh8dMoXQT84
   https://forum.api3.org/t/business-development-team-proposal-august-october-2022-cycle-8/1540`,
  transferValue: new Prisma.Decimal(26738),
  transferToken: "USDC",
  transferAddress: "0xe2279b907f027cc89fe744b2b5cf46f978e502d3",
  totalFor: new Prisma.Decimal(117138),
  totalAgainst: new Prisma.Decimal(0),
  totalStaked: new Prisma.Decimal(42420299),
  totalRequired: new Prisma.Decimal(6363044),
  totalGasUsed: 0.0261812,
  totalUsd: 38.76,
};
