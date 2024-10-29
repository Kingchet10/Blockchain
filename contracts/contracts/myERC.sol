// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract myERC is ERC20 {

    address public feeAccount;

    constructor() ERC20("MyToken", "MTK") {
        feeAccount = msg.sender;
    }

    // 用户通过发送 ETH 购买积分
    function buyToken() external payable {
        require(msg.value > 0, "Must send ETH to buy tokens");

        uint256 tokensToMint = (msg.value * 1000) / 1 ether;  // 1 ETH = 1000 积分
        _mint(msg.sender, tokensToMint);
    }

    // 用户使用积分兑换 ETH
    function redeemEth(uint256 tokenAmount) external {
        require(balanceOf(msg.sender) >= tokenAmount, "Not enough tokens to redeem");

        uint256 ethAmount = (tokenAmount * 1 ether) / 1000;  // 1000 积分 = 1 ETH
        require(address(this).balance >= ethAmount, "Not enough ETH in contract");

        _burn(msg.sender, tokenAmount);  // 销毁积分
        payable(msg.sender).transfer(ethAmount);  // 转移相应的 ETH
    }

    // 管理员可以提取多余的 ETH
    function withdrawExcessEth(uint256 amount) external  {
        require(msg.sender == feeAccount, "Only owner can withdraw excess ETH");
        require(address(this).balance >= amount, "Not enough ETH in contract");
        payable(feeAccount).transfer(amount);
    }

    // 管理员可以存入 ETH 到合约
    function depositEth() external payable  {
          require(msg.sender == feeAccount, "Only owner can withdraw excess ETH");
        require(msg.value > 0, "Must send ETH to deposit");
    }

    // 查看合约的 ETH 余额
    function getContractEthBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
