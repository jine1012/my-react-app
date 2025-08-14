// src/services/chatgpt.ts
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatGPTResponse {
  message: string;
  isEmergency?: boolean;
  suggestedActions?: string[];
  category?: 'hunger' | 'diaper' | 'sleep' | 'comfort' | 'health' | 'other';
}

class ChatGPTService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.openai.com/v1/chat/completions';
  
  constructor() {
    this.API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
    console.log('🔑 ChatGPT Service 초기화:', {
      hasApiKey: !!this.API_KEY,
      apiKeyLength: this.API_KEY ? this.API_KEY.length : 0,
      baseUrl: this.BASE_URL
    });
  }

  async sendMessage(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<ChatGPTResponse> {
    // API 키 확인
    if (!this.API_KEY) {
      console.error('❌ API 키가 설정되지 않음');
      throw new Error('OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 VITE_OPENAI_API_KEY를 추가해주세요.');
    }

    try {
      const requestMessages = [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      console.log('🚀 ChatGPT API 요청 시작...', {
        messageCount: requestMessages.length,
        hasSystemPrompt: !!systemPrompt,
        apiKeyPrefix: this.API_KEY.substring(0, 7) + '...',
        requestBody: {
          model: 'gpt-3.5-turbo',
          max_tokens: 800,
          temperature: 0.7
        }
      });

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: requestMessages,
          max_tokens: 800,
          temperature: 0.7
        })
      });

      console.log('📡 ChatGPT API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `ChatGPT API 오류 (${response.status})`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          console.error('❌ API 에러 상세:', errorData);
          if (errorData.error) {
            errorMessage = errorData.error.message || errorMessage;
            errorDetails = errorData.error.type || '';
          }
        } catch (e) {
          console.error('❌ 에러 응답 파싱 실패:', e);
        }

        // 상태 코드별 에러 처리 - 사용자 친화적 메시지로 변경
        switch (response.status) {
          case 401:
            throw new Error('API 키가 유효하지 않습니다. 개발자에게 문의하세요.');
          case 429:
            throw new Error('API 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
          case 500:
          case 502:
          case 503:
            throw new Error('서버에서 답변을 준비하는 중입니다. 잠시 후 다시 시도해주세요.');
          default:
            throw new Error(`답변을 준비하는 데 문제가 발생했습니다. (${response.status}) 다시 시도해주세요.`);
        }
      }

      const data = await response.json();
      console.log('✅ API 응답 데이터:', data);
      
      const messageContent = data.choices?.[0]?.message?.content;

      if (!messageContent) {
        console.error('❌ 응답에서 메시지 내용을 찾을 수 없음:', data);
        throw new Error('서버에서 답변을 받지 못했습니다. 다시 시도해주세요.');
      }

      console.log('✅ ChatGPT API 응답 성공');

      return this.parseResponse(messageContent);
    } catch (error) {
      console.error('❌ ChatGPT API 호출 실패:', error);
      
      if (error instanceof Error) {
        // 네트워크 오류인 경우
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          throw new Error('네트워크 연결을 확인해주세요. 인터넷이 연결되어 있는지 확인하세요.');
        }
        
        // 타임아웃 오류인 경우
        if (error.message.includes('timeout')) {
          throw new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
        }
        
        // 이미 처리된 에러는 그대로 전달
        throw error;
      }
      
      throw new Error('알 수 없는 문제가 발생했습니다. 다시 시도해주세요.');
    }
  }

  private parseResponse(content: string): ChatGPTResponse {
    // 응급상황 키워드 감지 (한국어)
    const emergencyKeywords = [
      '응급', '위험', '병원', '119', '의사', '즉시', 
      '고열', '경련', '발작', '의식', '호흡곤란', '응급실'
    ];
    
    const isEmergency = emergencyKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    // 카테고리 분류
    const category = this.categorizeResponse(content);

    // 추천 행동 추출 (한국어 패턴)
    const suggestedActions = this.extractSuggestedActions(content);

    return {
      message: content,
      isEmergency,
      suggestedActions,
      category
    };
  }

  private categorizeResponse(content: string): ChatGPTResponse['category'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('배고') || lowerContent.includes('수유') || lowerContent.includes('분유') || lowerContent.includes('모유')) {
      return 'hunger';
    }
    if (lowerContent.includes('기저귀') || lowerContent.includes('변') || lowerContent.includes('소변') || lowerContent.includes('똥')) {
      return 'diaper';
    }
    if (lowerContent.includes('잠') || lowerContent.includes('졸') || lowerContent.includes('수면') || lowerContent.includes('자다')) {
      return 'sleep';
    }
    if (lowerContent.includes('아프') || lowerContent.includes('열') || lowerContent.includes('병') || lowerContent.includes('감기')) {
      return 'health';
    }
    if (lowerContent.includes('안아') || lowerContent.includes('달래') || lowerContent.includes('놀아') || lowerContent.includes('관심')) {
      return 'comfort';
    }
    
    return 'other';
  }

  private extractSuggestedActions(content: string): string[] {
    // 한국어 패턴에 맞게 추천 행동 추출
    const lines = content.split('\n');
    const actions: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 숫자로 시작하는 리스트 (1., 2., 3. 등)
      if (/^\d+\./.test(trimmedLine)) {
        actions.push(trimmedLine.replace(/^\d+\.\s*/, ''));
      }
      
      // 하이픈으로 시작하는 리스트 (-, * 등)
      if (/^[-*]\s/.test(trimmedLine)) {
        actions.push(trimmedLine.replace(/^[-*]\s*/, ''));
      }
      
      // "해보세요", "시도해보세요" 등의 패턴
      if (trimmedLine.includes('해보세요') || trimmedLine.includes('시도해보세요') || trimmedLine.includes('확인해보세요')) {
        actions.push(trimmedLine);
      }
    }

    return actions.slice(0, 5); // 최대 5개만 반환
  }
}

export const chatGPTService = new ChatGPTService();