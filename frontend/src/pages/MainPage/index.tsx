import React, { useState, useEffect } from 'react';
import { Layout, Menu, message, Typography, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons'; // 引入图标
import { BMRContract, ERC20Contract, web3 } from '../../utils/contracts';
import HouseList from './HouseList';
import ListedHouseList from './ListedHouseList';
import ExchangeTokens from './ExchangeTokens';
import MintHouse from './MintHouse';
import ListHouse from './ListHouse';
import DelistHouse from './DelistHouse';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 初始化 useNavigate 用于跳转
  const [collapsed, setCollapsed] = useState(false);
  const [account, setAccount] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('1');
  const [balance, setBalance] = useState(0);

  const handleMenuClick = (e: any) => {
    setSelectedMenu(e.key);
  };

  const loadTokenBalance = async () => {
    if (!account) return;
    try {
      const balance = await ERC20Contract.methods.balanceOf(account).call();
      setBalance(Number(balance));
    } catch (error) {
      message.error('加载积分余额失败');
    }
  };

  useEffect(() => {
    loadTokenBalance();
  }, [account]);

  useEffect(() => {
    if (location.state && location.state.account) {
      setAccount(location.state.account);
      message.success(`登录账户: ${location.state.account}`);
    } else {
      const init = async () => {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          message.success(`获取到账户: ${accounts[0]}`);
        } else {
          message.error('未连接到钱包');
        }
      };
      init();
    }
  }, [location.state]);

  const handleTokenExchange = async () => {
    await loadTokenBalance();
  };

  // 添加返回登录页面的功能
  const handleLogout = () => {
    message.success('已退出登录');
    navigate('/'); // 跳转到登录页面
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)' }}>
      {/* 左侧菜单栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ backgroundColor: '#1d1f27', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} // 使用flex布局
      >
        <div>
          <div
            className="logo"
            style={{
              color: 'white',
              padding: '20px',
              textAlign: 'center',
              fontSize: '24px',
              letterSpacing: '2px',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            BMR DApp
          </div>
          <Menu
            theme="dark"
            defaultSelectedKeys={['1']}
            mode="inline"
            onClick={handleMenuClick}
            style={{ backgroundColor: '#1d1f27' }}
          >
            <Menu.Item key="1">我的房屋列表</Menu.Item>
            <Menu.Item key="2">准备出售的房屋</Menu.Item>
            <Menu.Item key="3">上架房屋</Menu.Item>
            <Menu.Item key="4">下架房屋</Menu.Item>
            <Menu.Item key="5">兑换 ETH 为积分</Menu.Item>
            <Menu.Item key="6">兑换积分为 ETH</Menu.Item>
            <Menu.Item key="7">铸造房屋</Menu.Item>
          </Menu>
        </div>

        {/* 退出登录按钮，放在Sider底部 */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleLogout}
          style={{
            color: '#fff',
            width: '100%',
            textAlign: 'left',
            padding: '20px',
            background: 'transparent',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFEB3B')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
        >
          退出登录
        </Button>
      </Sider>

      {/* 右侧内容区域 */}
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: '20px',
            background: 'linear-gradient(90deg, #4c63d2, #9532a8)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
            地址：{account}
          </Text>
          <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
            积分余额：{balance}
          </Text>
        </Header>

        <Content
          style={{
            margin: '40px 20px',
            padding: '20px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
          }}
        >
          {selectedMenu === '1' && <HouseList account={account} />}
          {selectedMenu === '2' && <ListedHouseList account={account} onTokenBalanceUpdate={handleTokenExchange} />}
          {selectedMenu === '5' && <ExchangeTokens type="buy" account={account} onExchange={handleTokenExchange} />}
          {selectedMenu === '6' && <ExchangeTokens type="redeem" account={account} onExchange={handleTokenExchange} />}
          {selectedMenu === '7' && <MintHouse account={account} />}
          {selectedMenu === '3' && <ListHouse account={account} />}
          {selectedMenu === '4' && <DelistHouse account={account} />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainPage;
