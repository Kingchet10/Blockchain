# ZJU-blockchain-course-2024-去中心化房屋购买系统



## 一、项目介绍

##### **简介**： 

BuyMyRoom 是一个基于区块链的房产交易平台，用户可以通过 NFT（不可替代代币）来表示每一个房产，并使用平台内的 ERC20 代币 "MyToken" (MTK) 进行房屋的购买和交易。每个房产都作为唯一的 NFT 铸造，并通过上架和下架功能来管理上市状态。同时，平台设置了灵活的手续费计算系统，通过智能合约实现透明、安全的交易。



##### 主要功能

1. **房产铸造与管理**
   - **`mintHouse(address to)`**：
     仅管理员（合约部署者）可以调用该函数，为指定用户铸造新的房产 NFT，分配唯一的 `tokenId`。每个新房产会默认设置为未上架，价格为 0。该功能保证了房产资源的唯一性和稀缺性，同时确保只有管理员才有权利铸造新房产。
2. **房产上架与下架**
   - **`listHouse(uint256 tokenId, uint256 price)`**：
     用户可以调用该函数将自己拥有的房产上架销售，并设定价格（使用 MTK 代币计价）。调用时需要确认用户是房屋的所有者，且房产尚未上架。成功上架后，房屋的上架状态被更新，记录当前时间戳，并通过 `HouseListed` 事件通知其他用户。所有上架的房产都会被添加到 `listedHouses` 列表中，以便查看。
   - **`delistHouse(uint256 tokenId)`**：
     房产所有者可以随时调用该函数下架自己的房产，确保房屋交易的灵活性。调用时确认房产是上架状态，函数将其设置为未上架并清除上架时间戳，同时将房产从 `listedHouses` 列表中移除。下架成功后，通过 `HouseDelisted` 事件进行通知。
3. **查询房产信息**
   - **`getAllListedHouses()`**：
     该函数为公开函数，无需权限，可供所有用户查看当前平台上所有已上架的房产。返回一个包含所有已上架房屋 `tokenId` 的数组，方便用户了解市场上的可交易房产。
   - **`getMyHouses()`**：
     用户可以调用该函数查看自己拥有的所有房产。该函数会遍历用户所拥有的房产 NFT，并返回一个包含这些房产 `tokenId` 的数组，让用户清晰了解自己的房产清单。
4. **房产购买**
   - **`buyHouseWithToken(uint256 tokenId)`**：
     用户可以使用 MTK 代币购买已上架的房产。调用时会检查房产是否已上架，且调用者不是房产所有者。然后会调用 `calculateFee` 函数计算手续费，从购买金额中扣除并转给手续费账户 `feeAccount`，剩余部分转给卖家。交易完成后，房产所有权通过 `_transfer` 函数转移至买家，并将房产从上架列表中移除，触发 `HouseSold` 事件以记录交易信息。
5. **手续费计算**
   - **`calculateFee(House memory house)`**：
     该内部函数用于计算每笔房屋交易的手续费。手续费基于房产上架时间动态计算，公式为：`(上架时间差 * 手续费率 * 房产价格) / 3600`。同时设置了最小手续费为 1、最大手续费为房价的一半，保证交易公平性和流通性。
6. **MTK代币购买**
   - **`buyToken()`**：
     用户可以通过发送 ETH 调用该函数，平台按照比例（1 ETH = 1000 MTK）铸造并分配 MTK 代币。ETH 金额会存入合约余额，用于后续的代币兑换。
7. **MTK 代币兑换 ETH**
   - **`redeemEth(uint256 tokenAmount)`**：
     用户可以调用该函数将持有的 MTK 代币兑换成 ETH。合约会按照比例将相应的 ETH 转给用户，成功兑换后会销毁用户的 MTK 代币。用户可以灵活兑换代币与 ETH，提升代币的实用性。



## 二、功能实现分析

