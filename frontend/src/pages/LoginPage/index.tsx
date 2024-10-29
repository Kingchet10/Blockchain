import React, { useState, useEffect } from 'react';
import { Button, Select, message, Card ,Typography} from 'antd';
import { useNavigate } from 'react-router-dom'; // 用于导航
import { web3 } from '../../utils/contracts'; // 导入 web3 实例
import './index.css';
import Title from 'antd/es/typography/Title';

const { Option } = Select;

const LoginPage: React.FC = () => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [account, setAccount] = useState('');
  const navigate = useNavigate(); // React Router 的跳转钩子

  const GanacheTestChainId = '0x539';
  const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545';

  // 处理账户切换
  const handleAccountsChanged = async (newAccounts: string[]) => {
    if (newAccounts.length > 0) {
      setAccounts(newAccounts);
      setAccount(newAccounts[0]);
      message.info(`账户切换为: ${newAccounts[0]}`);
    } else {
      message.error('未找到账户，请连接到 MetaMask');
    }
  };

  const connectToGanache = async () => {
    const { ethereum } = window;
    if (!Boolean(ethereum && ethereum.isMetaMask)) {
      message.error('MetaMask 未安装');
      return;
    }

    try {
      if (ethereum.chainId !== GanacheTestChainId) {
        const chain = {
          chainId: GanacheTestChainId,
          rpcUrls: [GanacheTestChainRpcUrl],
        };

        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: GanacheTestChainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [chain],
            });
          }
        }
      }

      await ethereum.request({ method: 'eth_requestAccounts' });
      message.success('成功连接到 Ganache 网络');
    } catch (error: any) {
      message.error(`连接到 Ganache 网络失败: ${error.message}`);
    }
  };

  const loadAccounts = async () => {
    const allAccounts = await web3.eth.getAccounts();
    if (allAccounts.length > 0) {
      setAccounts(allAccounts);
      setAccount(allAccounts[0]);
    }
  };

  useEffect(() => {
    const init = async () => {
      await connectToGanache();
      await loadAccounts();
    };

    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // 登录后跳转到主页面
  const handleLogin = () => {
    if (account) {
      message.success(`登录账户: ${account}`);
      navigate('/main', { state: { account } }); // 传递账户信息到主页面
    } else {
      message.error('请选择一个账户');
    }
  };

  return (
    <div className="login-container">
      {/* 添加页面标题 */}
      <Title level={1} className="page-title">
        去中心化房屋购买系统
      </Title>

      {/* 登录表单卡片 */}
      <Card className="login-card" title="登录 DApp" bordered={false}>
        <p>当前账户: {account ? account : '未连接'}</p>

        <Select
          style={{ width: 300, marginBottom: 20 }}
          onChange={(value: string) => setAccount(value)}
          value={account}
        >
          {accounts.map(acc => (
            <Option key={acc} value={acc}>
              {acc}
            </Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleLogin}>
          登录
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage;
