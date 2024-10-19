import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HouseCoin = buildModule("TokenModule", (m) => {
    //1.先部署HouseCoin代币合约
    const token = m.contract("HousieCoin", []);
    return { token };
});

export default HouseCoin