1. ##### 房产铸造与管理

   - `mintHouse(address to)`：

     - 功能描述：此函数用于铸造新的房产 NFT，仅限管理员调用。房产 NFT 将分配一个唯一的 `tokenId`，并设置初始价格为 0，初始状态为未上架。

     - 实现细节：

       ```
       solidityCopy codefunction mintHouse(address to) public {
           require(msg.sender == feeAccount, "Only owner can mint new houses");
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
       ```

       该函数首先验证调用者是否为管理员feeAcount, 只有管理员才能铸造新房产。接着分配新的 tokenId，使用 OpenZeppelin 的 _safeMint 函数铸造 NFT，并将其分配给指定地址。最后，初始化 houses映射中的房产信息。

       

2. **房产上架**

- `listHouse(uint256 tokenId, uint256 price)`:

  - 功能描述：房产所有者调用该函数将房屋上架，并设定房产价格。

  - 实现细节：

    ```
    solidityCopy codefunction listHouse(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        require(price > 0, "Price must be greater than zero");
        require(houses[tokenId].isListed == false, "You cannot list a house twice");
        
        houses[tokenId].price = price;
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].isListed = true;
        
        listedHouses.push(tokenId);
        emit HouseListed(tokenId, price, msg.sender);
    }
    ```

    函数首先检查调用者是否是该房产的所有者，且房产尚未上架，同时确保设定价格大于零。验证通过后，更新房产价格、上架时间戳和状态，并将 tokenId添加至 listedHouses 列表。最后，通过事件 HouseListed通知其他用户。

    

3. **房产下架**

- **`delistHouse(uint256 tokenId)`**：

  - 功能描述：房产所有者可以调用此函数将房产从上架状态下架。

  - 实现细节：

    ```
    solidityCopy codefunction delistHouse(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this house");
        require(houses[tokenId].isListed == true, "House is not listed");
        
        houses[tokenId].isListed = false;
        houses[tokenId].listedTimestamp = 0;
        removeHouse(listedHouses, tokenId);
        
        emit HouseDelisted(tokenId, msg.sender);
    }
    ```

    函数首先验证调用者是否是房产所有者，并检查房产是否已上架。若条件满足，则将房产状态设置为未上架，清除上架时间戳，并调用 removeHouse 函数从 removeHouse列表中移除该房产。下架成功后，通过 HouseDelisted 事件进行通知。

- **`removeHouse(uint256[] storage array, uint256 value)`**：

  - 功能描述：从数组中移除特定 `tokenId`，用于维护上架列表 `listedHouses` 的清洁。

  - 实现细节：

    ```
    solidityCopy codefunction removeHouse(uint256[] storage array, uint256 value) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    ```

    该函数遍历 listedHouse 数组，找到并删除指定的 tokenId，通过将最后一个元素移动到该位置以避免数组中断。



4. **房产查询**

- **`getAllListedHouses()`**：

  - 功能描述：获取所有当前上架的房产 ID。

  - 实现细节：

    ```
    solidityCopy codefunction getAllListedHouses() public view returns (uint256[] memory) {
        return listedHouses;
    }
    ```

    函数直接返回 listedHouses 数组，允许用户查看所有已上架的房产。

- **`getMyHouses()`**：

  - 功能描述：获取当前调用者拥有的所有房产。

  - 实现细节：

    ```
    solidityCopy codefunction getMyHouses() public view returns (uint256[] memory) {
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
    ```

    函数创建一个数组 result，用于存储当前调用者的房产 tokenId。然后遍历所有房产，将所有者与调用者匹配的房产 ID 添加到数组中。

    

5. ##### **房产购买**

