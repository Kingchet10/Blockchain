import React, { useState, useEffect } from 'react';
import { List, message, Card, Col, Row } from 'antd';
import { BMRContract } from '../../utils/contracts';  // 导入合约实例
import houseImage from '../../assets/images/house.jpg';

interface HouseListProps {
  account: string;
}

interface House {
  price: number;
  owner: string;
  listedTimestamp: number;
  isListed: boolean;
}

const HouseList: React.FC<HouseListProps> = ({ account }) => {
  const [myHouses, setMyHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载我的房屋
  const loadMyHouses = async () => {
    setLoading(true);
    try {
      const tokenIds: number[] = await BMRContract.methods.getMyHouses().call({ from: account });
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
      setMyHouses(houses);
    } catch (error) {
      
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMyHouses();
  }, [account]);

  return (
    <div>
      <h2>我的房屋列表</h2>
      <Row gutter={[16, 16]}> {/* 使用Row和Col布局来实现卡片网格布局 */}
        {myHouses.map((item) => (
          <Col key={item.tokenId} xs={24} sm={12} md={8} lg={6}> {/* 设置不同屏幕大小下的列宽 */}
            <Card
              hoverable
              cover={<img alt="house" src={houseImage} style={{ height: 200, objectFit: 'cover' }} />}
            >
              <Card.Meta
                title={`房屋 ID: ${item.tokenId}`}
                description={(
                  <div>
                    <div>所有者: {item.owner}</div>
                    <div>是否上架: {item.isListed ? '已上架' : '未上架'}</div>
                    {item.isListed && (
                      <>
                        <div>价格: {item.price.toString()} 积分</div>
                        <div>上架时间: {new Date(Number(item.listedTimestamp) * 1000).toLocaleString()}</div>
                      </>
                    )}
                  </div>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HouseList;
