import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Timeline,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Tag,
  Divider,
  Spin,
  message,
  Modal,
  List,
  Avatar
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  AimOutlined
} from '@ant-design/icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MapComponent from '../Common/MapComponent';

const { Title, Text, Paragraph } = Typography;

const TravelPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    loadPlanDetail();
  }, [id]);

  // 按天收集地点及详细信息
  const dayLocations = useMemo(() => {
    if (!plan || !plan.plan_data || !plan.plan_data.days) return [];
    
    const dailyLocations = [];
    
    plan.plan_data.days.forEach((day, dayIndex) => {
      const dayLocs = [];
      
      // 收集活动地点（按时间顺序）
      if (day.activities) {
        day.activities.forEach(activity => {
          if (activity.location) {
            dayLocs.push({
              location: activity.location,
              type: 'activity',
              time: activity.time,
              title: activity.activity,
              description: activity.description,
              cost: activity.cost,
              tips: activity.tips
            });
          }
        });
      }
      
      // 住宿地点添加到最后
      if (day.accommodation && day.accommodation.address) {
        dayLocs.push({
          location: day.accommodation.address,
          type: 'accommodation',
          title: day.accommodation.name,
          cost: day.accommodation.cost,
          rating: day.accommodation.rating
        });
      }
      
      if (dayLocs.length > 0) {
        dailyLocations.push({
          day: dayIndex + 1,
          date: day.date,
          locations: dayLocs
        });
      }
    });
    
    return dailyLocations;
  }, [plan]);

  // 跳转到地图位置
  const handleLocationClick = (location) => {
    if (mapRef.current) {
      mapRef.current.focusLocation(location);
      // 滚动到地图区域
      setTimeout(() => {
        document.querySelector('.map-container')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  };

  const loadPlanDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (error) {
      console.error('加载计划详情失败:', error);
      message.error('加载计划详情失败');
      navigate('/planner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个旅行计划吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('travel_plans')
            .delete()
            .eq('id', id);

          if (error) throw error;
          
          message.success('计划已删除');
          navigate('/planner');
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
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

  if (!plan) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>计划不存在</Text>
      </div>
    );
  }

  const planData = plan.plan_data || {};

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/planner')}
          >
            返回
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {plan.title}
          </Title>
        </Space>
        
        <div style={{ marginTop: 16 }}>
          <Space wrap>
            <Tag icon={<EnvironmentOutlined />} color="blue">
              {plan.destination}
            </Tag>
            <Tag icon={<CalendarOutlined />} color="green">
              {plan.start_date} 至 {plan.end_date}
            </Tag>
            <Tag icon={<TeamOutlined />} color="orange">
              {plan.people_count}人
            </Tag>
            <Tag icon={<DollarOutlined />} color="red">
              预算 {formatCurrency(plan.budget)}
            </Tag>
          </Space>
        </div>

        <div style={{ marginTop: 16 }}>
          <Space>
            <Button icon={<EditOutlined />}>编辑</Button>
            <Button icon={<ShareAltOutlined />}>分享</Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧：行程详情 */}
        <Col xs={24} lg={16}>
          {/* 计划概述 */}
          {planData.summary && (
            <Card title="计划概述" style={{ marginBottom: 16 }}>
              <Paragraph>{planData.summary}</Paragraph>
            </Card>
          )}

          {/* 每日行程 */}
          <Card title="详细行程">
            {planData.days && planData.days.length > 0 ? (
              <Timeline
                items={planData.days.map((day, index) => ({
                  key: index,
                  dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                  children: (
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <Title level={4}>
                        第{day.day}天 - {day.date}
                      </Title>
                      
                      {/* 活动列表 */}
                      {day.activities && (
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>活动安排：</Text>
                          <List
                            size="small"
                            dataSource={day.activities}
                            renderItem={(activity) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={<Avatar icon={<ClockCircleOutlined />} />}
                                  title={`${activity.time} - ${activity.activity}`}
                                  description={
                                    <div>
                                      <Space>
                                        <Text type="secondary">
                                          📍 {activity.location}
                                        </Text>
                                        <Button 
                                          type="link" 
                                          size="small"
                                          icon={<AimOutlined />}
                                          onClick={() => handleLocationClick(activity.location)}
                                        >
                                          查看位置
                                        </Button>
                                      </Space>
                                      <br />
                                      <Text>{activity.description}</Text>
                                      {activity.cost > 0 && (
                                        <>
                                          <br />
                                          <Text type="success">
                                            💰 {formatCurrency(activity.cost)}
                                          </Text>
                                        </>
                                      )}
                                      {activity.tips && (
                                        <>
                                          <br />
                                          <Text type="warning">
                                            💡 {activity.tips}
                                          </Text>
                                        </>
                                      )}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </div>
                      )}

                      {/* 住宿信息 */}
                      {day.accommodation && (
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>住宿：</Text>
                          <div style={{ marginLeft: 16 }}>
                            <Text>{day.accommodation.name}</Text>
                            <br />
                            <Space>
                              <Text type="secondary">📍 {day.accommodation.address}</Text>
                              <Button 
                                type="link" 
                                size="small"
                                icon={<AimOutlined />}
                                onClick={() => handleLocationClick(day.accommodation.address)}
                              >
                                查看位置
                              </Button>
                            </Space>
                            <br />
                            <Text type="success">
                              {formatCurrency(day.accommodation.cost)}/晚
                            </Text>
                            {day.accommodation.rating && (
                              <Text type="warning" style={{ marginLeft: 8 }}>
                                ⭐ {day.accommodation.rating}
                              </Text>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 交通信息 */}
                      {day.transportation && (
                        <div>
                          <Text strong>交通：</Text>
                          <div style={{ marginLeft: 16 }}>
                            <Text>{day.transportation.method}</Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              {day.transportation.duration}
                            </Text>
                            <Text type="success" style={{ marginLeft: 8 }}>
                              {formatCurrency(day.transportation.cost)}
                            </Text>
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                }))}
              />
            ) : (
              <Text type="secondary">暂无详细行程安排</Text>
            )}
          </Card>

          {/* 旅行小贴士 */}
          {planData.tips && planData.tips.length > 0 && (
            <Card title="旅行小贴士" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={planData.tips}
                renderItem={(tip) => (
                  <List.Item>
                    <Text>💡 {tip}</Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>

        {/* 右侧：预算和地图 */}
        <Col xs={24} lg={8}>
          {/* 预算分析 */}
          {planData.budgetBreakdown && (
            <Card title="预算分析" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="住宿"
                    value={planData.budgetBreakdown.accommodation}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="交通"
                    value={planData.budgetBreakdown.transportation}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="餐饮"
                    value={planData.budgetBreakdown.food}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="活动"
                    value={planData.budgetBreakdown.activities}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="购物"
                    value={planData.budgetBreakdown.shopping}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="其他"
                    value={planData.budgetBreakdown.other}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: 14 }}
                  />
                </Col>
              </Row>
              <Divider />
              <Statistic
                title="总计"
                value={planData.totalBudget || plan.budget}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#cf1322', fontSize: 18 }}
              />
            </Card>
          )}

          {/* 地图 */}
          <Card title="位置地图">
            <MapComponent 
              ref={mapRef}
              destination={plan.destination}
              dayLocations={dayLocations}
              height={400}
            />
          </Card>

          {/* 紧急联系方式 */}
          {planData.emergencyContacts && planData.emergencyContacts.length > 0 && (
            <Card title="紧急联系方式" style={{ marginTop: 16 }}>
              <List
                size="small"
                dataSource={planData.emergencyContacts}
                renderItem={(contact) => (
                  <List.Item>
                    <Text>📞 {contact}</Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TravelPlanDetail;