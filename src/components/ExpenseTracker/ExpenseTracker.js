import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Table,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  message,
  Modal,
  Tag,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  WalletOutlined,
  AudioOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import dayjs from 'dayjs';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import VoiceInput from '../Common/VoiceInput';
import SpeechService from '../../services/speechService';

const { Title, Text } = Typography;
const { Option } = Select;

const ExpenseTracker = () => {
  const [form] = Form.useForm();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [speechService, setSpeechService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { user } = useAuth();
  const { settings } = useSettings();

  const expenseCategories = [
    { value: 'accommodation', label: '住宿', color: '#1890ff' },
    { value: 'transportation', label: '交通', color: '#52c41a' },
    { value: 'food', label: '餐饮', color: '#faad14' },
    { value: 'activities', label: '活动', color: '#722ed1' },
    { value: 'shopping', label: '购物', color: '#eb2f96' },
    { value: 'other', label: '其他', color: '#13c2c2' }
  ];

  useEffect(() => {
    loadExpenses();
    if (settings.xunfeiApiKey) {
      setSpeechService(new SpeechService(settings.xunfeiApiKey));
    }
  }, [user, settings]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('加载费用记录失败:', error);
      message.error('加载费用记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const expenseData = {
        user_id: user.id,
        title: values.title,
        amount: values.amount,
        category: values.category,
        date: values.date.format('YYYY-MM-DD'),
        description: values.description || null
      };

      if (editingExpense) {
        // 更新费用
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;
        message.success('费用记录已更新');
      } else {
        // 添加新费用
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;
        message.success('费用记录已添加');
      }

      form.resetFields();
      setEditingExpense(null);
      setShowAddForm(false);
      loadExpenses();
    } catch (error) {
      console.error('保存费用记录失败:', error);
      message.error('保存费用记录失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date)
    });
    setShowAddForm(true);
  };

  const handleDelete = (expense) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除费用记录"${expense.title}"吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expense.id);

          if (error) throw error;
          message.success('费用记录已删除');
          loadExpenses();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleVoiceInput = (text) => {
    const parsed = parseExpenseVoice(text);
    if (parsed) {
      form.setFieldsValue(parsed);
      message.success('语音输入解析成功！');
    }
  };

  const parseExpenseVoice = (text) => {
    const result = {};
    
    // 提取金额
    const amountMatch = text.match(/(\d+(?:\.\d+)?)(?:元|块|万)/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1]);
      result.amount = text.includes('万') ? amount * 10000 : amount;
    }

    // 提取类别
    const categoryMap = {
      '住宿': 'accommodation',
      '酒店': 'accommodation',
      '交通': 'transportation',
      '打车': 'transportation',
      '地铁': 'transportation',
      '飞机': 'transportation',
      '餐饮': 'food',
      '吃饭': 'food',
      '午餐': 'food',
      '晚餐': 'food',
      '活动': 'activities',
      '门票': 'activities',
      '购物': 'shopping',
      '买': 'shopping'
    };

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (text.includes(keyword)) {
        result.category = category;
        break;
      }
    }

    // 提取标题（简单处理）
    if (result.amount && result.category) {
      result.title = text.substring(0, 20);
    }

    return Object.keys(result).length > 0 ? result : null;
  };

  const calculateStats = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryStats = expenseCategories.map(category => {
      const categoryExpenses = expenses.filter(expense => expense.category === category.value);
      const amount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        ...category,
        amount,
        count: categoryExpenses.length
      };
    }).filter(stat => stat.amount > 0);

    const monthlyStats = {};
    expenses.forEach(expense => {
      const month = dayjs(expense.date).format('YYYY-MM');
      monthlyStats[month] = (monthlyStats[month] || 0) + expense.amount;
    });

    const monthlyData = Object.entries(monthlyStats)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // 最近6个月

    return { total, categoryStats, monthlyData };
  };

  const stats = calculateStats();

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('MM-DD')
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const cat = expenseCategories.find(c => c.value === category);
        return cat ? <Tag color={cat.color}>{cat.label}</Tag> : category;
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#cf1322' }}>
          ¥{amount.toLocaleString()}
        </Text>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

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
        <Title level={2}>费用管理</Title>
        <Text type="secondary">记录和分析您的旅行支出</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.total}
              formatter={(value) => formatCurrency(value)}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="记录数量"
              value={expenses.length}
              suffix="笔"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均支出"
              value={expenses.length > 0 ? stats.total / expenses.length : 0}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 左侧：费用列表和添加表单 */}
        <Col xs={24} lg={16}>
          <Card
            title="费用记录"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setShowAddForm(true);
                  setEditingExpense(null);
                  form.resetFields();
                }}
              >
                添加费用
              </Button>
            }
          >
            {showAddForm && (
              <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    date: dayjs(),
                    category: 'other'
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="title"
                        label="费用标题"
                        rules={[{ required: true, message: '请输入费用标题' }]}
                      >
                        <Input placeholder="如：午餐、打车费" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="amount"
                        label="金额"
                        rules={[{ required: true, message: '请输入金额' }]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          precision={2}
                          formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/¥\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="category"
                        label="类别"
                        rules={[{ required: true, message: '请选择类别' }]}
                      >
                        <Select>
                          {expenseCategories.map(category => (
                            <Option key={category.value} value={category.value}>
                              {category.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="date"
                        label="日期"
                        rules={[{ required: true, message: '请选择日期' }]}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="description" label="备注">
                    <Input.TextArea rows={2} placeholder="可选的备注信息" />
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
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                      >
                        {editingExpense ? '更新' : '添加'}
                      </Button>
                      <Button onClick={() => setShowAddForm(false)}>
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            )}

            {expenses.length > 0 ? (
              <Table
                columns={columns}
                dataSource={expenses}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="还没有费用记录" />
            )}
          </Card>
        </Col>

        {/* 右侧：统计图表 */}
        <Col xs={24} lg={8}>
          {/* 分类统计 */}
          {stats.categoryStats.length > 0 && (
            <Card title="支出分类" style={{ marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* 月度趋势 */}
          {stats.monthlyData.length > 0 && (
            <Card title="月度支出趋势">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ExpenseTracker;