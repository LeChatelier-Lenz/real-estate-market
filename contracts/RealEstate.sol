// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title 房地产NFT合约
/// @author lechatelierlenz
/// @notice 
contract RealEstate is Ownable, ERC721 {
    uint256 private _nextTokenId;
    mapping(address => uint256[]) private _ownedTokens;

    constructor() ERC721("RealEstate", "RE") Ownable(msg.sender) {
        // 初始步骤：为合约的所有者颁发一个房地产NFT
        // awardRE(owner());

        // 给一定数量的账户初始化颁发房地产NFT
        // 假如给定的账户数量为5，并且初始化5个账户地址
        address[] memory accounts = new address[](5);
        accounts[0] = 0x740f37411Bc676BDb18f29B65dC29c846f8db04B;
        accounts[1] = 0x8973DB38E758f9fe169E3Df78eC768032BB43D3b;
        accounts[2] = 0xf56a14e8172b102FbaBC56aC69945f5804fb20Ce;
        accounts[3] = 0x4f741fb1220114872D10371706c9de310F30CF1c;
        accounts[4] = 0xa0D86a03ca62605A2040e6bc0034AFcAEDA3Fffc;
        for (uint i = 0; i < accounts.length; i++) {
            awardRE(accounts[i]);
        }
    }

    // 为指定地址颁发一个房地产NFT
    function awardRE(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
    }

    // 重载_update方法，附带更新_ownedTokens,将旧的所有者的token列表中的tokenId删除，将新的所有者的token列表中添加tokenId
    // 其中_update是ERC721.sol中的内部方法，用于_mint和transfer方法中更新token的所有者
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address result = super._update(to, tokenId, auth);
        address oldOwner = ownerOf(tokenId);
        if (oldOwner != address(0)) {
            uint256[] storage oldOwnerTokens = _ownedTokens[oldOwner];
            for (uint i = 0; i < oldOwnerTokens.length; i++) {
                if (oldOwnerTokens[i] == tokenId) {
                    oldOwnerTokens[i] = oldOwnerTokens[oldOwnerTokens.length - 1];
                    oldOwnerTokens.pop();
                    break;
                }
            }
        }
        _ownedTokens[to].push(tokenId);
        return result;
    }

    // 返回指定地址的房地产NFT列表
    function tokensOf(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }
}