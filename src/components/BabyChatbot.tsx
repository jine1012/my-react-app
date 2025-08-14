// src/components/BabyChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertTriangle, Baby, Clock, RefreshCw } from 'lucide-react';
import { useBabyAdvice } from '../hooks/useBabyAdvice';

interface BabyChatbotProps {
  babyAgeInMonths?: number;
  onAgeUpdate?: (age: number) => void;
}

export const BabyChatbot: React.FC<BabyChatbotProps> = ({ 
  babyAgeInMonths, 
  onAgeUpdate 
}) => {
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearChat, 
    lastResponse 
  } = useBabyAdvice(babyAgeInMonths);

  // 메시지 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // 초기 웰컴 메시지
  useEffect(() => {
    if (messages.length === 0) {
      // 자동으로 웰컴 메시지 추가
      const welcomeText = `안녕하세요! 👶 아기 울음 전문 상담사입니다.

아기가 울고 있어서 걱정이시군요. 함께 원인을 찾아보고 해결책을 찾아보겠습니다.

${babyAgeInMonths !== undefined 
  ? `현재 등록된 아기 월령: ${babyAgeInMonths}개월` 
  : '먼저 아기의 월령을 알려주시면 더 정확한 조언을 드릴 수 있어요.'}

어떤 도움이 필요하신가요?`;
    }
  }, [babyAgeInMonths]);

  const quickActions = [
    { text: "아기가 계속 울어요", icon: "😭" },
    { text: "배고픈 것 같아요", icon: "🍼" },
    { text: "기저귀를 확인했어요", icon: "👶" },
    { text: "잠을 안 자려고 해요", icon: "😴" },
    { text: "열이 있는 것 같아요", icon: "🌡️" },
    { text: "아픈 것 같아요", icon: "😰" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setShowQuickActions(false);
    
    await sendMessage(messageText);
  };

  const handleQuickAction = async (text: string) => {
    setShowQuickActions(false);
    await sendMessage(text);
  };

  const handleRetry = async () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        await sendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* 메시지 영역 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* 웰컴 메시지 */}
        {messages.length === 0 && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="text-blue-500" size={20} />
              <span className="text-blue-800 font-semibold">아기 울음 상담사</span>
            </div>
            <p className="text-blue-700 text-sm leading-relaxed">
              안녕하세요! 👶 아기 울음 전문 상담사입니다.<br />
              아기가 울고 있어서 걱정이시군요. 함께 원인을 찾아보고 해결책을 찾아보겠습니다.
              {babyAgeInMonths !== undefined && (
                <><br /><br />현재 등록된 아기 월령: <strong>{babyAgeInMonths}개월</strong></>
              )}
              <br /><br />어떤 도움이 필요하신가요?
            </p>
          </div>
        )}

        {/* 메시지 표시 */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Baby size={16} className="text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600">아기 상담사</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
              
              {/* 응급상황 경고 */}
              {message.role === 'assistant' && lastResponse?.isEmergency && index === messages.length - 1 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">응급상황 감지</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    즉시 병원 방문이나 119 신고를 고려해보세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 답변 대기중 표시 - 개선된 메시지 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Baby size={16} className="text-blue-500" />
                <span className="text-xs font-semibold text-blue-600">아기 상담사</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={16} />
                <span className="text-sm text-gray-600">답변을 준비하고 있어요...</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                아기에게 맞는 조언을 찾고 있습니다 💭
              </p>
            </div>
          </div>
        )}
        
        {/* 에러 메시지 개선 */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 max-w-[90%]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-semibold">연결 문제가 발생했어요</span>
              </div>
              <p className="text-sm mb-3">{error}</p>
              
              {/* API 키 설정 안내 */}
              {error.includes('API 키') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                  <p className="text-xs text-yellow-800 font-medium mb-2">
                    💡 해결 방법:
                  </p>
                  <ol className="text-xs text-yellow-700 list-decimal list-inside space-y-1">
                    <li>프로젝트 루트에 <code className="bg-yellow-100 px-1 rounded">.env.local</code> 파일 생성</li>
                    <li><code className="bg-yellow-100 px-1 rounded">VITE_OPENAI_API_KEY=your_api_key</code> 추가</li>
                    <li>개발 서버 재시작</li>
                  </ol>
                  <p className="text-xs text-yellow-600 mt-2">
                    자세한 내용은 <code className="bg-yellow-100 px-1 rounded">API_SETUP.md</code> 파일을 참고하세요.
                  </p>
                </div>
              )}
              
              {/* 재시도 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs transition-colors"
                >
                  <RefreshCw size={12} />
                  다시 시도
                </button>
              </div>
              
              {/* 기본 대처법 제공 */}
              <div className="text-sm bg-white rounded p-3 mb-3 mt-3">
                <p className="font-medium mb-2">📋 일반적인 아기 울음 대처법:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>수유 시간 확인 (2-4시간 간격)</li>
                  <li>기저귀 상태 확인 및 교체</li>
                  <li>트림 시켜주기</li>
                  <li>포근하게 안아주며 달래기</li>
                  <li>조용하고 어두운 환경 만들기</li>
                </ol>
                <p className="mt-2 text-xs text-red-600 font-medium">
                  ⚠️ 지속적으로 울거나 평소와 다르다면 소아과에 문의하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 퀵 액션 버튼들 */}
        {showQuickActions && messages.length === 0 && !isLoading && (
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-600 font-medium">
              자주 묻는 질문을 선택해보세요
            </p>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.text)}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left group"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm text-gray-700 group-hover:text-blue-700">
                    {action.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="아기 상태를 자세히 설명해주세요..."
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
        
        {/* 입력 도움말 */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 "아기가 30분째 울고 있어요", "수유 후에도 계속 울어요" 처럼 구체적으로 설명해주세요
        </p>
      </div>
    </div>
  );
};