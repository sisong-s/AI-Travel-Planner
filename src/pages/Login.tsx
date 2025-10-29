import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, CompassOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { loginSuccess, registerSuccess } from '../store/slices/authSlice';
import { User } from '../types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      // TODO: 替换为真实的API调用
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟用户数据
      const mockUser: User = {
        id: '1',
        username: values.username || values.email.split('@')[0],
        email: values.email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (values.username || values.email),
      };

      if (isLogin) {
        dispatch(loginSuccess(mockUser));
        message.success('登录成功！');
      } else {
        dispatch(registerSuccess(mockUser));
        message.success('注册成功！');
      }
    } catch (error) {
      message.error(isLogin ? '登录失败，请重试' : '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <CompassOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2} style={{ margin: 0 }}>AI旅行规划师</Title>
          <Text type="secondary">让AI为您规划完美旅程</Text>
        </div>

        <Form
          name="auth"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          {!isLogin && (
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="请输入用户名" 
                size="large"
              />
            </Form.Item>
          )}

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入邮箱" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          {!isLogin && (
            <Form.Item
              label="确认密码"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                size="large"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
            >
              {isLogin ? '登录' : '注册'}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text>
            {isLogin ? '还没有账号？' : '已有账号？'}
            <Button 
              type="link" 
              onClick={() => setIsLogin(!isLogin)}
              style={{ padding: 0, marginLeft: 4 }}
            >
              {isLogin ? '立即注册' : '立即登录'}
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;

// TODO: 后续需要集成真实的认证系统
// - 集成Firebase Authentication或Supabase Auth
// - 实现JWT token管理
// - 添加第三方登录（微信、QQ等）
// - 实现密码重置功能