// server/routes/baby-care-rag.js
import express from 'express';
import { OpenAI } from 'openai';

const router = express.Router();

// RAG 문서 - 영유아 케어 가이드 데이터
const RAG_KNOWLEDGE_BASE = {
  vaccination: {
    title: "예방접종 가이드",
    content: `
    📋 예방접종(0-24개월) 핵심사항:
    
    ✅ 국가예방접종사업(NIP) 포함 백신:
    - B형간염, BCG, DTaP, IPV, Hib, 폐렴구균, 로타바이러스, MMR, 수두, A형간염
    - 권장 일정에 맞춰 접종하되, 정확한 시기는 소아청소년과 전문의와 상의
    
    ⚠️ 접종 연기/금기 상황:
    - 고열, 급성 감염 등은 의료진 판단에 따라 연기
    - 접종 후 흔한 반응: 미열, 국소 통증/발적 (1-2일 내 호전)
    - 심한 알레르기 반응(호흡곤란, 전신 발진) 시 즉시 진료
    `
  },
  fever_medicine: {
    title: "해열제 사용 가이드",
    content: `
    💊 해열제 안전 사용법:
    
    🔸 아세트아미노펜:
    - 생후 2개월 이상 사용 가능
    - 용량: 10-15 mg/kg 1회, 4-6시간 간격
    
    🔸 이부프로펜:
    - 생후 6개월 이상 사용 가능
    - 용량: 5-10 mg/kg 1회, 6-8시간 간격
    
    ⚠️ 주의사항:
    - 6개월 미만 영아에게는 이부프로펜 금지
    - 12개월 미만 영아에게 꿀 절대 금지 (영아 보툴리눔 위험)
    - 두 종류 해열제 교차 사용은 의료진 지침이 있을 때만
    - 체중 기반 정확한 용량 계산, 계량 스푼/주사기 사용 권장
    - 탈수·무호흡·경련·의식 저하 등 응급 신호 시 즉시 진료
    `
  },
  safe_sleep: {
    title: "안전한 수면 환경",
    content: `
    😴 안전한 수면 가이드:
    
    🛏️ 수면 자세:
    - 등으로 눕혀 재우기 (Supine position) 필수
    - 엎드림/옆으로 눕히기는 영아돌연사증후군(SIDS) 위험 증가
    - 깨어 있을 때의 Tummy time은 감독 하에 실시
    
    🏠 수면 공간:
    - 단단한 매트리스 + 맞는 크기의 시트
    - 느슨한 이불, 베개, 범퍼, 인형, 쿠션 금지
    - 침대·소파·쿠션 위 공동 수면 금지 (질식 위험)
    
    🌡️ 환경 관리:
    - 실내 온도: 21-24°C
    - 습도: 40-60%
    - 과열 방지를 위해 얇은 레이어링 권장
    - 백색소음은 과도하지 않게, 조도는 낮게 유지
    
    👪 룸셰어링(같은 방) 권장, 베드셰어링(같은 침대) 금지
    - 생후 초기에는 같은 방에서 재우되, 같은 침대에서 자는 것은 질식·눌림 위험
    
    🧭 SIDS 위험 감소:
    - 흡연·음주·약물 노출 최소화
    - 모유수유는 SIDS 위험 감소에 도움
    - 수면 중 머리 과열/얼굴 가림이 없도록 점검
    `
  }
};

// 키워드 매칭을 위한 분류 시스템
const KNOWLEDGE_CATEGORIES = {
  vaccination: [
    '예방접종', '백신', '접종', 'BCG', 'DTaP', 'IPV', 'Hib', '폐렴구균', 
    '로타바이러스', 'MMR', '수두', 'A형간염', 'B형간염', '접종일정'
  ],
  fever_medicine: [
    '해열제', '열', '체온', '발열', '아세트아미노펜', '이부프로펜', 
    '타이레놀', '부루펜', '약', '용량', '복용법'
  ],
  safe_sleep: [
    '수면', '잠', '재우기', '침대', '매트리스', 'SIDS', '영아돌연사', 
    '수면자세', '엎드림', '베개', '이불', '온도', '습도', '룸셰어링'
  ]
};

// OpenAI 설정
let openai;
try {
  if (process.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI 초기화 실패:', error.message);
}

// 텍스트에서 관련 키워드 찾기
function findRelevantKeywords(text) {
  const lowerText = text.toLowerCase();
  const foundCategories = [];
  
  for (const [category, keywords] of Object.entries(KNOWLEDGE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundCategories.push(category);
        break;
      }
    }
  }
  
  return [...new Set(foundCategories)]; // 중복 제거
}

// RAG 기반 컨텍스트 검색
function retrieveRelevantContext(userMessage) {
  const relevantCategories = findRelevantKeywords(userMessage);
  
  if (relevantCategories.length === 0) {
    return null; // 관련 정보가 없음
  }
  
  let contextText = '';
  for (const category of relevantCategories) {
    const knowledge = RAG_KNOWLEDGE_BASE[category];
    if (knowledge) {
      contextText += `\n\n=== ${knowledge.title} ===\n${knowledge.content}`;
    }
  }
  
  return {
    categories: relevantCategories,
    context: contextText.trim()
  };
}

