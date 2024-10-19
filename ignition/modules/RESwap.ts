import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HousieCoinAddr = "0x7230e3Dd98d08abA1db0b30Da2c05d3325f4dCB2";

const RealEstate = buildModule("RealEstateModule", (m) => {
    //4.调用RealEstate合约
    const realEstate = m.contract("RealEstate", []);

    return { realEstate };
});

const RESwap = buildModule("RESwapModule", (m) => {
    //5.调用RESwap合约,并将RealEstate和HouseCoin的合约地址传入用于构建
    const { realEstate } = m.useModule(RealEstate);
    const token = m.contractAt("HousieCoin",HousieCoinAddr);

    const reSwap = m.contract("RESwap", [token,realEstate]);

    return { reSwap };
});

export default RESwap