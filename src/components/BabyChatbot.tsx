// src/components/BabyChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  AlertTriangle, 
  Baby, 
  Clock, 
  RefreshCw, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  BookOpen,
  CheckCircle,
  Stethoscope,
  Thermometer,
  Shield
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  hasRagKnowledge?: boolean;
  knowledgeCategories?: string[];
}

interface QuickQuestion {
  id: number;
  category: string;
  question: string;
  icon: string;
}

interface BabyChatbotProps {
  babyAgeInMonths?: number;
  onAgeUpdate?: (age: number) => void;
}

export const BabyChatbot: React.FC<BabyChatbotProps> = ({ 
  babyAgeInMonths, 
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([]);
  const hasWelcomedRef = useRef(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 🎤 음성 관련 상태 (기존 유지)
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [autoPlayTTS, setAutoPlayTTS] = useState(true);
  const [selectedVoice] = useState('nova');
  
  // 🎤 음성 관련 refs (기존 유지)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // 메시지 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // 1) 빠른 질문 로드는 마운트 시 한 번
useEffect(() => {
  loadQuickQuestions();
}, []);

// 2) 환영 메시지는 마운트 시 한 번만
useEffect(() => {
  if (hasWelcomedRef.current) return;

  const welcomeMessage: Message = {
    id: Date.now().toString(),
    text: `안녕하세요! 👶 영유아 케어 전문 상담사입니다.

현재 상담 가능한 주제:
• 🏥 예방접종 일정 및 주의사항
• 💊 해열제 안전 사용법  
• 😴 안전한 수면 환경 조성

${babyAgeInMonths !== undefined 
  ? `현재 등록된 아기 월령: ${babyAgeInMonths}개월` 
  : '먼저 아기의 월령을 설정하시면 더 정확한 조언을 드릴 수 있어요.'}

궁금한 점을 편안하게 물어보세요!`,
    sender: 'bot',
    timestamp: new Date(),
    hasRagKnowledge: true
  };

  setMessages([welcomeMessage]);
  hasWelcomedRef.current = true;
}, [babyAgeInMonths]); 


  // 🔥 빠른 질문 로드
  const loadQuickQuestions = async () => {
    try {
      const response = await fetch('/api/chat/quick-questions');
      const data = await response.json();
      
      if (data.success) {
        setQuickQuestions(data.questions);
      }
    } catch (error) {
      console.error('빠른 질문 로드 실패:', error);
      // 기본 질문들 설정
      setQuickQuestions([
        { id: 1, category: 'vaccination', question: '우리 아기 예방접종 일정이 궁금해요', icon: '💉' },
        { id: 2, category: 'fever_medicine', question: '아기가 열이 나는데 해열제 줘도 될까요?', icon: '🌡️' },
        { id: 3, category: 'safe_sleep', question: '안전하게 재우는 방법을 알려주세요', icon: '😴' }
      ]);
    }
  };

  // 🔥 메시지 전송 (FastAPI /ask와 연결)
const sendMessage = async (text?: string) => {
  const messageText = text || input.trim();
  if (!messageText) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    text: messageText,
    sender: 'user',
    timestamp: new Date(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setError(null);
  setIsLoading(true);
  setShowQuickActions(false);

  try {
    // ✅ 프록시 경유: /api/ask -> http://localhost:8000/ask
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: messageText }),
    });

    const result = await response.json();

    if (!response.ok) {
      // 인덱스 미구축 등 서버에서 내려준 에러 표시
      throw new Error(result?.detail || '서버 오류');
    }

    const answerText =
      result?.answer ??
      result?.response ??
      (typeof result === 'string' ? result : '');

    const botMessage: Message = {
      id: Date.now().toString(),
      text: answerText || '답변을 가져오지 못했습니다.',
      sender: 'bot',
      timestamp: new Date(),
      hasRagKnowledge: true,
    };

    setMessages(prev => [...prev, botMessage]);

    if (autoPlayTTS && answerText) {
      await playTTS(answerText);
    }
  } catch (err: unknown) {
    console.error('메시지 전송 실패:', err);
    const msg = err instanceof Error ? err.message : '연결 실패';
    setError(msg || '상담 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
  } finally {
    setIsLoading(false);
  }
};

  // 🔥 빠른 질문 클릭
  const handleQuickQuestion = (question: QuickQuestion) => {
    sendMessage(question.question);
  };

  // 🎤 카테고리별 아이콘 매핑
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vaccination':
        return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'fever_medicine':
        return <Thermometer className="w-4 h-4 text-red-500" />;
      case 'safe_sleep':
        return <Shield className="w-4 h-4 text-green-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  // 🎤 음성 인식 시작 (기존 기능 유지)
  const startRecording = async () => {
    try {
      setVoiceError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('음성 녹음 시작 실패:', error);
      setVoiceError('마이크 접근 권한이 필요합니다.');
    }
  };

  // 🎤 음성 인식 중지 (기존 기능 유지)
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 🎤 음성 입력 처리 (기존 기능 유지)
  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    setVoiceError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/stt', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.text) {
        setInput(result.text);
        // 자동으로 메시지 전송
        await sendMessage(result.text);
      } else {
        setVoiceError(result.error || '음성 인식에 실패했습니다.');
      }
    } catch (error) {
      console.error('STT 처리 오류:', error);
      setVoiceError('음성 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // 🎤 TTS 음성 재생 (기존 기능 유지)
  const playTTS = async (text: string) => {
    try {
      setIsSpeaking(true);

      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed: 1.0
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          setVoiceError('음성 재생에 실패했습니다.');
        };

        await audio.play();
      } else {
        throw new Error('TTS 요청 실패');
      }
    } catch (error) {
      console.error('TTS 재생 오류:', error);
      setVoiceError('음성 재생 중 오류가 발생했습니다.');
      setIsSpeaking(false);
    }
  };

  // 🎤 음성 재생 중지
  const stopTTS = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsSpeaking(false);
    }
  };

  // 채팅 초기화
  const clearChat = () => {
    setMessages([]);
    setError(null);
    setShowQuickActions(true);
    loadQuickQuestions();
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 음성 에러 자동 숨김
  useEffect(() => {
    if (voiceError) {
      const timer = setTimeout(() => setVoiceError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [voiceError]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      
      {/* 🎤 음성 설정 및 상태 바 */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={autoPlayTTS ? () => setAutoPlayTTS(false) : () => setAutoPlayTTS(true)}
              className={`p-2 rounded-lg transition-colors ${
                autoPlayTTS ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}
              title={autoPlayTTS ? 'TTS 자동재생 켜짐' : 'TTS 자동재생 꺼짐'}
            >
              {autoPlayTTS ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            
            {isSpeaking && (
              <button
                onClick={stopTTS}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                title="음성 재생 중지"
              >
                <VolumeX size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={clearChat}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="대화 초기화"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        
        {/* 음성 에러 표시 */}
        {voiceError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {voiceError}
          </div>
        )}
      </div>

      {/* 메시지 목록 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="flex items-center gap-2 mb-2">
                  <Baby size={14} className="text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">전문 상담사</span>
                  
                  {/* 🔥 RAG 지식 기반 표시 */}
                  {message.hasRagKnowledge && (
                    <div className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-500" />
                      <span className="text-xs text-green-600">의료가이드</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.text}
              </div>
              
              {/* 🔥 지식 카테고리 표시 */}
              {message.knowledgeCategories && message.knowledgeCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.knowledgeCategories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                    >
                      {getCategoryIcon(category)}
                      <span className="capitalize">{category}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {/* 로딩 표시 */}
        {(isLoading || isProcessingVoice) && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[85%]">
              <div className="flex items-center gap-2 mb-2">
                <Baby size={14} className="text-blue-500" />
                <span className="text-xs font-medium text-blue-600">전문 상담사</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-500" size={16} />
                <span className="text-sm text-gray-600">
                  {isProcessingVoice ? '음성을 인식하고 있어요...' : '전문 가이드를 찾고 있어요...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">연결 오류</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 🔥 빠른 질문 */}
      {showQuickActions && quickQuestions.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0">
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-600">💡 빠른 질문</span>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-24 overflow-y-auto">
            {quickQuestions.slice(0, 3).map((question) => (
              <button
                key={question.id}
                onClick={() => handleQuickQuestion(question)}
                className="text-left bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center gap-2"
              >
                <span className="text-base">{question.icon}</span>
                <span className="flex-1 truncate">{question.question}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
        <div className="flex gap-2">
          {/* 🎤 음성 입력 버튼 */}
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isLoading || isProcessingVoice}
            className={`p-3 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : isProcessingVoice
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isRecording ? '녹음 중...' : '길게 눌러서 음성 입력'}
          >
            {isProcessingVoice ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isRecording ? (
              <MicOff size={20} />
            ) : (
              <Mic size={20} />
            )}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="육아 관련 질문을 입력하세요..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        
        {/* 안내 텍스트 */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          <Clock size={12} className="inline mr-1" />
          전문 의료 가이드라인 기반 답변 | 응급시 119
        </div>
      </div>
    </div>
  );
};