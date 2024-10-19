import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HousieCoinAddr = "0x7230e3Dd98d08abA1db0b30Da2c05d3325f4dCB2";

const TokenSale = buildModule("TokenSaleModule", (m) => {
    const token = m.contractAt("HousieCoin",HousieCoinAddr);

    //2.部署TokenSale合约,并将HouseCoin代币合约地址传入用于构建
    const tokenSale = m.contract("TokenSale", [token,20]);

    //3.调用HouseCoin合约中的函数,给TokenSale合约转入的代币
    m.call(token, "transfer", [tokenSale, 100]);
    
    return { tokenSale };
});

export default TokenSale