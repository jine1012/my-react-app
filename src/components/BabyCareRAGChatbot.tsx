// src/components/BabyCareRAGChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Baby, 
  X, 
  Loader2, 
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Thermometer,
  Shield,
  Stethoscope
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

interface BabyCareRAGChatbotProps {
  babyInfo?: {
    name?: string;
    ageInMonths?: number;
    weight?: number;
  };
}

const BabyCareRAGChatbot: React.FC<BabyCareRAGChatbotProps> = ({ babyInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([]);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 마운트 시 빠른 질문 로드
  useEffect(() => {
    if (isOpen) {
      loadQuickQuestions();
      
      // 환영 메시지
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: `안녕하세요! 👶 영유아 케어 전문 상담사입니다.

현재 상담 가능한 주제:
• 🏥 예방접종 일정 및 주의사항
• 💊 해열제 안전 사용법  
• 😴 안전한 수면 환경 조성

${babyInfo?.name ? `${babyInfo.name} 아기` : '아기'}에 대해 궁금한 점을 편안하게 물어보세요!`,
          sender: 'bot',
          timestamp: new Date(),
          hasRagKnowledge: true
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen]);

  // 메시지 목록 끝으로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 빠른 질문 로드
  const loadQuickQuestions = async () => {
    try {
      const response = await fetch('/api/baby-care-rag/quick-questions');
      const data = await response.json();
      
      if (data.success) {
        setQuickQuestions(data.questions);
      }
    } catch (error) {
      console.error('빠른 질문 로드 실패:', error);
    }
  };

  // 메시지 전송
  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setError(null);
    setIsLoading(true);
    setShowQuickQuestions(false);

    try {
      // RAG 기반 상담 API 호출
      const response = await fetch('/api/baby-care-rag/baby-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          babyInfo
        }),
      });

      const result = await response.json();

      if (result.success) {
        const botMessage: Message = {
          id: result.messageId?.toString() || Date.now().toString(),
          text: result.response,
          sender: 'bot',
          timestamp: new Date(),
          hasRagKnowledge: result.hasRagKnowledge,
          knowledgeCategories: result.knowledgeCategories
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        setError(result.error || '답변 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setError('상담 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 빠른 질문 클릭
  const handleQuickQuestion = (question: QuickQuestion) => {
    sendMessage(question.question);
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 카테고리별 아이콘 매핑
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

  return (
    <>
      {/* 챗봇 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
            : 'bg-gradient-to-r from-blue-500 to-pink-500 text-white hover:shadow-xl hover:scale-105'
        } p-4 border border-gray-200`}
        aria-label={isOpen ? "육아 상담사 닫기" : "육아 상담사 열기"}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="flex items-center gap-1">
            <Baby size={20} />
            <MessageSquare size={18} />
          </div>
        )}
      </button>

      {/* 챗봇 패널 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[95vw] h-[600px] max-h-[80vh] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">영유아 케어 상담사</h3>
                <p className="text-xs text-gray-600">
                  {babyInfo?.name ? `${babyInfo.name} (${babyInfo.ageInMonths}개월)` : '전문 육아 가이드'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="닫기"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      <span className="text-xs font-medium text-blue-600">상담사</span>
                      
                      {/* RAG 지식 기반 표시 */}
                      {message.hasRagKnowledge && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={12} className="text-green-500" />
                          <span className="text-xs text-green-600">전문가이드</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </div>
                  
                  {/* 지식 카테고리 표시 */}
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[85%]">
                  <div className="flex items-center gap-2 mb-2">
                    <Baby size={14} className="text-blue-500" />
                    <span className="text-xs font-medium text-blue-600">상담사</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-500" size={16} />
                    <span className="text-sm text-gray-600">
                      전문 가이드를 찾고 있어요...
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

          {/* 빠른 질문 */}
          {showQuickQuestions && quickQuestions.length > 0 && (
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
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="육아 관련 질문을 입력하세요..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputText.trim()}
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
      )}
    </>
  );
};

export default BabyCareRAGChatbot;