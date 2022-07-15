import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { IContract } from '../services/webconfig';
import { ContractsList } from '../components/ContractsList';

const contracts: Array<IContract> = [
  { "title": "API3 POOL CONTRACT ADDRESS",
    "address": "0x6dd655f10d4b9e242ae186d9050b68f725c76d76",
    "name": "api3Pool" },
  { "title": "API3 TOKEN CONTRACT ADDRESS",
    "address": "0x0b38210ea11411557c13457d4da7dc6ea731b88a",
    "name": "api3Token" },
  { "title": "TIME-LOCK MANAGER CONTRACT",
    "address": "0xfaef86994a37f1c8b2a5c73648f07dd4eff02baa",
    "name": "timeLockManager" },
  { "title": "PRIMARY VOTING CONTRACT",
    "address": "0xdb6c812e439ce5c740570578681ea7aadba5170b",
    "name": "primaryVoting" },
  { "title": "PRIMARY TREASURY AGENT",
    "address": "0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae",
    "name": "primaryAgent" },
  { "title": "SECONDARY VOTING CONTRACT",
    "address": "0x1c8058e72e4902b3431ef057e8d9a58a73f26372",
    "name": "secondaryVoting" },
  { "title": "SECONDARY TREASURY AGENT",
    "address": "0x556ecbb0311d350491ba0ec7e019c354d7723ce0",
    "name": "secondaryAgent" },
  { "title": "V1 TREASURY ADDRESS",
    "address": "0xe7af7c5982e073ac6525a34821fe1b3e8e432099",
    "name": "v1treasury" },
  { "title": "CONVENIENCE CONTRACT",
    "address": "0x95087266018b9637aff3d76d4e0cad7e52c19636",
    "name": "convenience" },
];

export default {
  title: 'Overview/ContractsList',
  component: ContractsList,
  parameters: {
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof ContractsList>;

const Template: ComponentStory<typeof ContractsList> = (args) => <ContractsList {...args} />;

export const Mainnet = Template.bind({});
Mainnet.args = {
  contracts,
};
