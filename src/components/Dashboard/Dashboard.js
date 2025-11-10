import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined,
  CompassOutlined,
  WalletOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalExpenses: 0,
    upcomingTrips: 0
  });
  const [recentPlans, setRecentPlans] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 加载旅行计划统计
      const { data: plans, error: plansError } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (plansError) throw plansError;

      // 加载费用统计
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id);

      if (expensesError) throw expensesError;

      const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const upcomingTrips = plans?.filter(plan => 
        new Date(plan.start_date) > new Date()
      ).length || 0;

      setStats({
        totalPlans: plans?.length || 0,
        totalExpenses,
        upcomingTrips
      });

      setRecentPlans(plans || []);
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>欢迎回来！</Title>
        <Text type="secondary">管理您的旅行计划和费用</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="旅行计划"
              value={stats.totalPlans}
              prefix={<CompassOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.totalExpenses}
              formatter={(value) => formatCurrency(value)}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="即将到来的旅行"
              value={stats.upcomingTrips}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 快速操作 */}
        <Col xs={24} lg={8}>
          <Card title="快速操作" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                size="large"
                onClick={() => navigate('/planner')}
              >
                创建新的旅行计划
              </Button>
              <Button
                icon={<WalletOutlined />}
                block
                size="large"
                onClick={() => navigate('/expenses')}
              >
                记录旅行费用
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 最近的旅行计划 */}
        <Col xs={24} lg={16}>
          <Card title="最近的旅行计划" style={{ height: '100%' }}>
            {recentPlans.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={recentPlans}
                renderItem={(plan) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      >
                        查看详情
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<EnvironmentOutlined />}
                          style={{ backgroundColor: '#1890ff' }}
                        />
                      }
                      title={plan.title}
                      description={
                        <Space>
                          <Text type="secondary">
                            <CalendarOutlined /> {plan.start_date} - {plan.end_date}
                          </Text>
                          <Text type="secondary">
                            <TeamOutlined /> {plan.people_count}人
                          </Text>
                          <Text type="secondary">
                            预算: {formatCurrency(plan.budget)}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="还没有旅行计划"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/planner')}
                >
                  创建第一个计划
                </Button>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;