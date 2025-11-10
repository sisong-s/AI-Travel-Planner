import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, message } from 'antd';
import {
  DashboardOutlined,
  CompassOutlined,
  WalletOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      message.success('已退出登录');
      navigate('/login');
    } catch (error) {
      message.error('退出登录失败');
    }
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板'
    },
    {
      key: '/planner',
      icon: <CompassOutlined />,
      label: '行程规划'
    },
    {
      key: '/expenses',
      icon: <WalletOutlined />,
      label: '费用管理'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置'
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <GlobalOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 12 }} />
        <Text strong style={{ fontSize: 18, color: '#262626' }}>
          AI旅行规划师
        </Text>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          flex: 1,
          justifyContent: 'center',
          border: 'none'
        }}
      />

      <Dropdown
        menu={{ items: userMenuItems }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} />
          <Text>{user?.user_metadata?.full_name || user?.email}</Text>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default Navbar;