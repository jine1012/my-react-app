// src/hooks/useBabyAdvice.ts
import { useState, useCallback } from 'react';
import { chatGPTService, ChatMessage, ChatGPTResponse } from '../services/chatgpt';
import { BABY_EXPERT_SYSTEM_PROMPT, getAgeSpecificPrompt } from '../utils/chatPrompts';

interface UseBabyAdviceReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  lastResponse: ChatGPTResponse | null;
}

export const useBabyAdvice = (babyAgeInMonths?: number): UseBabyAdviceReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<ChatGPTResponse | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    console.log('💬 사용자 메시지 전송:', content);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // API 키 확인
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      console.log('🔑 API 키 확인:', {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0
      });
      
      if (!apiKey) {
        throw new Error('OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 VITE_OPENAI_API_KEY를 설정해주세요.');
      }

      // 시스템 프롬프트 구성
      let systemPrompt = BABY_EXPERT_SYSTEM_PROMPT;
      if (babyAgeInMonths !== undefined) {
        systemPrompt += '\n\n' + getAgeSpecificPrompt(babyAgeInMonths);
      }

      console.log('📝 시스템 프롬프트 구성:', {
        hasSystemPrompt: !!systemPrompt,
        systemPromptLength: systemPrompt.length,
        babyAge: babyAgeInMonths
      });

      // ChatGPT API 호출
      const response = await chatGPTService.sendMessage(
        [...messages, userMessage],
        systemPrompt
      );

      console.log('✅ API 응답 성공:', response);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponse(response);

      // 응급상황 감지 시 콘솔 로그
      if (response.isEmergency) {
        console.warn('⚠️ 응급상황이 감지되었습니다:', response.message);
      }

    } catch (err: unknown) {
      console.error('❌ ChatGPT API 오류:', err);
      
      let errorMessage = '답변을 받아올 수 없습니다. 네트워크 연결을 확인해주세요.';
      
      if (err instanceof Error) {
        console.log('🔍 에러 타입 분석:', {
          message: err.message,
          includesApiKey: err.message.includes('API 키'),
          includes401: err.message.includes('401'),
          includes429: err.message.includes('429'),
          includesNetwork: err.message.includes('network') || err.message.includes('fetch'),
          includesTimeout: err.message.includes('timeout'),
          includesServerError: err.message.includes('500') || err.message.includes('502') || err.message.includes('503')
        });
        
        if (err.message.includes('API 키')) {
          errorMessage = 'OpenAI API 키가 설정되지 않았습니다. 개발자에게 문의하세요.';
        } else if (err.message.includes('401')) {
          errorMessage = 'API 키가 유효하지 않습니다. 개발자에게 문의하세요.';
        } else if (err.message.includes('429')) {
          errorMessage = 'API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = '네트워크 연결을 확인해주세요. 인터넷이 연결되어 있는지 확인하세요.';
        } else if (err.message.includes('timeout')) {
          errorMessage = '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
          errorMessage = '서버에서 답변을 준비하는 중입니다. 잠시 후 다시 시도해주세요.';
        } else {
          // 사용자가 이해하기 쉬운 메시지로 변경
          errorMessage = '죄송합니다. 답변을 준비하는 데 문제가 발생했습니다. 다시 시도해주세요.';
        }
      }

      console.log('📝 최종 에러 메시지:', errorMessage);
      setError(errorMessage);
      
      // 사용자 메시지 제거 (실패한 경우)
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, babyAgeInMonths]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastResponse(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    lastResponse
  };
};