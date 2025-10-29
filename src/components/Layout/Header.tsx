import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, CompassOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="app-header">
      <div className="app-logo">
        <CompassOutlined />
        AI旅行规划师
      </div>
      
      <div className="user-info">
        <Text>欢迎回来，{user?.username || '用户'}</Text>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar 
            className="user-avatar"
            src={user?.avatar} 
            icon={<UserOutlined />}
          />
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;