// 科大讯飞语音识别服务
class SpeechService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.recognition = null;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // 初始化语音识别
  initRecognition() {
    if (!this.isSupported) {
      throw new Error('浏览器不支持语音识别功能');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'zh-CN';
    
    return this.recognition;
  }

  // 开始录音
  startRecording(onResult, onError) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.recognition) {
          this.initRecognition();
        }

        this.recognition.onresult = (event) => {
          const result = event.results[0][0].transcript;
          onResult && onResult(result);
          resolve(result);
        };

        this.recognition.onerror = (event) => {
          const error = new Error(`语音识别错误: ${event.error}`);
          onError && onError(error);
          reject(error);
        };

        this.recognition.onend = () => {
          // 录音结束
        };

        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 停止录音
  stopRecording() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // 文本转语音
  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }
}

export default SpeechService;