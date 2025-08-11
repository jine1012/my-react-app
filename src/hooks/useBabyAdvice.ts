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

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // API 키 확인
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 VITE_OPENAI_API_KEY를 설정해주세요.');
      }

      // 시스템 프롬프트 구성
      let systemPrompt = BABY_EXPERT_SYSTEM_PROMPT;
      if (babyAgeInMonths !== undefined) {
        systemPrompt += '\n\n' + getAgeSpecificPrompt(babyAgeInMonths);
      }

      // ChatGPT API 호출
      const response = await chatGPTService.sendMessage(
        [...messages, userMessage],
        systemPrompt
      );

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

    } catch (err) {
      console.error('ChatGPT API 오류:', err);
      
      let errorMessage = '일시적인 연결 문제가 발생했습니다.';
      
      if (err instanceof Error) {
        if (err.message.includes('API 키')) {
          errorMessage = 'OpenAI API 키가 설정되지 않았습니다. 개발자에게 문의하세요.';
        } else if (err.message.includes('401')) {
          errorMessage = 'API 키가 유효하지 않습니다.';
        } else if (err.message.includes('429')) {
          errorMessage = 'API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = '네트워크 연결을 확인해주세요.';
        }
      }
      
      setError(errorMessage);
      
      // 오프라인 대체 응답 개선
      const fallbackMessage: ChatMessage = {
        role: 'assistant',
        content: generateFallbackResponse(content, babyAgeInMonths),
        timestamp: Date.now()
      };
      
      // 1초 후에 대체 응답 추가 (사용자가 에러를 읽을 시간 제공)
      setTimeout(() => {
        setMessages(prev => [...prev, fallbackMessage]);
        setError(null); // 에러 메시지 제거
      }, 2000);
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

// 오프라인 대체 응답 생성 함수
function generateFallbackResponse(userInput: string, ageInMonths?: number): string {
  const input = userInput.toLowerCase();
  
  // 응급상황 키워드 체크
  const emergencyKeywords = ['열', '고열', '경련', '토', '구토', '숨', '호흡', '의식'];
  const hasEmergency = emergencyKeywords.some(keyword => input.includes(keyword));
  
  if (hasEmergency) {
    return `⚠️ 응급상황이 의심됩니다!

다음 증상이 있다면 즉시 119에 신고하거나 응급실로 가세요:

🚨 즉시 응급실:
- 의식을 잃거나 반응이 없음
- 호흡곤란, 쌕쌕거림
- 경련이나 발작
- 지속적인 구토
- 생후 3개월 미만 37.5°C 이상 열
- 생후 3개월 이상 38.5°C 이상 고열

📞 응급상황이 아니라면 소아과에 연락하세요.`;
  }

  // 일반적인 울음 상황별 대응
  if (input.includes('배고') || input.includes('수유')) {
    return `🍼 수유 관련 울음 대처법:

1. 수유 간격 확인
   ${ageInMonths && ageInMonths < 1 ? '- 신생아: 2-3시간 간격' : '- 3개월 이후: 3-4시간 간격'}

2. 배고픔 신호 확인
   - 손을 입으로 가져가기
   - 빨기 동작
   - 머리를 좌우로 흔들기

3. 수유 후 트림 시켜주기

지속적으로 울면 다른 원인도 확인해보세요.`;
  }

  if (input.includes('기저귀') || input.includes('변') || input.includes('똥')) {
    return `💩 기저귀 관련 울음 대처법:

1. 기저귀 상태 확인
   - 무게감으로 확인
   - 냄새 확인
   - 기저귀 라인 색깔 변화

2. 즉시 기저귀 교체

3. 발진이나 상처 확인
   - 발진 크림 발라주기
   - 잠시 기저귀 없이 말려주기

4. 교체 후에도 울면 다른 원인 확인`;
  }

  if (input.includes('잠') || input.includes('졸') || input.includes('수면')) {
    return `😴 수면 관련 울음 대처법:

1. 피로 신호 확인
   - 하품
   - 눈 비비기
   - 보채기

2. 수면 환경 조성
   - 어둡고 조용한 공간
   - 적절한 온도 (20-22°C)
   - 포근한 담요

3. 달래기 방법
   - 부드럽게 안아주기
   - 가벼운 흔들기
   - 자장가 불러주기

${ageInMonths && ageInMonths < 3 ? '신생아는 하루 16-18시간 잠을 잡니다.' : ''}`;
  }

  // 기본 대처법
  return `👶 일반적인 아기 울음 대처법:

1. **기본 욕구 확인**
   - 수유 시간 (${ageInMonths && ageInMonths < 1 ? '2-3시간' : '3-4시간'} 간격)
   - 기저귀 상태
   - 잠자리 신호

2. **신체 불편함 확인**
   - 옷이 너무 조이지 않는지
   - 머리카락이 손가락에 감기지 않았는지
   - 트림이 필요한지

3. **달래기 방법**
   - 포근하게 안아주기
   - 부드럽게 흔들어주기
   - 조용한 환경 만들기
   - 배 마사지

4. **관찰 포인트**
   - 울음 패턴과 소리
   - 동반 증상
   - 평소와 다른 행동

⚠️ 지속적으로 울거나 평소와 다르다면 소아과에 문의하세요.`;
}