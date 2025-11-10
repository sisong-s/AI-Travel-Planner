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
    } else {
      message.warning('未能识别到有效信息，请重试或手动输入');
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

  const parseExpenseVoice = (text) => {
    const result = {};
    
    // 先将文本中的中文数字转换为阿拉伯数字
    let processedText = text;
    
    // 匹配中文数字模式（包括"三十"、"五十"等）
    const chineseNumberPattern = /([一二三四五六七八九十百千万壹贰叁肆伍陆柒捌玖拾]+)/g;
    const matches = [...text.matchAll(chineseNumberPattern)];
    
    for (const match of matches) {
      const chineseNum = match[1];
      const arabicNum = chineseToNumber(chineseNum);
      if (arabicNum > 0) {
        processedText = processedText.replace(chineseNum, arabicNum.toString());
      }
    }

    // 提取金额 - 支持多种格式（使用处理后的文本）
    const amountPatterns = [
      /(\d+(?:\.\d+)?)\s*万\s*元/,  // X万元
      /(\d+(?:\.\d+)?)\s*万/,       // X万
      /(\d+(?:\.\d+)?)\s*块/,       // X块
      /(\d+(?:\.\d+)?)\s*元/,       // X元
      /花了?\s*(\d+(?:\.\d+)?)/,    // 花了X
      /(\d+(?:\.\d+)?)\s*块钱/,     // X块钱
      /(\d+(?:\.\d+)?)\s*元钱/      // X元钱
    ];

    for (const pattern of amountPatterns) {
      const match = processedText.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (processedText.includes('万')) {
          result.amount = amount * 10000;
        } else {
          result.amount = amount;
        }
        break;
      }
    }

    // 提取类别 - 扩展关键词
    const categoryMap = {
      '住宿': 'accommodation',
      '酒店': 'accommodation',
      '宾馆': 'accommodation',
      '旅馆': 'accommodation',
      '民宿': 'accommodation',
      '交通': 'transportation',
      '打车': 'transportation',
      '出租车': 'transportation',
      '滴滴': 'transportation',
      '地铁': 'transportation',
      '公交': 'transportation',
      '飞机': 'transportation',
      '机票': 'transportation',
      '高铁': 'transportation',
      '火车': 'transportation',
      '餐饮': 'food',
      '吃饭': 'food',
      '午餐': 'food',
      '晚餐': 'food',
      '早餐': 'food',
      '吃': 'food',
      '喝': 'food',
      '咖啡': 'food',
      '奶茶': 'food',
      '活动': 'activities',
      '门票': 'activities',
      '景点': 'activities',
      '游玩': 'activities',
      '娱乐': 'activities',
      '购物': 'shopping',
      '买': 'shopping',
      '商场': 'shopping',
      '超市': 'shopping'
    };

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (text.includes(keyword)) {
        result.category = category;
        break;
      }
    }

    // 提取标题 - 智能处理
    let title = '';
    
    // 尝试提取特定格式的标题
    const titlePatterns = [
      /(.+?)(?:\d+|[一二三四五六七八九十百千万]+)\s*(?:元|块|万)/,  // "标题 金额元" 格式
      /(.+?)花了?/,                           // "标题 花了" 格式
      /(.+?)备注/,                            // "标题 备注" 格式
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }

    // 如果没有匹配到，取前面的内容作为标题
    if (!title && text.length > 0) {
      // 移除金额相关的内容
      title = text
        .replace(/\d+(?:\.\d+)?\s*(?:元|块|万|块钱|元钱)/g, '')
        .replace(/[一二三四五六七八九十百千万]+\s*(?:元|块|万|块钱|元钱)/g, '')
        .replace(/花了?/g, '')
        .replace(/备注[:：]?.*/g, '')
        .trim();
    }

    // 限制标题长度
    if (title.length > 30) {
      title = title.substring(0, 30);
    }

    if (title) {
      result.title = title;
    }

    // 提取备注 - 查找"备注"关键词后的内容
    const remarkPatterns = [
      /备注[:：]?\s*(.+)/,
      /说明[:：]?\s*(.+)/,
      /附注[:：]?\s*(.+)/,
    ];

    for (const pattern of remarkPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.description = match[1].trim();
        // 从备注中移除可能的金额信息
        result.description = result.description
          .replace(/\d+(?:\.\d+)?\s*(?:元|块|万|块钱|元钱)/g, '')
          .replace(/[一二三四五六七八九十百千万]+\s*(?:元|块|万|块钱|元钱)/g, '')
          .trim();
        break;
      }
    }

    // 如果没有明确的备注标记，但文本较长，可能包含备注信息
    if (!result.description && text.length > 20) {
      // 提取金额和标题之后的内容作为备注
      const cleanedText = text
        .replace(result.title || '', '')
        .replace(/\d+(?:\.\d+)?\s*(?:元|块|万|块钱|元钱)/g, '')
        .replace(/[一二三四五六七八九十百千万]+\s*(?:元|块|万|块钱|元钱)/g, '')
        .replace(/花了?/g, '')
        .replace(new RegExp(Object.keys(categoryMap).join('|'), 'g'), '')
        .trim();
      
      if (cleanedText.length > 2 && cleanedText.length < 100) {
        result.description = cleanedText;
      }
    }

    // 如果没有提取到类别，默认设置为"其他"
    if (!result.category && (result.amount || result.title)) {
      result.category = 'other';
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
                        placeholder='💡 您可以说："午餐花了50元"、"打车费30块 备注：去机场"、"购物1000元 买了一件外套"'
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