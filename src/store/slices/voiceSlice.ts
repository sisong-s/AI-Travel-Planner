import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VoiceInputState } from '../../types';

const initialState: VoiceInputState = {
  isListening: false,
  transcript: '',
  error: null,
};

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    // 开始语音识别
    startListening: (state) => {
      state.isListening = true;
      state.error = null;
      state.transcript = '';
    },
    
    // 停止语音识别
    stopListening: (state) => {
      state.isListening = false;
    },
    
    // 更新语音转录文本
    updateTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload;
    },
    
    // 语音识别错误
    voiceError: (state, action: PayloadAction<string>) => {
      state.isListening = false;
      state.error = action.payload;
    },
    
    // 清除转录文本
    clearTranscript: (state) => {
      state.transcript = '';
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  startListening,
  stopListening,
  updateTranscript,
  voiceError,
  clearTranscript,
  clearError,
} = voiceSlice.actions;

export default voiceSlice.reducer;

// TODO: 后续需要集成真实的语音识别API
// - 集成科大讯飞语音识别API
// - 实现语音转文字功能
// - 实现语音命令识别
// - 添加语音反馈功能