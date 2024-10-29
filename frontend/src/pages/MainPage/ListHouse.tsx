import React, { useState } from 'react';
import { Input, Button, message, Card, Typography, Space } from 'antd';
import { BMRContract } from '../../utils/contracts';

const { Title } = Typography;

interface ListHouseProps {
  account: string;
}

const ListHouse: React.FC<ListHouseProps> = ({ account }) => {
  const [tokenId, setTokenId] = useState<number | undefined>(undefined); // 房屋 ID
  const [price, setPrice] = useState<number | undefined>(undefined); // 房屋价格

  // 上架房屋的处理函数
  const handleListHouse = async () => {
    if (!tokenId || !price) {
      message.error('请输入有效的房屋 ID 和价格');
      return;
    }
    try {
      await BMRContract.methods.listHouse(tokenId, price).send({ from: account });
      message.success('房屋成功上架');
    } catch (error: any) {
      message.error(`上架失败: ${error.message}`);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0f0f0, #ffffff)',  // 几何渐变背景
      padding: '40px 20px',
      minHeight: '80vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Card
        style={{
          maxWidth: 400,
          padding: '40px',
          borderRadius: '12px',
          background: '#fff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* 几何装饰条 */}
        <div style={{
          width: '60px',
          height: '4px',
          backgroundColor: '#007aff',
          margin: '0 auto 20px',
          borderRadius: '2px',
        }} />

        <Title level={3} style={{ fontWeight: 500, marginBottom: '30px', color: '#333' }}>
          上架房屋
        </Title>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            placeholder="房屋 ID"
            style={{
              borderRadius: '8px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #d9d9d9',
              backgroundColor: '#f7f7f7',
              transition: 'border-color 0.3s',
            }}
            onChange={(e) => setTokenId(Number(e.target.value))}
            onFocus={(e) => (e.target.style.borderColor = '#007aff')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
          <Input
            placeholder="房屋价格"
            style={{
              borderRadius: '8px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #d9d9d9',
              backgroundColor: '#f7f7f7',
              transition: 'border-color 0.3s',
            }}
            onChange={(e) => setPrice(Number(e.target.value))}
            onFocus={(e) => (e.target.style.borderColor = '#007aff')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
          <Button
            type="primary"
            onClick={handleListHouse}
            style={{
              borderRadius: '8px',
              width: '100%',
              padding: '10px 0',
              backgroundColor: '#007aff',
              border: 'none',
              fontSize: '16px',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007aff')}
          >
            上架房屋
          </Button>
        </Space>

        {/* 几何装饰块 */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#007aff',
          borderRadius: '50%',
          opacity: 0.1,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-20px',
          width: '80px',
          height: '80px',
          backgroundColor: '#007aff',
          borderRadius: '50%',
          opacity: 0.1,
        }} />
      </Card>
    </div>
  );
};

export default ListHouse;
