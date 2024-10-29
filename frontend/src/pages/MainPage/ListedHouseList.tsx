import React, { useState, useEffect } from 'react';
import { List, Button, message, Card, Col, Row } from 'antd';
import { BMRContract, ERC20Contract } from '../../utils/contracts';  // 导入合约实例
import houseImage from '../../assets/images/house.jpg';

interface ListedHouseListProps {
  account: string;
  onTokenBalanceUpdate: () => void;  // 添加用于刷新积分余额的回调函数
}

interface House {
  price: number;
  owner: string;
  listedTimestamp: number;
  isListed: boolean;
}

const ListedHouseList: React.FC<ListedHouseListProps> = ({ account, onTokenBalanceUpdate }) => {
  const [listedHouses, setListedHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载已挂牌房屋
  const loadListedHouses = async () => {
    setLoading(true);
    try {
      const tokenIds: number[] = await BMRContract.methods.getAllListedHouses().call();
      const houses = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const house: House = await BMRContract.methods.houses(tokenId).call();
          return {
            tokenId,
            owner: house.owner,
            price: house.price,
            listedTimestamp: house.listedTimestamp,
            isListed: house.isListed,
          };
        })
      );
      setListedHouses(houses);
    } catch (error) {
      message.error('加载挂牌房屋失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadListedHouses();
  }, []);

  // 购买房屋功能
  const approveTokensForPurchase = async () => {
    try {
      const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      await ERC20Contract.methods.approve(BMRContract.options.address, maxUint256).send({ from: account });
      message.success('授权成功');
    } catch (error) {
      message.error('授权失败: ' );
    }
  };

  const buyHouse = async (tokenId: number) => {
    try {
      await approveTokensForPurchase();
      await BMRContract.methods.buyHouseWithToken(tokenId).send({
        from: account,
      });
      message.success(`成功购买房屋 ID: ${tokenId}`);
      loadListedHouses(); // 购买后刷新列表
      onTokenBalanceUpdate(); // 调用回调函数，刷新积分余额
    } catch (error) {
      message.error('购买房屋失败: ' );
    }
  };

  return (
    <div>
      <h2>已挂牌房屋列表</h2>
      <Row gutter={[16, 16]}> {/* 使用Row和Col布局来实现卡片网格布局 */}
        {listedHouses.map((item) => (
          <Col key={item.tokenId} xs={24} sm={12} md={8} lg={6}>  {/* 设置不同屏幕大小下的列宽 */}
            <Card
              hoverable
              cover={<img alt="example" src={houseImage} style={{ height: 200, objectFit: 'cover' }} />}
              actions={[
                <Button type="primary" onClick={() => buyHouse(item.tokenId)}>
                  购买
                </Button>
              ]}
            >
              <Card.Meta
                title={`房屋 ID: ${item.tokenId}`}
                description={(
                  <>
                    <div>价格: {item.price.toString()} 积分</div>
                    <div>所有者: {item.owner}</div>
                    <div>上架时间: {new Date(Number(item.listedTimestamp) * 1000).toLocaleString()}</div>
                  </>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ListedHouseList;
