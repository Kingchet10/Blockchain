import React, { useState } from 'react';
import { Button, Input, message, Card, Typography, Space, Tooltip, Divider } from 'antd';
import { BMRContract } from '../../utils/contracts';
import { InfoCircleOutlined } from '@ant-design/icons';
import './MintHouse.css'; // 导入 CSS 样式

const { Title, Text } = Typography;

interface MintHouseProps {
  account: string;
}

const MintHouse: React.FC<MintHouseProps> = ({ account }) => {
  const [recipient, setRecipient] = useState(''); // 房屋接收者地址

  const handleMintHouse = async () => {
    if (!recipient) {
      message.error('请输入接收地址');
      return;
    }

    try {
      // 调用智能合约中的 mintHouse 方法进行铸造
      await BMRContract.methods.mintHouse(recipient).send({
        from: account,
      });
      message.success('房屋铸造成功');
      setRecipient(''); // 重置输入框
    } catch (error: any) {
      message.error('铸造失败: ' + error.message);
    }
  };

  return (
    <div className="mint-container">
      <Card className="mint-card">
        {/* 标题部分 */}
        <Title level={2} className="mint-title">
          铸造房屋
        </Title>

        {/* 分割线 */}
        <Divider className="mint-divider" />

        {/* 输入框和按钮 */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            className="mint-input"
            placeholder="输入接收者地址"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            prefix={<InfoCircleOutlined style={{ color: '#8B8B8B' }} />}
          />
          <Button
            type="primary"
            size="large"
            onClick={handleMintHouse}
            block
            className="mint-button"
          >
            铸造房屋
          </Button>
        </Space>

        {/* 备注信息 */}
        <Text className="mint-note">
          请确保接收者地址正确，铸造的房屋将直接发送至该地址。
        </Text>
      </Card>
    </div>
  );
};

export default MintHouse;
