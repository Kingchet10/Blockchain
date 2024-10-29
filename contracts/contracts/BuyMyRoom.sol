// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// 引入openzeppelin的ERC721标准库
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
// 引入console.log用于调试
import "hardhat/console.sol";

contract BuyMyRoom is ERC721 {

    // 事件：房屋上架
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseDelisted(uint256 indexed tokenId, address indexed owner);
    event HouseSold(uint256 tokenId, uint256 price, address seller, address buyer);
    
    // ERC20 代币地址，用于积分购买房屋
    IERC20 public token;

    // 房屋信息结构体
    struct House {
        address owner;
        uint256 price;           // 房屋价格 (ERC20代币/以太坊)
        uint256 listedTimestamp; // 上架时间
        bool isListed;           // 是否上架
    }

    // 房屋信息映射，使用房屋的tokenId作为key
    mapping(uint256 => House) public houses;
    uint256[] public listedHouses;
    
    // 手续费比例，假设为 1%（千分之一）
    uint256 public feeRate = 1; // 千分比
    uint256 public count = 1;
    
    // 手续费接收账户
    address public feeAccount;

    constructor(IERC20 _token) ERC721("BuyMyRoom", "BMR") {
        token = _token;
        feeAccount = msg.sender;
    }

    // 发行NFT，代表一栋房屋
    function mintHouse(address to) public{
        require(msg.sender == feeAccount, "Only owner can mint new houses") ;
        uint256 tokenId = count;
        count++;
        _safeMint(to, tokenId);
        houses[tokenId] = House({
            owner: to,
            price: 0,
            listedTimestamp: 0,
            isListed: false
        });
    }

    // 将房屋上架出售
    function listHouse(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        require(price > 0, "Price must be greater than zero");
        require(houses[tokenId].isListed == false, "You cannot list a house twice");
        
        houses[tokenId].price = price;
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].isListed = true;
        
        listedHouses.push(tokenId);
        emit HouseListed(tokenId, price, msg.sender);
    }

    function removeHouse(uint256[] storage array, uint256 value) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1]; // 移动最后一个元素并弹出
                array.pop();
                break;
            }
        }
    }

    // 将房屋下架
    function delistHouse(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        require(houses[tokenId].isListed == true, "House is not listed");
        
        houses[tokenId].isListed = false;
        houses[tokenId].listedTimestamp = 0;
        removeHouse(listedHouses, tokenId);
        
        emit HouseDelisted(tokenId, msg.sender);
    }

    // 查询所有挂牌房屋
    function getAllListedHouses() public view returns (uint256[] memory) {
        return listedHouses;
    }

     function calculateFee(House memory house) internal view returns (uint256) {
        uint256 fee = (block.timestamp - house.listedTimestamp) * feeRate * house.price / 3600;
        uint256 maxFee = house.price / 2;
        if (fee > maxFee) {
            fee = maxFee;
        }
        uint256 minFee = 1; 
       if (fee < minFee) {
        fee = minFee;
      }
     return fee;
    }

    // 使用ERC20代币购买房屋
    function buyHouseWithToken(uint256 tokenId) public {
        House memory house = houses[tokenId];
        require(house.isListed, "House is not listed for sale");
        require(houses[tokenId].owner != msg.sender, "You already own this house");
        
        uint256 fee = calculateFee(house);
        uint256 sellerAmount = house.price - fee;

        // 转移ERC20代币
        require(token.transferFrom(msg.sender, house.owner, sellerAmount), "Token transfer failed");
        require(token.transferFrom(msg.sender, feeAccount, fee), "Fee transfer failed");

        // 转移房屋所有权
        _transfer(house.owner, msg.sender, tokenId);

        houses[tokenId].owner = msg.sender;
        houses[tokenId].isListed = false;
        removeHouse(listedHouses, tokenId);

        emit HouseSold(tokenId, house.price, house.owner, msg.sender);
    }

    // 获取用户的房屋
    function getMyHouses() public view returns (uint256[] memory) {
        uint256 ownerBalance = balanceOf(msg.sender);
        uint256[] memory result = new uint256[](ownerBalance);
        uint256 counter = 0;

        for (uint256 i = 1; i < count; i++) {
            if (houses[i].owner == msg.sender) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    // 更新手续费账户
    function updateFeeAccount(address newFeeAccount) public  {
        require(msg.sender == feeAccount, "Only owner can do this") ;
        feeAccount = newFeeAccount;
    }

    // 返回 "hello world" 测试函数
    function helloworld() pure external returns (string memory) {
        return "hello world";
    }
}
