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

// OpenAI 설정 (환경변수에서 가져오기)
let openai;
try {
  validateOpenAIKey();
  openai = new OpenAI({
    apiKey: process.env.VITE_OPENAI_API_KEY,
  });
} catch (error) {
  console.warn('OpenAI 초기화 실패:', error.message);
}

// 아기 울음 분석 API
router.post('/analyze-cry', async (req, res) => {
  try {
    // OpenAI API 키 확인
    if (!openai) {
      return res.status(503).json({ 
        error: 'OpenAI 서비스가 사용할 수 없습니다',
        message: 'API 키를 확인해주세요' 
      });
    }

    const { audioData, babyAge, symptoms } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // OpenAI를 사용한 울음 분석 프롬프트
    const prompt = `
      아기 울음 분석을 해주세요.
      아기 나이: ${babyAge || '알 수 없음'}개월
      추가 증상: ${symptoms || '없음'}
      
      이 울음 소리를 분석하여 다음을 알려주세요:
      1. 울음의 원인 (배고픔, 졸림, 불편함, 아픔 등)
      2. 해결 방법
      3. 주의사항
      4. 병원 방문이 필요한지 여부
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 아기 울음 분석 전문가입니다. 부모님들이 이해하기 쉽게 설명해주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cry analysis error:', error);
    
    // OpenAI API 관련 에러 처리
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return res.status(401).json({ 
        error: 'OpenAI API 인증 실패',
        message: 'API 키를 확인해주세요' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze cry',
      message: error.message 
    });
  }
});

// 아기 성장 기록 API
router.post('/growth-record', async (req, res) => {
  try {
    const { weight, height, headCircumference, date, notes } = req.body;
    
    // 여기에 데이터베이스 저장 로직 추가
    // 현재는 메모리에서 처리
    
    const record = {
      id: Date.now(),
      weight,
      height,
      headCircumference,
      date: date || new Date().toISOString(),
      notes,
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      record,
      message: '성장 기록이 저장되었습니다.'
    });

  } catch (error) {
    console.error('Growth record error:', error);
    res.status(500).json({ 
      error: 'Failed to save growth record',
      message: error.message 
    });
  }
});

// 아기 정보 조회 API
router.get('/info', (req, res) => {
  // 여기에 데이터베이스에서 아기 정보 조회 로직 추가
  res.json({
    success: true,
    baby: {
      name: "아기",
      birthDate: "2024-01-01",
      gender: "여자",
      currentAge: "3개월"
    }
  });
});

export default router;
