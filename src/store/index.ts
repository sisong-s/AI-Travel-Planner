import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import travelPlanReducer from './slices/travelPlanSlice';
import expenseReducer from './slices/expenseSlice';
import voiceReducer from './slices/voiceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    travelPlan: travelPlanReducer,
    expense: expenseReducer,
    voice: voiceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;