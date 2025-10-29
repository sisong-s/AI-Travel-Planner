import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExpenseRecord } from '../../types';

interface ExpenseState {
  expenses: ExpenseRecord[];
  totalExpense: number;
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  totalExpense: 0,
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    // 添加费用记录
    addExpense: (state, action: PayloadAction<ExpenseRecord>) => {
      state.expenses.push(action.payload);
      state.totalExpense += action.payload.amount;
    },
    
    // 更新费用记录
    updateExpense: (state, action: PayloadAction<ExpenseRecord>) => {
      const index = state.expenses.findIndex(expense => expense.id === action.payload.id);
      if (index !== -1) {
        const oldAmount = state.expenses[index].amount;
        state.expenses[index] = action.payload;
        state.totalExpense = state.totalExpense - oldAmount + action.payload.amount;
      }
    },
    
    // 删除费用记录
    deleteExpense: (state, action: PayloadAction<string>) => {
      const expense = state.expenses.find(expense => expense.id === action.payload);
      if (expense) {
        state.totalExpense -= expense.amount;
        state.expenses = state.expenses.filter(expense => expense.id !== action.payload);
      }
    },
    
    // 加载费用记录
    loadExpensesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    loadExpensesSuccess: (state, action: PayloadAction<ExpenseRecord[]>) => {
      state.loading = false;
      state.expenses = action.payload;
      state.totalExpense = action.payload.reduce((total, expense) => total + expense.amount, 0);
    },
    
    loadExpensesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 按计划ID过滤费用
    filterExpensesByPlan: (state, action: PayloadAction<string>) => {
      // 这里只是模拟，实际应该从后端获取
      state.expenses = state.expenses.filter(expense => expense.planId === action.payload);
      state.totalExpense = state.expenses.reduce((total, expense) => total + expense.amount, 0);
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addExpense,
  updateExpense,
  deleteExpense,
  loadExpensesStart,
  loadExpensesSuccess,
  loadExpensesFailure,
  filterExpensesByPlan,
  clearError,
} = expenseSlice.actions;

export default expenseSlice.reducer;

// TODO: 后续需要替换为真实的后端API调用
// - 实现费用记录保存到云端数据库
// - 实现费用统计和分析API
// - 集成语音识别添加费用记录
// - 实现费用分类和预算提醒功能