import React, { useState } from 'react';
import { Button, message, Typography, Space } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const VoiceInput = ({ speechService, onResult }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startRecording = async () => {
    if (!speechService) {
      message.error('语音服务未初始化，请检查API配置');
      return;
    }

    try {
      setIsRecording(true);
      setTranscript('');
      
      const result = await speechService.startRecording(
        (text) => {
          setTranscript(text);
        },
        (error) => {
          message.error(`语音识别失败: ${error.message}`);
          setIsRecording(false);
        }
      );

      setIsRecording(false);
      if (result) {
        setTranscript(result);
        onResult && onResult(result);
        message.success('语音识别成功！');
      }
    } catch (error) {
      setIsRecording(false);
      message.error(`语音识别失败: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (speechService) {
      speechService.stopRecording();
    }
    setIsRecording(false);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button
        type={isRecording ? 'danger' : 'default'}
        icon={isRecording ? <LoadingOutlined /> : <AudioOutlined />}
        onClick={isRecording ? stopRecording : startRecording}
        className={`voice-button ${isRecording ? 'recording' : ''}`}
        size="large"
      >
        {isRecording ? '点击停止' : '点击说话'}
      </Button>
      
      {transcript && (
        <div style={{
          padding: '12px',
          background: '#f6f6f6',
          borderRadius: '6px',
          border: '1px solid #d9d9d9'
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>识别结果：</Text>
          <div style={{ marginTop: 4 }}>
            <Text>{transcript}</Text>
          </div>
        </div>
      )}
      
      <Text type="secondary" style={{ fontSize: 12 }}>
        💡 您可以说："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
      </Text>
    </Space>
  );
};

export default VoiceInput;