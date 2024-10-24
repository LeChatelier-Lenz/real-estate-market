// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./HousieCoin.sol";


/// @title 房地产交易合约
/// @author lechatelierlenz
/// @notice 为了让房地产交易合约能够生效，需要在RealEstate合约中调用approve方法授权
import "hardhat/console.sol";

contract RESwap is IERC721Receiver {
    address payable public tokenAddr; // 房屋交易市场使用的代币
    address public nftAddr; // 房地产NFT合约地址
    uint256[] private orders; // 挂单列表
    address public feeReceiver;

    // 房屋交易市场的主要事件
    // List: 挂单事件
    event List(address indexed seller, address indexed nftAddr, uint256 indexed tokenId, uint256 price);
    // Purchase: 购买事件
    event Purchase(address indexed buyer, address indexed nftAddr, uint256 indexed tokenId, uint256 price);
    // Revoke: 撤销事件
    event Revoke(address indexed seller, address indexed nftAddr, uint256 indexed tokenId);    
    // Update: 更新价格事件
    event Update(address indexed seller, address indexed nftAddr, uint256 indexed tokenId, uint256 newPrice);

    event NFTReceived(address operator, address from, uint256 tokenId, bytes data);


    // 挂单信息
    struct HouseOrder {
        address owner;
        uint256 listedTimestamp;
        uint256 price;
    }

    constructor(address payable _tokenAddr, address _nftAddr) {
        require(_tokenAddr != address(0), "Invalid token address");
        require(_nftAddr != address(0), "Invalid NFT address");
        tokenAddr = _tokenAddr;
        nftAddr = _nftAddr;
        feeReceiver = msg.sender;
    }


    mapping(address => mapping(uint256 => HouseOrder)) public nftList;

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) public override returns (bytes4) {
        // 处理接收到的NFT，比如记录日志或触发某些操作
        emit NFTReceived(operator, from, tokenId, data);
        return IERC721Receiver.onERC721Received.selector;
    }

    // 挂单: 卖家上架NFT，合约地址为_nftAddr，tokenId为_tokenId，价格_price为wei的数量
    function list(uint256 _tokenId, uint256 _price) public{
        IERC721 _nft = IERC721(nftAddr); // 声明IERC721接口合约变量
        require(_nft.getApproved(_tokenId) == address(this), "Need Approval"); // 合约得到授权
        require(_price > 0); // 价格大于0

        HouseOrder storage _order = nftList[nftAddr][_tokenId]; //设置NF持有人和价格
        _order.owner = msg.sender;
        _order.price = _price;
        _order.listedTimestamp = block.timestamp; // 记录挂单时间
        // 将NFT转账到合约
        _nft.safeTransferFrom(msg.sender, address(this), _tokenId);
        
        orders.push(_tokenId); // 添加到挂单列表
        // 释放List事件
        emit List(msg.sender, nftAddr, _tokenId, _price);
    }

    // 撤单： 卖家取消挂单
    function revoke(uint256 _tokenId) public {
        HouseOrder storage _order = nftList[nftAddr][_tokenId]; // 取得Order        
        require(_order.owner == msg.sender, "Not Owner"); // 必须由持有人发起
        // 声明IERC721接口合约变量
        IERC721 _nft = IERC721(nftAddr);
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order"); // NFT在合约中
        
        // 将NFT转给卖家
        _nft.safeTransferFrom(address(this), msg.sender, _tokenId);
        delete nftList[nftAddr][_tokenId]; // 删除order
      
        removeOrder(_tokenId); // 从挂单列表中删除
        // 释放Revoke事件
        emit Revoke(msg.sender, nftAddr, _tokenId);
    }

    // 调整价格: 卖家调整挂单价格
    function update(uint256 _tokenId, uint256 _newPrice) public {
        require(_newPrice > 0, "Invalid Price"); // NFT价格大于0
        HouseOrder storage _order = nftList[nftAddr][_tokenId]; // 取得Order        
        require(_order.owner == msg.sender, "Not Owner"); // 必须由持有人发起
        // 声明IERC721接口合约变量
        IERC721 _nft = IERC721(nftAddr);
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order"); // NFT在合约中
        
        // 调整NFT价格
        _order.price = _newPrice;
      
        // 释放Update事件
        emit Update(msg.sender, nftAddr, _tokenId, _newPrice);
    }

    // 购买: 买家购买NFT，合约为nftAddr，tokenId为_tokenId,调用函数时需要进行HSC的转账,amount为HSC的数量
    function purchase(uint256 _tokenId) payable public {
        HouseOrder storage _order = nftList[nftAddr][_tokenId]; // 取得Order
        uint256 agencyFee = _order.price * (block.timestamp - _order.listedTimestamp) / 1000 / ( 3600 * 24 ); // 价格随时间变化     
        require(agencyFee > 0, "Invalid Fee"); // 手续费大于0
        IERC721 _nft = IERC721(nftAddr);
        require(_nft.ownerOf(_tokenId) == address(this), "Invalid Order"); // NFT在合约中
        require(_order.price > 0, "Invalid Price"); // NFT价格大于0
        // 不可购买自己的NFT
        require(_order.owner != msg.sender, "Not Allowed to Buy Yourself");
        // 将NFT转给买家
        _nft.safeTransferFrom(address(this), msg.sender, _tokenId);

        HousieCoin token = HousieCoin(tokenAddr); // 声明HousieCoin合约变量
        require(token.balanceOf(msg.sender) >= _order.price, "Not enough token balance");


        // 分别将代币转给卖家和手续费收取者，注意此处要用transferFrom，首先要approve
        require(token.allowance(msg.sender, address(this)) >= _order.price, "No Approval for Swap platform or Not enough token balance");

        // 卖家付手续费模式

        // 买家提交代币转给卖家，扣除手续费
        bool sent1 = token.transferFrom(msg.sender, _order.owner, _order.price-agencyFee);
        console.log("sent1", sent1);
        require(sent1, "Token transfer failed : Price");
        
        

        // 买家提交代币转给手续费收取者
        bool sent2 = token.transferFrom(msg.sender, feeReceiver, agencyFee);
        console.log("sent2", sent2);
        require(sent2, "Token transfer failed : Agency Fee");

        // // 将多余的代币转回给买家
        // if (token.allowance(msg.sender, address(this)) > 0) {
        //     bool sent3 = token.transferFrom(msg.sender, msg.sender, token.allowance(msg.sender, address(this)));
        //     console.log("sent3", sent3);
        //     require(sent3, "Token transfer failed : Excess");
        // }

        delete nftList[nftAddr][_tokenId]; // 删除order
        removeOrder(_tokenId); // 从挂单列表中删除
        // 释放Purchase事件
        emit Purchase(msg.sender, nftAddr, _tokenId, _order.price);
    }

    // 获取指定挂单信息
    function getOrder(uint256 _tokenId) public view returns (HouseOrder memory) {
        return nftList[nftAddr][_tokenId];
    }

    // 获取挂单列表
    function getAllOrders() public view returns (uint256[] memory) {
        return orders; //注意这里返回的是挂单列表（tokenId）
    }

    // 去除挂单列表中的某个元素,这里是tokenId
    function removeOrder(uint256 _tokenId) public {
        for (uint i = 0; i < orders.length; i++) {
            if (orders[i] == _tokenId) {
                orders[i] = orders[orders.length - 1];
                orders.pop();
                break;
            }
        }
    }

    function getAgent() public view returns (address) {
        return feeReceiver;
    }
}