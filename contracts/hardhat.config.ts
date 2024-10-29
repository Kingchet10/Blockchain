import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0xb2d1151829719d4b8d3fb459171f3abdf0d9a942c2d3ee1563993107ae0e50df',
        '0x3638aa37f998ac0f8f36be3c09a25f119d13cf1bf24134d5d4db9802e0a5ac23',
        '0x8e9c1bf04407f073e7d743ec4817b1e29458eb86ebc85a709ee4edc454968daa',
        '0x027333aa96100a5fd35b204d1de7db7bdbbc490cf4efc8ff590df4324d3a8d41',
        '0xecd602a5cfe03074ceec6a6e0b9dbe48c41e2adab15713645f080c3adbb0f491',
        '0x4550d318dc11993cab3c10d688e77f80b4e6d6015cc9821ec50b97aa98192d8b',
        '0x4ca25eb80940cabc29b02f031d87b02b419fbd3a071ddd42fb01f16c6bdea925'
      ],
      
    },
  },
};

export default config;
