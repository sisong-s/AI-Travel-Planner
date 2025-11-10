import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  message,
  Steps,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  List,
  Avatar,
  Empty
} from 'antd';
import {
  AudioOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HeartOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../services/supabase';
import SpeechService from '../../services/speechService';
import AIService from '../../services/aiService';
import VoiceInput from '../Common/VoiceInput';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const TravelPlanner = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [existingPlans, setExistingPlans] = useState([]);
  const [speechService, setSpeechService] = useState(null);
  const [aiService, setAiService] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    loadExistingPlans();
    initializeServices();
  }, [user, settings]);

  const initializeServices = () => {
    if (settings.xunfeiApiKey) {
      setSpeechService(new SpeechService(settings.xunfeiApiKey));
    }
    if (settings.alicloudApiKey) {
      setAiService(new AIService(settings.alicloudApiKey));
    }
  };

  const loadExistingPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingPlans(data || []);
    } catch (error) {
      console.error('加载旅行计划失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = (text) => {
    // 解析语音输入，提取旅行信息
    const parsed = parseVoiceInput(text);
    if (parsed) {
      form.setFieldsValue(parsed);
      message.success('语音输入解析成功！');
    }
  };

  const parseVoiceInput = (text) => {
    // 简单的语音解析逻辑
    const result = {};
    
    // 提取目的地
    const destinationMatch = text.match(/去(.+?)(?:，|,|。|\.|\s|$)/);
    if (destinationMatch) {
      result.destination = destinationMatch[1];
    }

    // 提取天数
    const daysMatch = text.match(/(\d+)天/);
    if (daysMatch) {
      result.days = parseInt(daysMatch[1]);
    }

    // 提取预算
    const budgetMatch = text.match(/预算(\d+)(?:元|万)/);
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1]);
      result.budget = text.includes('万') ? amount * 10000 : amount;
    }

    // 提取人数
    const peopleMatch = text.match(/(\d+)人/);
    if (peopleMatch) {
      result.peopleCount = parseInt(peopleMatch[1]);
    }

    // 提取偏好
    const preferences = [];
    if (text.includes('美食')) preferences.push('美食');
    if (text.includes('购物')) preferences.push('购物');
    if (text.includes('文化')) preferences.push('文化');
    if (text.includes('自然')) preferences.push('自然风光');
    if (text.includes('历史')) preferences.push('历史古迹');
    if (text.includes('动漫')) preferences.push('动漫文化');
    
    if (preferences.length > 0) {
      result.preferences = preferences.join('、');
    }

    return Object.keys(result).length > 0 ? result : null;
  };

  const onFinish = async (values) => {
    if (!aiService) {
      message.error('请先在设置中配置阿里云API密钥');
      return;
    }

    setGenerating(true);
    try {
      // 准备AI请求数据
      const requirements = {
        destination: values.destination,
        days: values.days,
        budget: values.budget,
        people: values.peopleCount,
        preferences: values.preferences,
        startDate: values.dateRange[0].format('YYYY-MM-DD')
      };

      // 调用AI生成旅行计划
      const plan = await aiService.generateTravelPlan(requirements);

      // 保存到数据库
      const { data, error } = await supabase
        .from('travel_plans')
        .insert([{
          user_id: user.id,
          title: plan.title,
          destination: values.destination,
          start_date: values.dateRange[0].format('YYYY-MM-DD'),
          end_date: values.dateRange[1].format('YYYY-MM-DD'),
          days: values.days,
          people_count: values.peopleCount,
          budget: values.budget,
          preferences: values.preferences,
          plan_data: plan,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      message.success('旅行计划生成成功！');
      navigate(`/plan/${data.id}`);
    } catch (error) {
      console.error('生成旅行计划失败:', error);
      message.error(error.message || '生成旅行计划失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const steps = [
    {
      title: '基本信息',
      description: '输入旅行基本信息'
    },
    {
      title: '生成计划',
      description: 'AI生成个性化计划'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>智能行程规划</Title>
      <Text type="secondary">通过AI生成个性化的旅行计划</Text>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card>
            <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

            {currentStep === 0 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  peopleCount: 2,
                  days: 3
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="destination"
                      label="目的地"
                      rules={[{ required: true, message: '请输入目的地' }]}
                    >
                      <Input
                        prefix={<EnvironmentOutlined />}
                        placeholder="如：日本、北京、三亚"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="dateRange"
                      label="旅行日期"
                      rules={[{ required: true, message: '请选择旅行日期' }]}
                    >
                      <RangePicker
                        style={{ width: '100%' }}
                        size="large"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="days"
                      label="旅行天数"
                      rules={[{ required: true, message: '请输入旅行天数' }]}
                    >
                      <InputNumber
                        min={1}
                        max={30}
                        style={{ width: '100%' }}
                        size="large"
                        prefix={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="peopleCount"
                      label="同行人数"
                      rules={[{ required: true, message: '请输入同行人数' }]}
                    >
                      <InputNumber
                        min={1}
                        max={20}
                        style={{ width: '100%' }}
                        size="large"
                        prefix={<TeamOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="budget"
                      label="预算（元）"
                      rules={[{ required: true, message: '请输入预算' }]}
                    >
                      <InputNumber
                        min={100}
                        style={{ width: '100%' }}
                        size="large"
                        prefix={<DollarOutlined />}
                        formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/¥\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="preferences"
                  label="旅行偏好"
                >
                  <TextArea
                    rows={3}
                    placeholder="如：喜欢美食、购物、文化体验、自然风光等"
                    size="large"
                  />
                </Form.Item>

                {speechService && (
                  <Form.Item label="语音输入">
                    <VoiceInput
                      speechService={speechService}
                      onResult={handleVoiceInput}
                    />
                  </Form.Item>
                )}

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={generating}
                    size="large"
                    block
                  >
                    {generating ? '正在生成计划...' : '生成旅行计划'}
                  </Button>
                </Form.Item>
              </Form>
            )}

            {generating && (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>AI正在为您生成个性化旅行计划，请稍候...</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="我的旅行计划" style={{ height: 'fit-content' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : existingPlans.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={existingPlans.slice(0, 5)}
                renderItem={(plan) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        onClick={() => navigate(`/plan/${plan.id}`)}
                      >
                        查看
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
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {plan.destination} · {plan.days}天
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatCurrency(plan.budget)}
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
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TravelPlanner;