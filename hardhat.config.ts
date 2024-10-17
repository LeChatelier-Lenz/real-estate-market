import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    ganache: {
      url: 'http://localhost:8545',
      accounts: [
        '0x96ef3db62f1da3d05bd19174f7cb0fda21b17fd728978795ea21ba44978379fe',
        '0x5bc4b0a106cdede6e522c8443ff088e96feac8794b5c25ca389d744ee8275f8d',
        '0x79808ffb26e1cdb7c203c504fd8ed43b6f9f1900174f3fbcb281553ab676a598',
        '0x4700d07040678cd4dfb061f96c9455fb8a1e87ea2b2a310d32d1a28248bb5df0',
        '0x535c6a9d2fa3946d96546edafd7eb026311690c355b99a2b428eb15aae75ac90'
      ]
    },
  },
  paths:{
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
