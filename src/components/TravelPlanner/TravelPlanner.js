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
    const parsed = parseVoiceInput(text);
    if (parsed) {
      form.setFieldsValue(parsed);
      message.success('语音输入解析成功！');
    } else {
      message.warning('未能识别到有效信息，请重试或手动输入');
    }
  };

  // 处理日期范围变化，自动计算天数
  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      const days = dates[1].diff(dates[0], 'day') + 1;
      form.setFieldsValue({ days });
    }
  };

  // 中文数字转换为阿拉伯数字
  const chineseToNumber = (chineseNum) => {
    const chineseNumbers = {
      '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
      '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
      '十': 10, '百': 100, '千': 1000, '万': 10000,
      '壹': 1, '贰': 2, '叁': 3, '肆': 4, '伍': 5,
      '陆': 6, '柒': 7, '捌': 8, '玖': 9, '拾': 10
    };

    // 处理特殊情况：十 -> 10
    if (chineseNum === '十') return 10;
    
    // 处理 "十X" 格式，如：十一 -> 11, 十五 -> 15
    if (chineseNum.startsWith('十') && chineseNum.length === 2) {
      const lastChar = chineseNum[1];
      const lastNum = chineseNumbers[lastChar];
      return 10 + (lastNum || 0);
    }

    let result = 0;
    let temp = 0;

    for (let i = 0; i < chineseNum.length; i++) {
      const char = chineseNum[i];
      const num = chineseNumbers[char];

      if (num === undefined) continue;

      // 如果是单位（十、百、千、万）
      if (num >= 10) {
        // 如果前面没有数字，默认为1
        if (temp === 0) {
          temp = 1;
        }
        result += temp * num;
        temp = 0;
      } else {
        // 如果是数字（0-9）
        temp = num;
      }
    }

    // 加上最后剩余的数字
    result += temp;
    return result;
  };

  const parseVoiceInput = (text) => {
    const result = {};
    
    // 先将文本中的中文数字转换为阿拉伯数字
    let processedText = text;
    
    // 匹配中文数字模式
    const chineseNumberPattern = /([一二三四五六七八九十百千万壹贰叁肆伍陆柒捌玖拾]+)/g;
    const matches = [...text.matchAll(chineseNumberPattern)];
    
    for (const match of matches) {
      const chineseNum = match[1];
      const arabicNum = chineseToNumber(chineseNum);
      if (arabicNum > 0) {
        processedText = processedText.replace(chineseNum, arabicNum.toString());
      }
    }
    
    // 提取目的地 - 支持多种表达方式
    const destinationPatterns = [
      /去\s*([^\s，,。\.]+?)(?:旅游|旅行|玩|游玩)/,
      /想去\s*([^\s，,。\.]+)/,
      /到\s*([^\s，,。\.]+?)(?:旅游|旅行|玩|游玩)/,
      /目的地\s*[:：]?\s*([^\s，,。\.]+)/,
      /去\s*([^\s，,。\.]{2,})/
    ];

    for (const pattern of destinationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const destination = match[1].trim();
        const ignoreWords = ['天', '人', '元', '块', '预算', '万', '喜欢', '想', '花'];
        if (!ignoreWords.some(word => destination.includes(word)) && destination.length >= 2) {
          result.destination = destination;
          break;
        }
      }
    }

    // 提取天数 - 使用处理后的文本（支持中文数字）
    const daysPatterns = [
      /(\d+)\s*天/,
      /玩\s*(\d+)\s*天/,
      /(\d+)\s*日/,
      /天数\s*[:：]?\s*(\d+)/
    ];

    for (const pattern of daysPatterns) {
      const match = processedText.match(pattern);
      if (match && match[1]) {
        const days = parseInt(match[1]);
        if (days > 0 && days <= 30) {
          result.days = days;
          break;
        }
      }
    }

    // 提取预算 - 支持多种格式（使用处理后的文本）
    const budgetPatterns = [
      /预算\s*[:：]?\s*(\d+(?:\.\d+)?)\s*万/,
      /(\d+(?:\.\d+)?)\s*万\s*(?:元|块)?(?:预算)?/,
      /预算\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(?:元|块)/,
      /(\d+(?:\.\d+)?)\s*(?:元|块)\s*预算/,
      /花\s*(\d+(?:\.\d+)?)\s*(?:元|块|万)/,
      /大概\s*(\d+(?:\.\d+)?)\s*(?:元|块|万)/
    ];

    for (const pattern of budgetPatterns) {
      const match = processedText.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1]);
        const matchedText = processedText.match(pattern)[0];
        if (matchedText.includes('万')) {
          result.budget = amount * 10000;
        } else {
          result.budget = amount;
        }
        break;
      }
    }

    // 提取人数 - 使用处理后的文本（支持中文数字）
    const peoplePatterns = [
      /(\d+)\s*(?:个)?人/,
      /(\d+)\s*位/,
      /人数\s*[:：]?\s*(\d+)/,
      /同行\s*(\d+)\s*人/
    ];

    for (const pattern of peoplePatterns) {
      const match = processedText.match(pattern);
      if (match && match[1]) {
        const people = parseInt(match[1]);
        if (people > 0 && people <= 20) {
          result.peopleCount = people;
          break;
        }
      }
    }

    // 提取偏好 - 扩展关键词识别
    const preferenceMap = {
      '美食': ['美食', '吃', '特色菜', '小吃', '美味'],
      '购物': ['购物', '买东西', '逛街', '商场'],
      '文化': ['文化', '博物馆', '艺术', '展览'],
      '自然风光': ['自然', '风景', '山水', '海滩', '沙滩', '大海', '森林', '公园'],
      '历史古迹': ['历史', '古迹', '古建筑', '遗址', '寺庙', '宫殿'],
      '动漫文化': ['动漫', 'ACG', '二次元', '漫画'],
      '户外运动': ['运动', '户外', '登山', '徒步', '滑雪', '潜水'],
      '休闲度假': ['休闲', '度假', '放松', '悠闲'],
      '探险': ['探险', '刺激', '冒险'],
      '摄影': ['摄影', '拍照', '打卡']
    };

    const preferences = [];
    for (const [preference, keywords] of Object.entries(preferenceMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        if (!preferences.includes(preference)) {
          preferences.push(preference);
        }
      }
    }
    
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
                  peopleCount: 2
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
                        placeholder="如：上海、北京"
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
                        onChange={handleDateRangeChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 隐藏的天数字段，由日期范围自动计算 */}
                <Form.Item name="days" hidden>
                  <InputNumber />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
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
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
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
                      placeholder='💡 示例：我想去上海玩五天，预算五千元，两个人，喜欢美食和购物'
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