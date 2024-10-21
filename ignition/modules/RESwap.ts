import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HouseCoin = buildModule("TokenModule", (m) => {
    //1.先部署HouseCoin代币合约
    const token = m.contract("HousieCoin", [20]);
    return { token };
});

const RealEstate = buildModule("RealEstateModule", (m) => {
    //4.调用RealEstate合约
    const realEstate = m.contract("RealEstate", []);

    return { realEstate };
});

const RESwap = buildModule("RESwapModule", (m) => {
    //5.调用RESwap合约,并将RealEstate和HouseCoin的合约地址传入用于构建
    const { realEstate } = m.useModule(RealEstate);
    const { token } = m.useModule(HouseCoin);
    
    const reSwap = m.contract("RESwap", [token,realEstate]);

    return { reSwap };
});

export default RESwap