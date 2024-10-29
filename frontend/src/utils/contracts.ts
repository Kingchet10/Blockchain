import Addresses from './contract-addresses.json'
import BMR from './abis/BuyMyRoom.json'
import ERC from './abis/myERC.json'
import Web3 from 'web3';

let web3 = new Web3(window.ethereum);

// 修改地址为部署的合约地址
const BMRAddress = Addresses.bmr;
const BMRABI = BMR.abi;

const ERCAddress = Addresses.erc20;
const ERCABI = ERC.abi;


// 获取合约实例
const BMRContract = new web3.eth.Contract(BMRABI, BMRAddress);
const ERC20Contract = new web3.eth.Contract(ERCABI, ERCAddress);
// 导出web3实例和其它部署的合约
export { web3, BMRContract, ERC20Contract };
