import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Button, Typography, Empty } from 'antd';
import { PlusOutlined, CalendarOutlined, DollarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { loadPlansSuccess } from '../store/slices/travelPlanSlice';
import { TravelPlan } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Meta } = Card;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, loading } = useSelector((state: RootState) => state.travelPlan);
  const { expenses } = useSelector((state: RootState) => state.expense);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // TODO: 替换为真实的API调用
    // 模拟加载用户的旅行计划
    const mockPlans: TravelPlan[] = [
      {
        id: '1',
        title: '日本关西5日游',
        destination: '日本大阪',
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        totalBudget: 10000,
        preferences: {
          budget: 10000,
          duration: 5,
          travelers: 2,
          interests: ['美食', '动漫', '购物'],
          accommodationType: 'mid-range',
          transportMode: 'flight'
        },
        itinerary: [],
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        title: '泰国曼谷3日游',
        destination: '泰国曼谷',
        startDate: '2024-04-10',
        endDate: '2024-04-13',
        totalBudget: 6000,
        preferences: {
          budget: 6000,
          duration: 3,
          travelers: 1,
          interests: ['美食', '文化', '按摩'],
          accommodationType: 'budget',
          transportMode: 'flight'
        },
        itinerary: [],
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
      }
    ];

    dispatch(loadPlansSuccess(mockPlans));
  }, [dispatch]);

  const totalBudget = plans.reduce((sum, plan) => sum + plan.totalBudget, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const upcomingTrips = plans.filter(plan => dayjs(plan.startDate).isAfter(dayjs()));

  const handleCreatePlan = () => {
    navigate('/create-plan');
  };

  const handleViewPlan = (planId: string) => {
    navigate(`/plan/${planId}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>欢迎回来，{user?.username}！</Title>
        <Text type="secondary">管理您的旅行计划，让AI为您规划完美旅程</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总计划数"
              value={plans.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="即将到来"
              value={upcomingTrips.length}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总预算"
              value={totalBudget}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#722ed1' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已花费"
              value={totalExpenses}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#f5222d' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 最近的旅行计划 */}
        <Col span={16}>
          <Card
            title="我的旅行计划"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreatePlan}
              >
                创建新计划
              </Button>
            }
          >
            {plans.length > 0 ? (
              <List
                dataSource={plans}
                renderItem={(plan) => (
                  <List.Item
                    actions={[
                      <Button type="link" onClick={() => handleViewPlan(plan.id)}>
                        查看详情
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          {plan.title}
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary">
                            {plan.destination} • {dayjs(plan.startDate).format('YYYY-MM-DD')} 至 {dayjs(plan.endDate).format('YYYY-MM-DD')}
                          </Text>
                          <br />
                          <Text type="secondary">
                            预算: ¥{plan.totalBudget} • {plan.preferences.duration}天 • {plan.preferences.travelers}人
                          </Text>
                        </div>
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
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePlan}>
                  创建第一个计划
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        {/* 快速操作 */}
        <Col span={8}>
          <Card title="快速操作">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                block 
                size="large"
                onClick={handleCreatePlan}
              >
                创建新的旅行计划
              </Button>
              <Button 
                icon={<DollarOutlined />} 
                block 
                size="large"
                onClick={() => navigate('/expenses')}
              >
                管理旅行费用
              </Button>
              <Button 
                icon={<CalendarOutlined />} 
                block 
                size="large"
                onClick={() => navigate('/plans')}
              >
                查看所有计划
              </Button>
            </div>
          </Card>

          {/* 最近费用 */}
          <Card title="最近费用" style={{ marginTop: 16 }}>
            {expenses.length > 0 ? (
              <List
                size="small"
                dataSource={expenses.slice(0, 3)}
                renderItem={(expense) => (
                  <List.Item>
                    <div className="expense-item">
                      <Text>{expense.description}</Text>
                      <Text strong>¥{expense.amount}</Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="暂无费用记录" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

// TODO: 后续需要集成真实的数据
// - 从后端API加载用户的旅行计划
// - 实现实时数据更新
// - 添加数据可视化图表
// - 集成天气信息API