- `buyHouseWithToken(uint256 tokenId)`：

  - 功能描述：用户使用 ERC20 代币购买已上架的房产。

  - 实现细节：

    ```
    solidityCopy codefunction buyHouseWithToken(uint256 tokenId) public {
        House memory house = houses[tokenId];
        require(house.isListed, "House is not listed for sale");
        require(houses[tokenId].owner != msg.sender, "You already own this house");
        
        uint256 fee = calculateFee(house);
        uint256 sellerAmount = house.price - fee;
    
        require(token.transferFrom(msg.sender, house.owner, sellerAmount), "Token transfer failed");
        require(token.transferFrom(msg.sender, feeAccount, fee), "Fee transfer failed");
    
        _transfer(house.owner, msg.sender, tokenId);
    
        houses[tokenId].owner = msg.sender;
        houses[tokenId].isListed = false;
        removeHouse(listedHouses, tokenId);
    
        emit HouseSold(tokenId, house.price, house.owner, msg.sender);
    }
    ```

    函数首先检查房产是否上架，且买家并非当前所有者。然后调用 calculateFee 计算手续费，从房产价格中扣除并分配给手续费账户 feeAccount，剩余部分转移给卖家。接着调用 _transfer。完成房产 NFT 的所有权转移。最后，通过事件 HouseSold 通知交易成功。

- `calculateFee(House memory house)`：

  - 功能描述：计算房产交易中的手续费，基于上架时间和房产价格进行动态计算。

  - 实现细节：

    ```
    solidityCopy codefunction calculateFee(House memory house) internal view returns (uint256) {
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
    ```

    函数根据房产的上架时间、手续费比例、价格计算动态手续费，设定最大手续费为价格的 50%，最小手续费为 1 确保最低收费标准。

    

6. ##### 兑换MTK积分

   - 功能描述：用户可以通过发送 ETH 来购买平台的积分（即 ERC20 代币），并按照 1 ETH = 1000 积分的比例进行兑换。购买的积分会直接铸造到调用者的账户中。

   - 实现细节：

   ```
   solidityCopy codefunction buyToken() external payable {
       require(msg.value > 0, "Must send ETH to buy tokens");
   
       uint256 tokensToMint = (msg.value * 1000) / 1 ether;  // 1 ETH = 1000 积分
       _mint(msg.sender, tokensToMint);
   }
   ```

   - 步骤解析：

     1. ```
        require(msg.value > 0, "Must send ETH to buy tokens");
        ```

        - 验证用户发送的 ETH 金额是否大于 0，以防止无效交易。

     2. ```
        uint256 tokensToMint = (msg.value * 1000) / 1 ether;
        ```

        - 计算用户应获得的积分数量。按比例计算出用户发送的 ETH 应兑换的积分数量，这里 1 ETH 对应 1000 积分。

     3. ```
        _mint(msg.sender, tokensToMint);
        ```

        - 使用 OpenZeppelin 的 `_mint` 函数将计算得出的积分铸造到用户的账户上。

          

7. ##### 用积分兑换ETH货币

   - 功能描述：用户可以调用 `redeemEth` 函数，将持有的积分（MTK 代币）按照比例（1000 积分 = 1 ETH）兑换为 ETH。积分兑换后会被销毁，ETH 从合约余额中转给用户。

   - 实现细节：

   ```
   solidityCopy codefunction redeemEth(uint256 tokenAmount) external {
       require(balanceOf(msg.sender) >= tokenAmount, "Not enough tokens to redeem");
   
       uint256 ethAmount = (tokenAmount * 1 ether) / 1000;  // 1000 积分 = 1 ETH
       require(address(this).balance >= ethAmount, "Not enough ETH in contract");
   
       _burn(msg.sender, tokenAmount);  // 销毁积分
       payable(msg.sender).transfer(ethAmount);  // 转移相应的 ETH
   }
   ```

   - 步骤解析：

     1. ```
        require(balanceOf(msg.sender) >= tokenAmount, "Not enough tokens to redeem");
        ```

        - 验证用户账户中是否有足够的积分，以避免无效交易。

     2. ```
        uint256 ethAmount = (tokenAmount * 1 ether) / 1000;
        ```

        - 按比例计算出应支付给用户的 ETH 数量，1000 积分兑换 1 ETH。

     3. ```
        require(address(this).balance >= ethAmount, "Not enough ETH in contract");
        ```

        - 验证合约中是否有足够的 ETH 支付该兑换金额，确保合约的流动性。

     4. ```
        _burn(msg.sender, tokenAmount);
        ```

        - 调用 `_burn` 函数销毁用户兑换的积分。

     5. ```
        payable(msg.sender).transfer(ethAmount);
        ```

        - 使用 `transfer` 函数将计算出的 ETH 数额发送给用户，完成兑换。

          

