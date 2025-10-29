import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Upload, 
  Typography, 
  Row, 
  Col,
  Divider,
  Switch,
  Select,
  message,
  Space
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  EditOutlined,
  SaveOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { loginSuccess } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      username: user?.username,
      email: user?.email,
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // TODO: 替换为真实的API调用
      const updatedUser = {
        ...user!,
        username: values.username,
        email: values.email,
      };
      
      dispatch(loginSuccess(updatedUser));
      setIsEditing(false);
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('请完善必填信息');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功');
      // TODO: 更新用户头像
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>个人中心</Title>
        <Text type="secondary">管理您的个人信息和偏好设置</Text>
      </div>

      <Row gutter={24}>
        {/* 个人信息 */}
        <Col span={16}>
          <Card
            title="个人信息"
            extra={
              !isEditing ? (
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  编辑
                </Button>
              ) : (
                <Space>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    保存
                  </Button>
                </Space>
              )
            }
          >
            <Row gutter={24}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar 
                    size={120} 
                    src={user?.avatar} 
                    icon={<UserOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  {isEditing && (
                    <Upload
                      name="avatar"
                      showUploadList={false}
                      action="/api/upload/avatar"
                      onChange={handleAvatarChange}
                    >
                      <Button icon={<UploadOutlined />} size="small">
                        更换头像
                      </Button>
                    </Upload>
                  )}
                </div>
              </Col>
              
              <Col span={18}>
                {isEditing ? (
                  <Form form={form} layout="vertical">
                    <Form.Item
                      label="用户名"
                      name="username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input placeholder="请输入用户名" />
                    </Form.Item>
                    
                    <Form.Item
                      label="邮箱"
                      name="email"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <Input placeholder="请输入邮箱" />
                    </Form.Item>
                  </Form>
                ) : (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">用户名</Text>
                      <br />
                      <Text strong style={{ fontSize: 16 }}>{user?.username}</Text>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text type="secondary">邮箱</Text>
                      <br />
                      <Text strong style={{ fontSize: 16 }}>{user?.email}</Text>
                    </div>
                    
                    <div>
                      <Text type="secondary">注册时间</Text>
                      <br />
                      <Text>2024年1月15日</Text>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card>

          {/* 旅行偏好 */}
          <Card title="旅行偏好" style={{ marginTop: 16 }}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="偏好的住宿类型">
                    <Select defaultValue="mid-range" placeholder="请选择住宿类型">
                      <Select.Option value="budget">经济型</Select.Option>
                      <Select.Option value="mid-range">中档型</Select.Option>
                      <Select.Option value="luxury">豪华型</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item label="偏好的交通方式">
                    <Select defaultValue="mixed" placeholder="请选择交通方式">
                      <Select.Option value="flight">飞机</Select.Option>
                      <Select.Option value="train">火车/高铁</Select.Option>
                      <Select.Option value="car">自驾</Select.Option>
                      <Select.Option value="mixed">混合交通</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="常用预算范围">
                <Select defaultValue="10000-20000" placeholder="请选择预算范围">
                  <Select.Option value="0-5000">5000元以下</Select.Option>
                  <Select.Option value="5000-10000">5000-10000元</Select.Option>
                  <Select.Option value="10000-20000">10000-20000元</Select.Option>
                  <Select.Option value="20000+">20000元以上</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 设置 */}
        <Col span={8}>
          <Card title="系统设置" extra={<SettingOutlined />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>语音输入</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    启用语音识别功能
                  </Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Divider style={{ margin: 0 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>消息通知</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    接收旅行提醒和更新
                  </Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Divider style={{ margin: 0 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>自动同步</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    自动同步到云端
                  </Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Divider style={{ margin: 0 }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>离线地图</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    下载离线地图数据
                  </Text>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* 统计信息 */}
          <Card title="我的统计" style={{ marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ padding: '16px 0' }}>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>5</Title>
                    <Text type="secondary">旅行计划</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: '16px 0' }}>
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>12</Title>
                    <Text type="secondary">访问城市</Text>
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ padding: '16px 0' }}>
                    <Title level={3} style={{ margin: 0, color: '#722ed1' }}>45</Title>
                    <Text type="secondary">旅行天数</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: '16px 0' }}>
                    <Title level={3} style={{ margin: 0, color: '#f5222d' }}>¥28K</Title>
                    <Text type="secondary">总花费</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          {/* 快速操作 */}
          <Card title="快速操作" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button block>导出数据</Button>
              <Button block>清除缓存</Button>
              <Button block>意见反馈</Button>
              <Button block type="primary" danger>
                注销账户
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;

// TODO: 后续需要集成真实功能
// - 实现头像上传功能
// - 集成用户偏好保存到后端
// - 实现数据导出功能
// - 添加账户安全设置
// - 集成意见反馈系统