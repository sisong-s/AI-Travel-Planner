import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  message,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DollarOutlined,
  PieChartOutlined,
  AudioOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addExpense, updateExpense, deleteExpense, loadExpensesSuccess } from '../store/slices/expenseSlice';
import { ExpenseRecord } from '../types';
import VoiceInput from '../components/VoiceInput/VoiceInput';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ExpenseManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { expenses, totalExpense, loading } = useSelector((state: RootState) => state.expense);
  const { plans } = useSelector((state: RootState) => state.travelPlan);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // TODO: 替换为真实的API调用
    // 模拟加载费用数据
    const mockExpenses: ExpenseRecord[] = [
      {
        id: '1',
        planId: '1',
        category: 'accommodation',
        amount: 800,
        description: '大阪酒店住宿',
        date: '2024-03-15',
        location: '日本大阪'
      },
      {
        id: '2',
        planId: '1',
        category: 'food',
        amount: 150,
        description: '拉面午餐',
        date: '2024-03-15',
        location: '日本大阪'
      },
      {
        id: '3',
        planId: '1',
        category: 'transportation',
        amount: 50,
        description: '地铁交通',
        date: '2024-03-15',
        location: '日本大阪'
      }
    ];
    
    dispatch(loadExpensesSuccess(mockExpenses));
  }, [dispatch]);

  const categoryOptions = [
    { label: '住宿', value: 'accommodation', color: 'blue' },
    { label: '餐饮', value: 'food', color: 'green' },
    { label: '交通', value: 'transportation', color: 'orange' },
    { label: '景点', value: 'attraction', color: 'purple' },
    { label: '购物', value: 'shopping', color: 'pink' },
    { label: '其他', value: 'other', color: 'default' }
  ];

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  const getCategoryColor = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.color : 'default';
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date)
    });
    setIsModalVisible(true);
  };

  const handleDeleteExpense = (id: string) => {
    dispatch(deleteExpense(id));
    message.success('删除成功');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const expenseData: ExpenseRecord = {
        id: editingExpense?.id || Date.now().toString(),
        planId: values.planId,
        category: values.category,
        amount: values.amount,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        location: values.location
      };

      if (editingExpense) {
        dispatch(updateExpense(expenseData));
        message.success('更新成功');
      } else {
        dispatch(addExpense(expenseData));
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('请完善必填信息');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleVoiceInput = (transcript: string) => {
    // 简单的语音解析逻辑
    const amount = transcript.match(/(\d+)元|(\d+)块/);
    if (amount) {
      form.setFieldValue('amount', parseInt(amount[1] || amount[2]));
    }
    
    // 设置描述
    form.setFieldValue('description', transcript);
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MM-DD'),
      sorter: (a: ExpenseRecord, b: ExpenseRecord) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {getCategoryLabel(category)}
        </Tag>
      ),
      filters: categoryOptions.map(opt => ({ text: opt.label, value: opt.value })),
      onFilter: (value: any, record: ExpenseRecord) => record.category === value,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#f5222d' }}>
          ¥{amount.toLocaleString()}
        </Text>
      ),
      sorter: (a: ExpenseRecord, b: ExpenseRecord) => a.amount - b.amount,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: ExpenseRecord) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditExpense(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这条记录吗？"
            onConfirm={() => handleDeleteExpense(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 计算各类别支出
  const categoryStats = categoryOptions.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category.value);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      ...category,
      total,
      count: categoryExpenses.length
    };
  }).filter(stat => stat.total > 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>费用管理</Title>
        <Text type="secondary">记录和管理您的旅行开销</Text>
      </div>

      {/* 费用统计 */}
      <div className="expense-summary">
        <Row gutter={24}>
          <Col span={8}>
            <Statistic
              title="总支出"
              value={totalExpense}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="记录数量"
              value={expenses.length}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              suffix="笔"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="平均每笔"
              value={expenses.length > 0 ? totalExpense / expenses.length : 0}
              precision={0}
              valueStyle={{ color: '#fff', fontSize: 32 }}
              suffix="元"
            />
          </Col>
        </Row>
      </div>

      <Row gutter={16}>
        {/* 费用列表 */}
        <Col span={16}>
          <Card
            title="费用记录"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddExpense}
              >
                添加费用
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={expenses}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </Col>

        {/* 分类统计 */}
        <Col span={8}>
          <Card title="分类统计" extra={<PieChartOutlined />}>
            {categoryStats.map(stat => (
              <div key={stat.value} className="expense-category">
                <div>
                  <Tag color={stat.color}>{stat.label}</Tag>
                  <Text type="secondary">({stat.count}笔)</Text>
                </div>
                <Text strong>¥{stat.total.toLocaleString()}</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 添加/编辑费用模态框 */}
      <Modal
        title={editingExpense ? '编辑费用' : '添加费用'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="关联计划"
            name="planId"
            rules={[{ required: true, message: '请选择关联计划' }]}
          >
            <Select placeholder="请选择旅行计划">
              {plans.map(plan => (
                <Select.Option key={plan.id} value={plan.id}>
                  {plan.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="费用类别"
                name="category"
                rules={[{ required: true, message: '请选择费用类别' }]}
              >
                <Select placeholder="请选择类别">
                  {categoryOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="金额 (元)"
                name="amount"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="请输入金额"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="费用描述"
            name="description"
            rules={[{ required: true, message: '请输入费用描述' }]}
          >
            <VoiceInput
              placeholder="请输入费用描述，支持语音输入"
              onTranscriptChange={handleVoiceInput}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="消费日期"
                name="date"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="请选择日期"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="消费地点"
                name="location"
              >
                <Input placeholder="请输入地点" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpenseManagement;

// TODO: 后续需要集成真实功能
// - 集成后端API保存费用数据
// - 实现费用数据可视化图表
// - 添加预算提醒功能
// - 集成发票识别OCR功能
// - 实现费用导出功能