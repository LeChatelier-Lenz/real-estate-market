import Addresses from './contract-addresses.json'
import HousieCoin from './abis/HousieCoin.json'
// import TokenSale from './abis/TokenSale.json'
import RealEstate from './abis/RealEstate.json'
import RESwap from './abis/RESwap.json'

import Web3 from 'web3'

//@ts-ignore
//创建web3实例
let web3 = new Web3(window.web3.currentProvider);

//修改地址为部署的合约地址
const HousieCoinAddress = Addresses.HousieCoin
const HousieCoinABI = HousieCoin.abi
// const TokenSaleAddress = Addresses.TokenSale
// const TokenSaleABI = TokenSale.abi
const RealEstateAddress = Addresses.RealEstate
const RealEstateABI = RealEstate.abi
const RESwapAddress = Addresses.RESwap
const RESwapABI = RESwap.abi

const HousieCoinContract = new web3.eth.Contract(HousieCoinABI,HousieCoinAddress);
// const TokenSaleContract = new web3.eth.Contract(TokenSaleABI,TokenSaleAddress);
const RealEstateContract = new web3.eth.Contract(RealEstateABI,RealEstateAddress);
const RESwapContract = new web3.eth.Contract(RESwapABI,RESwapAddress);

export {web3,HousieCoinContract,RealEstateContract,RESwapContract}