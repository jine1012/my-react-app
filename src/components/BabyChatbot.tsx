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

어떤 상황인지 자세히 말씀해 주세요.`;

      // 1초 후에 웰컴 메시지 자동 표시
      setTimeout(() => {
        // welcomeText를 직접 메시지로 추가하는 대신 간단한 시작 메시지로 대체
      }, 1000);
    }
  }, [babyAgeInMonths]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
    setShowQuickActions(false);
  };

  const handleQuickAction = async (action: string) => {
    await sendMessage(action);
    setShowQuickActions(false);
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
      }
    }
  };

  const quickActions = [
    "아기가 계속 울어요",
    "수유 후에도 울어요", 
    "기저귀를 갈아도 울어요",
    "열이 있는 것 같아요",
    "잠을 안 자려고 해요"
  ];

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 메시지 영역 - 스크롤 가능하도록 수정 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100% - 120px)' }}
      >
        {/* 웰컴 메시지 */}
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-gradient-to-r from-blue-50 to-pink-50 border border-blue-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="text-blue-500" size={16} />
                <span className="text-sm font-semibold text-blue-800">아기 울음 상담사</span>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                안녕하세요! 👶 아기 울음 전문 상담사입니다.
                <br /><br />
                아기가 울고 있어서 걱정이시군요. 함께 원인을 찾아보고 해결책을 찾아보겠습니다.
                <br /><br />
                {babyAgeInMonths !== undefined 
                  ? `현재 등록된 아기 월령: ${babyAgeInMonths}개월` 
                  : '먼저 아기의 월령을 설정하시면 더 정확한 조언을 드릴 수 있어요.'}
                <br /><br />
                어떤 상황인지 자세히 말씀해 주세요.
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${index}-${message.timestamp}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {/* 응급상황 경고 */}
              {message.role === 'assistant' && lastResponse?.isEmergency && index === messages.length - 1 && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-red-100 text-red-800 rounded-lg">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-semibold">⚠️ 응급상황 감지</span>
                </div>
              )}
              
              <div className="text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              
              {/* 추천 행동 */}
              {message.role === 'assistant' && lastResponse?.suggestedActions && lastResponse.suggestedActions.length > 0 && index === messages.length - 1 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">💡 추천 행동:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {lastResponse.suggestedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {message.timestamp && (
                <div className="text-xs opacity-70 mt-2 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={16} />
              <span className="text-sm text-gray-600">상담사가 답변을 준비하고 있어요...</span>
            </div>
          </div>
        )}
        
        {/* 에러 메시지 개선 */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 max-w-[90%]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-semibold">연결 오류</span>
              </div>
              <p className="text-sm mb-3">{error}</p>
              
              {/* 기본 대처법 제공 */}
              <div className="text-sm bg-white rounded p-3 mb-3">
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
              
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={14} />
                다시 시도
              </button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 응답 버튼 */}
      {showQuickActions && messages.length === 0 && !isLoading && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">🚀 빠른 상담:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-white hover:bg-blue-50 text-gray-700 px-3 py-2 rounded-full border border-gray-200 hover:border-blue-300 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="아기 상황을 자세히 설명해 주세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};