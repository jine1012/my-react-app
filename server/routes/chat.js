// server/routes/chat.js (환경변수 강제 로드)
import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 🔥 환경변수 강제 로드
dotenv.config();

const router = express.Router();

// 🔍 .env 파일 존재 확인
const envPath = path.join(process.cwd(), '.env');
console.log('🔍 .env 파일 체크:');
console.log('- 경로:', envPath);
console.log('- 존재함:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('- 내용 미리보기:', envContent.substring(0, 100) + '...');
}

// 🔍 환경변수 상세 확인
console.log('🔍 환경변수 상세 확인:');
console.log('- process.env.OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `설정됨 (${process.env.OPENAI_API_KEY.length}자)` : '❌ 없음');
console.log('- process.env.VITE_OPENAI_API_KEY:', process.env.VITE_OPENAI_API_KEY ? `설정됨 (${process.env.VITE_OPENAI_API_KEY.length}자)` : '❌ 없음');

// API 키 가져오기
const getApiKey = () => {
  // 1. 환경변수에서 시도
  let key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  // 2. .env 파일을 직접 파싱 (fallback)
  if (!key && fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('OPENAI_API_KEY=')) {
          key = line.split('=')[1].trim();
          console.log('🔧 .env 파일에서 직접 읽음: OPENAI_API_KEY');
          break;
        } else if (line.startsWith('VITE_OPENAI_API_KEY=')) {
          key = line.split('=')[1].trim();
          console.log('🔧 .env 파일에서 직접 읽음: VITE_OPENAI_API_KEY');
          break;
        }
      }
    } catch (error) {
      console.error('❌ .env 파일 직접 읽기 실패:', error.message);
    }
  }
  
  // 3. 하드코딩된 키 (최후의 수단)
  if (!key) {
    // 🚨 여기에 실제 API 키를 입력하세요 (임시)
    key = "sk-proj-your-actual-api-key-here";
    console.log('🚨 하드코딩된 키 사용');
  }
  
  return key;
};

// OpenAI 초기화
let openai;
const apiKey = getApiKey();

console.log('🔑 최종 API 키 상태:');
console.log('- 키 존재:', !!apiKey);
console.log('- 키 길이:', apiKey?.length || 0);
console.log('- 키 시작:', apiKey?.substring(0, 10) || 'none');

if (apiKey && apiKey !== "sk-proj-your-actual-api-key-here") {
  try {
    openai = new OpenAI({ apiKey });
    console.log('✅ OpenAI 초기화 성공!');
  } catch (error) {
    console.error('❌ OpenAI 초기화 실패:', error.message);
  }
} else {
  console.error('❌ 유효한 API 키가 없습니다');
}

// 채팅 메시지 API
router.post('/message', async (req, res) => {
  console.log('📥 채팅 요청 받음:', {
    hasOpenAI: !!openai,
    message: req.body?.message?.substring(0, 50) || 'none'
  });

  try {
    if (!openai) {
      console.error('❌ OpenAI 초기화되지 않음');
      return res.status(503).json({ 
        success: false,
        error: 'OpenAI 서비스가 사용할 수 없습니다',
        message: 'API 키를 확인해주세요',
        debug: {
          apiKeyFound: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          envFileExists: fs.existsSync(envPath)
        }
      });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    console.log('🤖 OpenAI API 호출 중...');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 친근하고 도움이 되는 아기 케어 전문가입니다."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    console.log('✅ OpenAI 응답 성공');

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
      messageId: Date.now()
    });

  } catch (error) {
    console.error('❌ 채팅 오류:', error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to process chat message',
      message: error.message
    });
  }
});

// 빠른 질문 API
router.get('/quick-questions', (req, res) => {
  const quickQuestions = [
    {
      id: 1,
      category: 'fever_medicine',
      question: '아기가 열이 나는데 해열제 줘도 될까요?',
      icon: '🌡️'
    },
    {
      id: 2,
      category: 'safe_sleep',
      question: '안전하게 재우는 방법을 알려주세요',
      icon: '😴'
    },
    {
      id: 3,
      category: 'vaccination',
      question: '예방접종 일정이 궁금해요',
      icon: '💉'
    }
  ];
  
  res.json({
    success: true,
    questions: quickQuestions
  });
});

export default router;