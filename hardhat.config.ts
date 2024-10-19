import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    ganache: {
      // chainId: 5777,
      url: 'http://localhost:8546',
      accounts: [
        '0x652675cae473bd83dece4cd34afe481e1238f8d6a6a795c34daaba52b229a715',
        '0x9f8259700f787d6ea475ce7fed18e300de3d5f4721a60576db6c6546465dfbec',
        '0x0e76079fa68b51aac7b6a35b6b9322638c85745de28b03fdf8d321cec2ed0874',
        '0x739aee50bdf0ff68b12c4aa0fe036b23e253cf3d34081c7109f56cc8f28f307a',
        '0xbd0679fa1a2ce4527e6ad2000520e5bf0ef881b4ef28fa762d322f6e759aa21b',
        '0x1a9dddc5769c870f998e1b6c92596277cc585080e8e874cc919bbeb7bb40aca0',
        '0x4915777504a4273874195dd342becf14bbc86ce126b86dc254db5b66595646b7'
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