## 三、项目运行方法

1. 在本地启动ganache应用。

2. 在 `./contracts` 中安装需要的依赖，运行命令：npm install

3. 在 `./contracts/hardhat.config.ts` 中，将 accounts 修改为对应ganache账户私钥

4. 在 `./contracts` 中编译合约，运行命令：npx hardhat compile

5. 在 `./contracts` 中将合约部署到 ganache，运行命令：npx hardhat run ./scripts/deploy.ts --network ganache

   terminal会输出两个地址，一个是 `BuyMyRoom` 合约部署地址、一个是其中的 `myERC` 合约部署地址。

6. 将 `./frontend/src/utils` 的 `contract-addresses.json` 的两个值分别改为上述步骤的两个地址；

   将 `./frontend/src/utils/abis` 的两个json文件替换为 `./contracts/artifacts/contracts` 下的 `BuyMyRoom.json` 和 `myERC.json`

7. 在 `./frontend` 中安装需要的依赖，运行命令：npm install

8. 在 `./frontend` 中启动前端程序，运行命令：npm run start

   

## 四、项目运行截图

- 在npm run start执行后，在google浏览器访问 localhost:3000

  ![6e25964a09770cef7ea9894d02c13ac](.\graph\Temp\6e25964a09770cef7ea9894d02c13ac.png)

- 在弹出的小狐狸窗口中输入密码，然后就可以选择用户登录啦

  ![1730204222006](.\graph\Temp\1730204222006.png)

- 登录后直接进入我的房屋列表页面，显示该用户名下的所有房屋

  ![1730204272038](.\graph\Temp\1730204272038.png)

- 我选择登录的该用户就是这个模型的部署者，因此它可以铸造房屋，我选择给他自己铸造房屋

  ![1730204349316](.\graph\Temp\1730204349316.png)

  

- 然后就可以看到该用户的房屋列表多了一个房屋

  ![1730204550907](.\graph\Temp\1730204550907.png)

  

- 这时我准备用ETH兑换积分，这里我准备使用两个ETH来兑换积分，注意本应用的比值是1ETH兑换1000积分

  ![1730204648072](.\graph\Temp\1730204648072.png)

  兑换前的账户ETH余额:

  ![1730205343861](.\graph\Temp\1730205343861.png)

  兑换后：

  ![1730205396102](.\graph\Temp\1730205396102.png)

  ![1730205421722](.\graph\Temp\1730205421722.png)

  

- 然后我兑换积分为ETH，这里把2000积分兑换回ETH

  兑换前：

  ![1730206273088](.\graph\Temp\1730206273088.png)

  ![1730206297125](.\graph\Temp\1730206297125.png)

  兑换后：

  ![1730206317856](.\graph\Temp\1730206317856.png)

  ![1730206328994](.\graph\Temp\1730206328994.png)

  

- 现在我要上架刚刚铸造的ID为9的房屋

  ![1730206559205](.\graph\Temp\1730206559205.png)

​          900 是积分价格

![1730206592551](.\graph\Temp\1730206592551.png)



- 这是下架房屋，我下架这个ID为9的房屋：

  ![1730206623274](.\graph\Temp\1730206623274.png)

  ![1730206688308](.\graph\Temp\1730206688308.png)

- 在准备出售的房屋这里，可以看到已经上架的所有房屋：

  ![1730207070591](.\graph\Temp\1730207070591.png)

然后我换一个账号登录，来购买一个房屋

![1730207235033](.\graph\Temp\1730207235033.png)

![1730207273652](.\graph\Temp\1730207273652.png)

![1730207289985](.\graph\Temp\1730207289985.png)

![1730207301988](.\graph\Temp\1730207301988.png)

可以看到这里的我的房屋列表里，ID为9的房屋变成了它的，并且默认没有上架。可以看到购买其花了该用户900积分，其积分余额从9997变成了9097