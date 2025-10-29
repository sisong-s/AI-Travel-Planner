import React, { useState } from 'react';
import { 
  Steps, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Button, 
  Card, 
  Typography, 
  Space,
  Checkbox,
  Slider,
  message,
  Spin
} from 'antd';
import { LoadingOutlined, RobotOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { RootState } from '../store';
import { startPlanCreation, createPlanSuccess } from '../store/slices/travelPlanSlice';
import { TravelPlan, TravelPreference } from '../types';
import VoiceInput from '../components/VoiceInput/VoiceInput';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const PlanCreation: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, planningStep } = useSelector((state: RootState) => state.travelPlan);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [voiceInput, setVoiceInput] = useState('');

  const interestOptions = [
    '美食', '购物', '历史文化', '自然风光', '艺术博物馆', 
    '动漫', '温泉', '海滩', '登山', '摄影', '夜生活', '当地体验'
  ];

  const steps = [
    {
      title: '基本信息',
      content: 'basic-info',
    },
    {
      title: '旅行偏好',
      content: 'preferences',
    },
    {
      title: 'AI生成计划',
      content: 'generation',
    },
  ];

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleGeneratePlan();
      }
    } catch (error) {
      message.error('请完善必填信息');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleGeneratePlan = async () => {
    const values = form.getFieldsValue();
    
    dispatch(startPlanCreation());

    try {
      // TODO: 替换为真实的AI API调用
      // 模拟AI生成计划的过程
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockPlan: TravelPlan = {
        id: Date.now().toString(),
        title: `${values.destination}${values.duration}日游`,
        destination: values.destination,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        totalBudget: values.budget,
        preferences: {
          budget: values.budget,
          duration: values.duration,
          travelers: values.travelers,
          interests: values.interests || [],
          accommodationType: values.accommodationType,
          transportMode: values.transportMode
        },
        itinerary: [
          {
            date: values.dateRange[0].format('YYYY-MM-DD'),
            attractions: [
              {
                id: '1',
                name: '当地著名景点',
                description: 'AI推荐的热门景点',
                location: { lat: 0, lng: 0, address: values.destination },
                rating: 4.5,
                price: 100,
                images: [],
                category: '景点',
                openHours: '9:00-18:00',
                estimatedDuration: 3
              }
            ],
            restaurants: [
              {
                id: '1',
                name: '当地特色餐厅',
                cuisine: '当地菜',
                location: { lat: 0, lng: 0, address: values.destination },
                rating: 4.3,
                priceRange: '$$' as const,
                images: [],
                specialties: ['特色菜1', '特色菜2']
              }
            ],
            transportation: ['步行', '地铁'],
            notes: 'AI生成的行程建议'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch(createPlanSuccess(mockPlan));
      message.success('旅行计划生成成功！');
      navigate(`/plan/${mockPlan.id}`);
    } catch (error) {
      message.error('生成计划失败，请重试');
    }
  };

  const handleVoiceInputChange = (transcript: string) => {
    setVoiceInput(transcript);
    // 简单的语音解析逻辑
    if (transcript.includes('去') || transcript.includes('到')) {
      const destination = transcript.replace(/.*[去到]/, '').trim();
      if (destination) {
        form.setFieldValue('destination', destination);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="告诉我们您的旅行基本信息">
            <Form form={form} layout="vertical">
              <Form.Item
                label="目的地"
                name="destination"
                rules={[{ required: true, message: '请输入目的地' }]}
              >
                <VoiceInput 
                  placeholder="请输入或语音说出目的地，如：日本、泰国曼谷..."
                  onTranscriptChange={handleVoiceInputChange}
                />
              </Form.Item>

              <Form.Item
                label="旅行日期"
                name="dateRange"
                rules={[{ required: true, message: '请选择旅行日期' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item
                label="旅行天数"
                name="duration"
                rules={[{ required: true, message: '请输入旅行天数' }]}
              >
                <InputNumber 
                  min={1} 
                  max={30} 
                  style={{ width: '100%' }}
                  placeholder="请输入旅行天数"
                />
              </Form.Item>

              <Form.Item
                label="同行人数"
                name="travelers"
                rules={[{ required: true, message: '请输入同行人数' }]}
              >
                <InputNumber 
                  min={1} 
                  max={20} 
                  style={{ width: '100%' }}
                  placeholder="包括您自己"
                />
              </Form.Item>

              <Form.Item
                label="总预算 (元)"
                name="budget"
                rules={[{ required: true, message: '请输入预算' }]}
              >
                <Slider
                  min={1000}
                  max={50000}
                  step={500}
                  marks={{
                    1000: '1千',
                    10000: '1万',
                    25000: '2.5万',
                    50000: '5万+'
                  }}
                />
              </Form.Item>
            </Form>
          </Card>
        );

      case 1:
        return (
          <Card title="个性化偏好设置">
            <Form form={form} layout="vertical">
              <Form.Item
                label="旅行兴趣"
                name="interests"
              >
                <Checkbox.Group options={interestOptions} />
              </Form.Item>

              <Form.Item
                label="住宿类型偏好"
                name="accommodationType"
                rules={[{ required: true, message: '请选择住宿类型' }]}
              >
                <Select placeholder="请选择住宿类型">
                  <Select.Option value="budget">经济型 (青旅、民宿)</Select.Option>
                  <Select.Option value="mid-range">中档型 (三星酒店)</Select.Option>
                  <Select.Option value="luxury">豪华型 (五星酒店)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="交通方式偏好"
                name="transportMode"
                rules={[{ required: true, message: '请选择交通方式' }]}
              >
                <Select placeholder="请选择主要交通方式">
                  <Select.Option value="flight">飞机</Select.Option>
                  <Select.Option value="train">火车/高铁</Select.Option>
                  <Select.Option value="car">自驾</Select.Option>
                  <Select.Option value="mixed">混合交通</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="特殊需求"
                name="specialRequests"
              >
                <TextArea 
                  rows={3} 
                  placeholder="如：带小孩、无障碍需求、素食等特殊要求..."
                />
              </Form.Item>
            </Form>
          </Card>
        );

      case 2:
        return (
          <Card>
            <div className="loading-container">
              {loading ? (
                <>
                  <Spin 
                    indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
                    size="large" 
                  />
                  <Title level={3}>AI正在为您生成个性化旅行计划...</Title>
                  <Text type="secondary">
                    正在分析您的偏好，搜索最佳景点和路线，预计需要30秒
                  </Text>
                </>
              ) : (
                <>
                  <RobotOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  <Title level={3}>准备生成您的专属旅行计划</Title>
                  <Text type="secondary">
                    点击下方按钮，让AI为您规划完美旅程
                  </Text>
                </>
              )}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>创建旅行计划</Title>
        <Text type="secondary">让AI为您规划个性化的完美旅程</Text>
      </div>

      <div className="planning-steps">
        <Steps current={currentStep} items={steps} />
      </div>

      <div className="step-content">
        {renderStepContent()}
      </div>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          {currentStep > 0 && (
            <Button onClick={handlePrev}>
              上一步
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && !loading && (
            <Button type="primary" onClick={handleGeneratePlan}>
              生成旅行计划
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default PlanCreation;

// TODO: 后续需要集成真实的AI服务
// - 集成大语言模型API进行行程规划
// - 集成地图API获取地理位置和路线
// - 集成景点、酒店、餐厅数据API
// - 实现更智能的语音输入解析