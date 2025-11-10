import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Divider,
  Alert,
  Collapse,
  List
} from 'antd';
import {
  SaveOutlined,
  KeyOutlined,
  ApiOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSettings } from '../../contexts/SettingsContext';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings } = useSettings();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      updateSettings(values);
      message.success('设置已保存');
    } catch (error) {
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const apiGuides = [
    {
      title: '科大讯飞语音识别API',
      description: '用于语音输入功能',
      steps: [
        '访问 https://www.xfyun.cn/',
        '注册账号并登录',
        '进入控制台，创建语音识别应用',
        '获取 API Key 并填入下方'
      ],
      link: 'https://www.xfyun.cn/'
    },
    {
      title: '高德地图API',
      description: '用于地图显示和地理位置服务',
      steps: [
        '访问 https://lbs.amap.com/',
        '注册开发者账号',
        '创建应用，选择Web端(JS API)',
        '获取 Key 并填入下方'
      ],
      link: 'https://lbs.amap.com/'
    },
    {
      title: '阿里云通义千问API',
      description: '用于AI旅行计划生成',
      steps: [
        '访问 https://dashscope.aliyun.com/',
        '开通通义千问服务',
        '获取 API Key',
        '填入下方配置'
      ],
      link: 'https://dashscope.aliyun.com/'
    },
    {
      title: 'Supabase数据库',
      description: '用于数据存储和用户认证',
      steps: [
        '访问 https://supabase.com/',
        '创建新项目',
        '在项目设置中获取 URL 和 anon key',
        '填入下方配置'
      ],
      link: 'https://supabase.com/'
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>系统设置</Title>
      <Text type="secondary">配置API密钥以启用完整功能</Text>

      <div style={{ marginTop: 24 }}>
        <Alert
          message="重要提示"
          description="为了保护您的API密钥安全，所有配置信息仅存储在浏览器本地，不会上传到服务器。"
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card title="API配置" icon={<ApiOutlined />}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={settings}
            className="settings-form"
          >
            <Form.Item
              name="xunfeiApiKey"
              label="科大讯飞 API Key"
              extra="用于语音识别功能，不填写将无法使用语音输入"
            >
              <Input.Password
                placeholder="请输入科大讯飞API Key"
                prefix={<KeyOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="amapApiKey"
              label="高德地图 API Key"
              extra="用于地图显示和位置服务，不填写将无法显示地图"
            >
              <Input.Password
                placeholder="请输入高德地图API Key"
                prefix={<KeyOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="alicloudApiKey"
              label="阿里云通义千问 API Key"
              extra="用于AI旅行计划生成，这是核心功能必需的配置"
            >
              <Input.Password
                placeholder="请输入阿里云API Key"
                prefix={<KeyOutlined />}
              />
            </Form.Item>

            <Divider />

            <Form.Item
              name="supabaseUrl"
              label="Supabase项目URL"
              extra="用于数据存储，格式如：https://your-project.supabase.co"
            >
              <Input
                placeholder="请输入Supabase项目URL"
                prefix={<ApiOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="supabaseAnonKey"
              label="Supabase匿名密钥"
              extra="用于数据库访问认证"
            >
              <Input.Password
                placeholder="请输入Supabase匿名密钥"
                prefix={<KeyOutlined />}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="API获取指南" style={{ marginTop: 24 }}>
          <Collapse>
            {apiGuides.map((guide, index) => (
              <Panel
                header={
                  <Space>
                    <InfoCircleOutlined />
                    <Text strong>{guide.title}</Text>
                    <Text type="secondary">- {guide.description}</Text>
                  </Space>
                }
                key={index}
              >
                <div>
                  <Paragraph>
                    <Text strong>获取步骤：</Text>
                  </Paragraph>
                  <List
                    size="small"
                    dataSource={guide.steps}
                    renderItem={(step, stepIndex) => (
                      <List.Item>
                        <Text>{stepIndex + 1}. {step}</Text>
                      </List.Item>
                    )}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Button
                      type="link"
                      href={guide.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      访问官网 →
                    </Button>
                  </div>
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>

        <Card title="功能说明" style={{ marginTop: 24 }}>
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: '智能行程规划',
                description: '使用阿里云AI生成个性化旅行计划，需要配置阿里云API密钥',
                required: true
              },
              {
                title: '语音输入',
                description: '支持语音输入旅行需求和费用记录，需要配置科大讯飞API密钥',
                required: false
              },
              {
                title: '地图导航',
                description: '显示旅行目的地地图和位置信息，需要配置高德地图API密钥',
                required: false
              },
              {
                title: '数据同步',
                description: '云端存储旅行计划和费用记录，需要配置Supabase数据库',
                required: true
              }
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <Text>{item.title}</Text>
                      {item.required && <Text type="danger">(必需)</Text>}
                    </Space>
                  }
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="数据安全" style={{ marginTop: 24 }}>
          <Alert
            message="本地存储"
            description="所有API密钥和配置信息仅存储在您的浏览器本地存储中，不会发送到任何第三方服务器。清除浏览器数据会同时清除这些配置。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Alert
            message="API调用"
            description="应用会直接调用您配置的API服务，请确保API密钥的安全性，建议定期更换密钥。"
            type="warning"
            showIcon
          />
        </Card>
      </div>
    </div>
  );
};

export default Settings;