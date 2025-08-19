import express from 'express';
import { OpenAI } from 'openai';

const router = express.Router();

// OpenAI API 키 검증
const validateOpenAIKey = () => {
  if (!process.env.VITE_OPENAI_API_KEY) {
  throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 추가해주세요.');
}
  return true;
};

// OpenAI 설정
let openai;
try {
  validateOpenAIKey();
  openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
  });
} catch (error) {
  console.warn('OpenAI 초기화 실패:', error.message);
}

// 채팅 메시지 전송 API
router.post('/message', async (req, res) => {
  try {
    // OpenAI API 키 확인
    if (!openai) {
      return res.status(503).json({ 
        error: 'OpenAI 서비스가 사용할 수 없습니다',
        message: 'API 키를 확인해주세요' 
      });
    }

    const { message, context, babyInfo } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 아기 정보를 포함한 컨텍스트 구성
    const systemPrompt = `
      당신은 아기 양육 전문가입니다. 
      부모님들의 질문에 대해 친근하고 전문적으로 답변해주세요.
      
      아기 정보: ${babyInfo ? JSON.stringify(babyInfo) : '정보 없음'}
      대화 컨텍스트: ${context || '없음'}
      
      답변 시 다음을 고려해주세요:
      1. 부모님의 감정에 공감하기
      2. 구체적이고 실용적인 조언 제공
      3. 안전한 양육 방법 제시
      4. 필요시 전문의 상담 권장
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
      messageId: Date.now()
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // OpenAI API 관련 에러 처리
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return res.status(401).json({ 
        error: 'OpenAI API 인증 실패',
        message: 'API 키를 확인해주세요' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message 
    });
  }
});

// 채팅 히스토리 조회 API
router.get('/history', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // 여기에 데이터베이스에서 채팅 히스토리 조회 로직 추가
    // 현재는 더미 데이터 반환
    
    const dummyHistory = [
      {
        id: 1,
        message: "아기가 밤에 자주 깨는데 어떻게 해야 할까요?",
        response: "아기의 수면 패턴을 정리하는 방법을 알려드릴게요...",
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        message: "이유식은 언제부터 시작해야 하나요?",
        response: "보통 4-6개월부터 시작하는 것이 좋습니다...",
        timestamp: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    res.json({
      success: true,
      history: dummyHistory.slice(offset, offset + parseInt(limit)),
      total: dummyHistory.length,
      hasMore: offset + parseInt(limit) < dummyHistory.length
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat history',
      message: error.message 
    });
  }
});

// 빠른 질문 템플릿 API
router.get('/quick-questions', (req, res) => {
  try {
    const quickQuestions = [
      {
        id: 1,
        question: "아기 수면 패턴 정리 방법",
        category: "수면"
      },
      {
        id: 2,
        question: "이유식 시작 시기와 방법",
        category: "영양"
      },
      {
        id: 3,
        question: "아기 발달 단계별 체크리스트",
        category: "발달"
      },
      {
        id: 4,
        question: "아기 안전 수칙",
        category: "안전"
      },
      {
        id: 5,
        question: "아기 질병 증상과 대처법",
        category: "건강"
      }
    ];

    res.json({
      success: true,
      questions: quickQuestions
    });

  } catch (error) {
    console.error('Quick questions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch quick questions',
      message: error.message 
    });
  }
});

export default router;
