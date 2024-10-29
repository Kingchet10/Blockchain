import { ethers } from "hardhat";

async function main() {
  // 部署 ERC20 合约
  console.log("Deploying myERC contract...");
  const MyToken = await ethers.getContractFactory("myERC");
  const myToken = await MyToken.deploy();
  console.log("myERC deployed, waiting for confirmation...");
  await myToken.deployed();
  console.log("myERC deployed to:", myToken.address);

  // 部署 ERC721 合约，传递 ERC20 合约的地址作为构造函数参数
  console.log("Deploying BuyMyRoom (ERC721) contract...");
  const BuyMyRoom = await ethers.getContractFactory("BuyMyRoom");

  // 将 ERC20 代币合约地址作为构造函数参数传入，而不是放在 overrides 中
  
  const buyMyRoom = await BuyMyRoom.deploy(myToken.address);  // 正确地将 ERC20 的地址作为构造函数参数传入

  console.log("Contract deployed, waiting for confirmation...");
  await buyMyRoom.deployed();
  console.log("BuyMyRoom (ERC721) deployed to:", buyMyRoom.address);
}

main().catch((error) => {
  console.error("Error during deployment:", error);
  process.exit(1);
});
