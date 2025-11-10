import axios from 'axios';

// 阿里云AI服务 - 使用OpenAI兼容接口
class AIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  }

  // 生成旅行计划
  async generateTravelPlan(requirements) {
    const prompt = this.buildTravelPlanPrompt(requirements);
    
    try {
      const response = await axios.post(this.baseURL, {
        model: 'qwen-max',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的旅行规划师，能够根据用户需求生成详细的旅行计划。必须以JSON格式返回结果！！！！必须以JSON格式返回结果！！！！除了json不要生成别的内容！！！'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response, 'response')
      return this.parseTravelPlanResponse(response.data);
    } catch (error) {
      console.error('AI服务调用失败:', error, this.apiKey);
      throw new Error('生成旅行计划失败，请检查API配置');
    }
  }

  // 构建旅行计划提示词
  buildTravelPlanPrompt(requirements) {
    const { destination, days, budget, people, preferences, startDate } = requirements;
    
    return `请为我制定一个详细的旅行计划：
目的地: ${destination}
旅行天数: ${days}天
预算: ${budget}元
人数: ${people}人
偏好: ${preferences}
出发日期: ${startDate}

请返回JSON格式的旅行计划，包含以下结构：
{
  "title": "旅行计划标题",
  "summary": "计划概述",
  "totalBudget": 预算总额,
  "days": [
    {
      "day": 1,
      "date": "日期",
      "activities": [
        {
          "time": "时间",
          "activity": "活动名称",
          "location": "地点",
          "description": "详细描述",
          "cost": 费用,
          "tips": "小贴士"
        }
      ],
      "accommodation": {
        "name": "住宿名称",
        "address": "地址",
        "cost": 费用,
        "rating": 评分
      },
      "transportation": {
        "method": "交通方式",
        "cost": 费用,
        "duration": "时长"
      }
    }
  ],
  "budgetBreakdown": {
    "accommodation": 住宿费用,
    "transportation": 交通费用,
    "food": 餐饮费用,
    "activities": 活动费用,
    "shopping": 购物费用,
    "other": 其他费用
  },
  "tips": ["旅行小贴士"],
  "emergencyContacts": ["紧急联系方式"]
}`;
  }

  // 解析AI响应
  parseTravelPlanResponse(response) {
    try {
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('AI响应格式错误');
      }

      // 尝试解析JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果没有找到JSON，返回默认结构
      return this.createDefaultPlan(content);
    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new Error('解析旅行计划失败');
    }
  }

  // 创建默认计划结构
  createDefaultPlan(content) {
    return {
      title: '个性化旅行计划',
      summary: content.substring(0, 200) + '...',
      totalBudget: 0,
      days: [],
      budgetBreakdown: {
        accommodation: 0,
        transportation: 0,
        food: 0,
        activities: 0,
        shopping: 0,
        other: 0
      },
      tips: ['请根据实际情况调整计划'],
      emergencyContacts: []
    };
  }

  // 预算分析
  async analyzeBudget(expenses, budget) {
    const prompt = `请分析以下旅行支出情况：
总预算: ${budget}元
已支出: ${JSON.stringify(expenses)}

请提供预算分析建议，包括：
1. 支出分类统计
2. 预算使用情况
3. 节省建议
4. 风险提醒`;

    try {
      const response = await axios.post(this.baseURL, {
        model: 'qwen-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices?.[0]?.message?.content || '分析失败';
    } catch (error) {
      console.error('预算分析失败:', error);
      throw new Error('预算分析服务暂时不可用');
    }
  }
}

export default AIService;