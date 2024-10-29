import React, { useState } from 'react';
import { Button, Input, message, Card, Typography, Space, Divider, Tooltip } from 'antd';
import { ERC20Contract, web3 } from '../../utils/contracts';
import { InfoCircleOutlined } from '@ant-design/icons';
import './ExchangeTokens.css'; // 导入 CSS 样式

const { Title, Text } = Typography;

interface ExchangeTokensProps {
  type: 'buy' | 'redeem';
  account: string;
  onExchange: () => void;  // 添加 onExchange 属性
}

const ExchangeTokens: React.FC<ExchangeTokensProps> = ({ type, account, onExchange }) => {
  const [ethAmount, setEthAmount] = useState<number | undefined>();

  const handleExchange = async () => {
    if (!ethAmount || ethAmount <= 0) {
      message.error('请输入有效的数量');
      return;
    }
    try {
      if (type === 'buy') {
        await ERC20Contract.methods.buyToken().send({
          from: account,
          value: web3.utils.toWei(ethAmount.toString(), 'ether'),
        });
        message.success('ETH兑换积分成功');
      } else if (type === 'redeem') {
        await ERC20Contract.methods.redeemEth(ethAmount).send({
          from: account,
        });
        message.success('积分兑换ETH成功');
      }

      onExchange();  // 调用传入的 onExchange 函数，更新积分余额
      setEthAmount(undefined); // 重置输入框
    } catch (error) {
      message.error('兑换失败');
    }
  };

  return (
    <div className="exchange-container">
      <Card className="exchange-card">
        <Title level={2} className="exchange-title">
          {type === 'buy' ? 'ETH 兑换 积分' : '积分 兑换 ETH'}
        </Title>

        <Divider className="exchange-divider" />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Input
            className="exchange-input"
            placeholder={type === 'buy' ? '输入 ETH 数量' : '输入兑换的积分数量'}
            value={ethAmount}
            onChange={(e) => setEthAmount(Number(e.target.value))}
            suffix={
              <Tooltip title={type === 'buy' ? '您将花费的 ETH 数量' : '您想要兑换的积分数量'}>
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
          <Button
            type="primary"
            size="large"
            onClick={handleExchange}
            block
            className="exchange-button"
          >
            {type === 'buy' ? '兑换积分' : '兑换 ETH'}
          </Button>
        </Space>

        <Divider className="exchange-divider" />

        <Text className="exchange-note">
          {type === 'buy'
            ? '使用您的 ETH 兑换等值积分，享受更多权益。'
            : '将您的积分兑换为 ETH，灵活管理您的资产。'}
        </Text>
      </Card>
    </div>
  );
};

export default ExchangeTokens;
