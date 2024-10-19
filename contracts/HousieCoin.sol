// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/// @title HousieCoin代币合约
/// @author lechatelierlenz
/// @notice 
contract HousieCoin is ERC20, Ownable {
    constructor() ERC20("HousieCoin", "HSC") Ownable(msg.sender) {
        // 初始步骤：为合约的所有者铸造100个HousieCoin
        _mint(msg.sender, 100);
    }
    // 为指定地址铸造HousieCoin
    function mint(address to,  uint256 amount) public onlyOwner {
        // ps: Ownable合约提供的onlyOwner修饰符确保只有合约的所有者才能调用此函数
        _mint(to, amount);
    }
}