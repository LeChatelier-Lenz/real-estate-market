// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/// @title HousieCoin代币合约
/// @author lechatelierlenz
/// @notice 
contract HousieCoin is ERC20, Ownable {
    /// 构建一个新的HousieCoin合约
    /// 具体的兑换率(1 ETH = rate HSC)
    uint256 public rate;

    constructor(uint256 _rate) ERC20("HousieCoin", "HSC") Ownable(msg.sender) {
        // 初始步骤：为合约的所有者铸造1000个HousieCoin
        // 定义，mint中的amount是以wei为单位的，因此需要乘以10^18
        rate = _rate;
        _mint(msg.sender, 1000 * 10 ** 18);
    }
    // 为指定地址铸造HousieCoin
    function mint(address to,  uint256 amount) public onlyOwner {
        // ps: Ownable合约提供的onlyOwner修饰符确保只有合约的所有者才能调用此函数
        _mint(to, amount);
    }
    // 提供ETH充值获取HousieCoin方法
    receive() external payable {
        // value是msg对象的一个属性，表示发送者发送的以太币数量，单位是wei,因此需要转换为ether
        uint256 tokenAmount = msg.value * rate;
        // balanceOf方法是ERC20合约中的一个方法，用于查询指定地址的代币余额,单位是wei

        // 发送代币给发送者
        _mint(msg.sender, tokenAmount);
    }

    // 允许所有者修改兑换率
    function setRate(uint256 newRate) external onlyOwner {
        rate = newRate;
    }
}