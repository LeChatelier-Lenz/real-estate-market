import { ethers } from "hardhat";
  
  describe("RESwap", function () {
    async function deployRESwapFixture() {
        const ONE_GWEI = 1_000_000_000;
    
        const accounts = await ethers.getSigners();
    
        const HouseCoin = await ethers.getContractFactory("HousieCoin");
        const houseCoin = await HouseCoin.deploy(20);
    
        const RealEstate = await ethers.getContractFactory("RealEstate");
        const realEstate = await RealEstate.deploy();
    
        const RESwap = await ethers.getContractFactory("RESwap");
        const reSwap = await RESwap.deploy(houseCoin.getAddress(), realEstate.getAddress());
    
        return { reSwap, houseCoin, realEstate, accounts };
    }

    // 测试RESwap合约上的挂单和购买功能

    // 1. 挂单
    describe("Place an order", function () {
        it("Should place an order", async function () {
            const { reSwap, houseCoin, realEstate, accounts } = await deployRESwapFixture();
    
            await houseCoin.connect(accounts[1]).approve(reSwap.getAddress(), 0);
            //后面必须等待approve的交易完成
            await reSwap.connect(accounts[1]).list(0, 200000);

        });
    });

    // 2. 购买
    describe("Buy an order", function () {
        it("Should buy an order", async function () {
            const { reSwap, houseCoin, realEstate, accounts } = await deployRESwapFixture();
            
            await reSwap.purchase(0, 200000);
            console.log(await houseCoin.balanceOf(accounts[0].address));
            console.log(await houseCoin.balanceOf(accounts[1].address));
            console.log(await realEstate.ownerOf(0));
        });
    });


});
  