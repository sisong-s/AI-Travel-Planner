import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Timeline, 
  Tag, 
  Button, 
  Row, 
  Col, 
  Descriptions,
  Rate,
  Image,
  Empty,
  Divider,
  Space
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  EditOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCurrentPlan } from '../store/slices/travelPlanSlice';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { plans, currentPlan } = useSelector((state: RootState) => state.travelPlan);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    if (id) {
      const plan = plans.find(p => p.id === id);
      if (plan) {
        dispatch(setCurrentPlan(plan));
      }
    }
  }, [id, plans, dispatch]);

  if (!currentPlan) {
    return (
      <div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard')}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>
        <Empty description="计划不存在" />
      </div>
    );
  }

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '景点': 'blue',
      '餐厅': 'green',
      '购物': 'purple',
      '交通': 'orange',
      '住宿': 'red'
    };
    return colors[category] || 'default';
  };

  return (
    <div>
      {/* 头部操作栏 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          返回
        </Button>
        <Space>
          <Button icon={<EditOutlined />}>编辑计划</Button>
          <Button icon={<ShareAltOutlined />}>分享计划</Button>
        </Space>
      </div>

      {/* 计划概览 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={16}>
            <Title level={2} style={{ marginBottom: 8 }}>
              <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              {currentPlan.title}
            </Title>
            <Paragraph type="secondary" style={{ fontSize: 16 }}>
              {currentPlan.destination} • {dayjs(currentPlan.startDate).format('YYYY年MM月DD日')} 至 {dayjs(currentPlan.endDate).format('YYYY年MM月DD日')}
            </Paragraph>
            
            <div style={{ marginTop: 16 }}>
              <Space wrap>
                {currentPlan.preferences.interests.map(interest => (
                  <Tag key={interest} color="blue">{interest}</Tag>
                ))}
              </Space>
            </div>
          </Col>
          
          <Col span={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="旅行天数">
                {currentPlan.preferences.duration} 天
              </Descriptions.Item>
              <Descriptions.Item label="同行人数">
                {currentPlan.preferences.travelers} 人
              </Descriptions.Item>
              <Descriptions.Item label="总预算">
                <Text strong style={{ color: '#f5222d' }}>
                  ¥{currentPlan.totalBudget.toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="住宿类型">
                {currentPlan.preferences.accommodationType === 'budget' ? '经济型' :
                 currentPlan.preferences.accommodationType === 'mid-range' ? '中档型' : '豪华型'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        {/* 地图占位 */}
        <Col span={14}>
          <Card title="行程地图" style={{ marginBottom: 24 }}>
            <div className="map-placeholder">
              <div style={{ textAlign: 'center' }}>
                <EnvironmentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                <div>地图功能开发中...</div>
                <Text type="secondary">将集成高德/百度地图显示行程路线</Text>
              </div>
            </div>
          </Card>

          {/* 详细行程 */}
          <Card title="详细行程">
            {currentPlan.itinerary.length > 0 ? (
              <Timeline
                items={currentPlan.itinerary.map((day, index) => ({
                  color: index === selectedDay ? 'blue' : 'gray',
                  children: (
                    <div 
                      key={index}
                      style={{ 
                        cursor: 'pointer',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: index === selectedDay ? '#f0f7ff' : 'transparent'
                      }}
                      onClick={() => setSelectedDay(index)}
                    >
                      <Title level={4} style={{ marginBottom: 8 }}>
                        第{index + 1}天 - {dayjs(day.date).format('MM月DD日')}
                      </Title>
                      
                      {/* 景点 */}
                      {day.attractions.map(attraction => (
                        <div key={attraction.id} className="attraction-item">
                          <EnvironmentOutlined />
                          <div style={{ flex: 1 }}>
                            <Text strong>{attraction.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined /> {attraction.estimatedDuration}小时 • 
                              <DollarOutlined /> ¥{attraction.price}
                            </Text>
                          </div>
                          <Rate disabled defaultValue={attraction.rating} style={{ fontSize: 12 }} />
                        </div>
                      ))}

                      {/* 餐厅 */}
                      {day.restaurants.map(restaurant => (
                        <div key={restaurant.id} className="attraction-item">
                          <div style={{ color: '#52c41a' }}>🍽️</div>
                          <div style={{ flex: 1 }}>
                            <Text strong>{restaurant.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {restaurant.cuisine} • {restaurant.priceRange}
                            </Text>
                          </div>
                          <Rate disabled defaultValue={restaurant.rating} style={{ fontSize: 12 }} />
                        </div>
                      ))}

                      {day.notes && (
                        <div style={{ marginTop: 8, padding: 8, background: '#fafafa', borderRadius: 4 }}>
                          <Text type="secondary">{day.notes}</Text>
                        </div>
                      )}
                    </div>
                  )
                }))}
              />
            ) : (
              <Empty description="暂无详细行程" />
            )}
          </Card>
        </Col>

        {/* 侧边栏信息 */}
        <Col span={10}>
          {/* 预算分析 */}
          <Card title="预算分析" style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                ¥{currentPlan.totalBudget.toLocaleString()}
              </Title>
              <Text type="secondary">总预算</Text>
            </div>
            
            <Divider />
            
            <div className="expense-category">
              <Text>住宿费用</Text>
              <Text strong>¥{Math.round(currentPlan.totalBudget * 0.4).toLocaleString()}</Text>
            </div>
            <div className="expense-category">
              <Text>交通费用</Text>
              <Text strong>¥{Math.round(currentPlan.totalBudget * 0.3).toLocaleString()}</Text>
            </div>
            <div className="expense-category">
              <Text>餐饮费用</Text>
              <Text strong>¥{Math.round(currentPlan.totalBudget * 0.2).toLocaleString()}</Text>
            </div>
            <div className="expense-category">
              <Text>其他费用</Text>
              <Text strong>¥{Math.round(currentPlan.totalBudget * 0.1).toLocaleString()}</Text>
            </div>
          </Card>

          {/* 旅行贴士 */}
          <Card title="AI旅行贴士">
            <div style={{ lineHeight: 1.8 }}>
              <Paragraph>
                <Text strong>最佳旅行时间：</Text>
                <br />
                根据您的目的地，当前季节适合旅行，建议携带轻便衣物。
              </Paragraph>
              
              <Paragraph>
                <Text strong>当地文化：</Text>
                <br />
                了解当地的文化习俗，尊重当地传统，会让您的旅行更加愉快。
              </Paragraph>
              
              <Paragraph>
                <Text strong>安全提醒：</Text>
                <br />
                保管好重要证件，注意人身和财产安全，购买旅行保险。
              </Paragraph>
            </div>
          </Card>

          {/* 紧急联系 */}
          <Card title="紧急联系" size="small">
            <Text type="secondary" style={{ fontSize: 12 }}>
              当地紧急电话：110<br />
              中国领事馆：+86-xxx-xxxx<br />
              旅行保险：400-xxx-xxxx
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PlanDetail;

// TODO: 后续需要集成真实功能
// - 集成地图API显示行程路线
// - 实现计划编辑功能
// - 添加实时天气信息
// - 集成分享功能
// - 添加离线地图下载