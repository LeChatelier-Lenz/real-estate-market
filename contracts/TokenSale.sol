// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title 代币销售合约
/// @author lechatelierlenz
/// @notice 
contract TokenSale is Ownable {
    ERC20 public token;
    uint256 public rate; // 代币兑换率, 1 ETH = X 个代币

    event TokensPurchased(address indexed buyer, uint256 amount);

    /// 构建一个新的TokenSale合约
    /// @param _token 已经部署的ERC20代币合约地址
    /// @param _rate 具体的兑换率
    constructor(ERC20 _token, uint256 _rate) Ownable(msg.sender) {
        require(_rate > 0, "Rate should be greater than 0");
        token = _token;
        rate = _rate;
    }

    // 接收以太币并兑换代币
    receive() external payable {
        uint256 tokenAmount = msg.value * rate;
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens in the contract");

        // 发送代币给发送者
        token.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, tokenAmount);
    }

    // 提取合约中的以太币
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // 允许所有者修改兑换率
    function setRate(uint256 newRate) external onlyOwner {
        rate = newRate;
    }

    // 允许所有者回收剩余的代币
    function withdrawTokens(uint256 amount) external onlyOwner {
        token.transfer(owner(), amount);
    }
}