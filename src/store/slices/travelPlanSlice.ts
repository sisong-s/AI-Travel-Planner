import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TravelPlan, TravelPreference } from '../../types';

interface TravelPlanState {
  plans: TravelPlan[];
  currentPlan: TravelPlan | null;
  loading: boolean;
  error: string | null;
  planningStep: number; // 规划步骤：0-输入需求，1-生成中，2-完成
}

const initialState: TravelPlanState = {
  plans: [],
  currentPlan: null,
  loading: false,
  error: null,
  planningStep: 0,
};

const travelPlanSlice = createSlice({
  name: 'travelPlan',
  initialState,
  reducers: {
    // 开始创建旅行计划
    startPlanCreation: (state) => {
      state.loading = true;
      state.error = null;
      state.planningStep = 1;
    },
    
    // 创建旅行计划成功
    createPlanSuccess: (state, action: PayloadAction<TravelPlan>) => {
      state.loading = false;
      state.currentPlan = action.payload;
      state.plans.push(action.payload);
      state.planningStep = 2;
    },
    
    // 创建旅行计划失败
    createPlanFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.planningStep = 0;
    },
    
    // 设置当前计划
    setCurrentPlan: (state, action: PayloadAction<TravelPlan>) => {
      state.currentPlan = action.payload;
    },
    
    // 更新旅行计划
    updatePlan: (state, action: PayloadAction<Partial<TravelPlan>>) => {
      if (state.currentPlan) {
        state.currentPlan = { ...state.currentPlan, ...action.payload };
        const index = state.plans.findIndex(plan => plan.id === state.currentPlan!.id);
        if (index !== -1) {
          state.plans[index] = state.currentPlan;
        }
      }
    },
    
    // 删除旅行计划
    deletePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
      if (state.currentPlan?.id === action.payload) {
        state.currentPlan = null;
      }
    },
    
    // 加载所有计划
    loadPlansStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    loadPlansSuccess: (state, action: PayloadAction<TravelPlan[]>) => {
      state.loading = false;
      state.plans = action.payload;
    },
    
    loadPlansFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // 重置规划步骤
    resetPlanningStep: (state) => {
      state.planningStep = 0;
      state.currentPlan = null;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  startPlanCreation,
  createPlanSuccess,
  createPlanFailure,
  setCurrentPlan,
  updatePlan,
  deletePlan,
  loadPlansStart,
  loadPlansSuccess,
  loadPlansFailure,
  resetPlanningStep,
  clearError,
} = travelPlanSlice.actions;

export default travelPlanSlice.reducer;

// TODO: 后续需要替换为真实的后端API调用
// - 实现旅行计划生成API（集成大语言模型）
// - 实现计划保存到云端数据库
// - 实现计划同步功能
// - 集成地图API获取地理位置信息
// - 集成景点、酒店、餐厅数据API