import React, { useState, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  startListening,
  stopListening,
  updateTranscript,
  voiceError,
  clearTranscript,
} from '../../store/slices/voiceSlice';

interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  placeholder = '点击麦克风开始语音输入...',
  value,
  onChange,
}) => {
  const dispatch = useDispatch();
  const { isListening, transcript, error } = useSelector((state: RootState) => state.voice);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'zh-CN';

      recognitionInstance.onstart = () => {
        dispatch(startListening());
      };

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          dispatch(updateTranscript(finalTranscript));
          onTranscriptChange?.(finalTranscript);
          onChange?.(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        dispatch(voiceError(`语音识别错误: ${event.error}`));
        message.error('语音识别失败，请重试');
      };

      recognitionInstance.onend = () => {
        dispatch(stopListening());
      };

      setRecognition(recognitionInstance);
    } else {
      message.warning('您的浏览器不支持语音识别功能');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleVoiceToggle = () => {
    if (!recognition) {
      message.error('语音识别不可用');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      dispatch(clearTranscript());
      recognition.start();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange?.(inputValue);
    onTranscriptChange?.(inputValue);
  };

  return (
    <div className="voice-input-container">
      <Input
        value={value || transcript}
        onChange={handleInputChange}
        placeholder={placeholder}
        suffix={
          <Button
            type={isListening ? 'primary' : 'default'}
            icon={isListening ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={handleVoiceToggle}
            className="voice-input-btn"
            size="small"
            danger={isListening}
          />
        }
      />
    </div>
  );
};

export default VoiceInput;

// TODO: 后续需要集成真实的语音识别API
// - 替换为科大讯飞语音识别API
// - 添加语音识别准确度优化
// - 实现离线语音识别功能
// - 添加多语言支持