// RAG 기반 육아 상담 챗봇
router.post('/baby-consultation', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: 'OpenAI 서비스가 사용할 수 없습니다',
        message: 'API 키를 확인해주세요' 
      });
    }

    const { message, babyInfo } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '메시지가 필요합니다' });
    }

    // RAG: 사용자 질문과 관련된 지식 검색
    const relevantKnowledge = retrieveRelevantContext(message);
    
    let systemPrompt = '';
    let response = '';
    
    if (relevantKnowledge) {
      // RAG 기반 응답 생성
      systemPrompt = `
당신은 전문적인 영유아(0-24개월) 케어 상담사입니다.
아래 제공된 신뢰할 수 있는 의료 가이드라인을 바탕으로 안전하고 정확한 조언을 제공하세요.

=== 신뢰할 수 있는 의료 가이드라인 ===
${relevantKnowledge.context}

=== 응답 지침 ===
1. 위 가이드라인 정보를 우선적으로 활용하여 답변하세요
2. 부모님의 감정에 공감하며 친근하게 답변하세요
3. 구체적이고 실용적인 조언을 제공하세요
4. 안전한 양육 방법을 최우선으로 제시하세요
5. 응급 상황이 의심되면 즉시 의료진 상담을 권하세요
6. 개별 상황은 의료진과 상의할 것을 반드시 안내하세요

아기 정보: ${babyInfo ? JSON.stringify(babyInfo) : '정보 없음'}

응답 형식:
- 따뜻하고 이해하기 쉬운 언어 사용
- 중요한 안전 정보는 강조 표시
- 필요시 단계별 안내 제공
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 800,
        temperature: 0.3, // 의료 정보이므로 낮은 창의성
      });

      response = completion.choices[0].message.content;
      
      res.json({
        success: true,
        response,
        hasRagKnowledge: true,
        knowledgeCategories: relevantKnowledge.categories,
        timestamp: new Date().toISOString(),
        messageId: Date.now()
      });
      
    } else {
      // RAG 문서에 없는 질문 - 답변 제한
      res.json({
        success: true,
        response: `죄송합니다. 해당 내용은 현재 제공하고 있는 영유아 케어 가이드(예방접종, 해열제 사용, 안전한 수면환경)에 포함되지 않습니다.

현재 상담 가능한 주제:
• 🏥 예방접종 일정 및 주의사항
• 💊 해열제 안전 사용법
• 😴 안전한 수면 환경 조성

더 자세한 상담이 필요하시면 소아청소년과 전문의와 상의해주세요.`,
        hasRagKnowledge: false,
        availableTopics: ['vaccination', 'fever_medicine', 'safe_sleep'],
        timestamp: new Date().toISOString(),
        messageId: Date.now()
      });
    }

  } catch (error) {
    console.error('RAG 챗봇 오류:', error);
    
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return res.status(401).json({ 
        error: 'OpenAI API 인증 실패',
        message: 'API 키를 확인해주세요' 
      });
    }
    
    res.status(500).json({ 
      error: '상담 서비스 처리 실패',
      message: error.message 
    });
  }
});

// 사용 가능한 상담 주제 조회
router.get('/consultation-topics', (req, res) => {
  const topics = Object.entries(RAG_KNOWLEDGE_BASE).map(([key, value]) => ({
    id: key,
    title: value.title,
    keywords: KNOWLEDGE_CATEGORIES[key] || []
  }));
  
  res.json({
    success: true,
    topics,
    totalTopics: topics.length
  });
});

// 특정 주제의 상세 정보 조회
router.get('/topic/:topicId', (req, res) => {
  const { topicId } = req.params;
  const topic = RAG_KNOWLEDGE_BASE[topicId];
  
  if (!topic) {
    return res.status(404).json({
      error: '해당 주제를 찾을 수 없습니다',
      availableTopics: Object.keys(RAG_KNOWLEDGE_BASE)
    });
  }
  
  res.json({
    success: true,
    topic: {
      id: topicId,
      ...topic,
      keywords: KNOWLEDGE_CATEGORIES[topicId] || []
    }
  });
});

// 빠른 질문 템플릿
router.get('/quick-questions', (req, res) => {
  const quickQuestions = [
    {
      id: 1,
      category: 'vaccination',
      question: '우리 아기 예방접종 일정이 궁금해요',
      icon: '💉'
    },
    {
      id: 2,
      category: 'fever_medicine',
      question: '아기가 열이 나는데 해열제 줘도 될까요?',
      icon: '🌡️'
    },
    {
      id: 3,
      category: 'safe_sleep',
      question: '안전하게 재우는 방법을 알려주세요',
      icon: '😴'
    },
    {
      id: 4,
      category: 'fever_medicine',
      question: '해열제 용량을 어떻게 계산하나요?',
      icon: '💊'
    },
    {
      id: 5,
      category: 'safe_sleep',
      question: 'SIDS 예방법이 궁금해요',
      icon: '🛡️'
    }
  ];
  
  res.json({
    success: true,
    questions: quickQuestions
  });
});

export default router;