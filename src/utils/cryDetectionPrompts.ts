// src/utils/cryDetectionPrompts.ts
// 기존 chatPrompts.ts와 별도로 울음소리 감지 전용 프롬프트

import { 
  BABY_EXPERT_SYSTEM_PROMPT, 
  getAgeSpecificPrompt,
  EMERGENCY_RESPONSE_PROMPT 
} from './chatPrompts';

// 울음소리 감지 전용 확장 프롬프트
export const CRY_DETECTION_ENHANCED_PROMPT = `
${BABY_EXPERT_SYSTEM_PROMPT}

## 울음소리 자동 감지 모드 추가 지침:
당신은 이제 실시간 울음소리 감지 시스템과 연동되어 작동합니다.

### 울음소리 분석 결과에 따른 응답:
1. **tired (졸려함)**: "침대를 부드럽게 흔들까요?"로 시작
2. **hungry (배고픔)**: "아이가 몇 개월인가요?"로 월령 확인 후 급식 가이드
3. **belly_pain (배앓이)**: 원인 분석 후 단계별 대처법 제시
4. **cold_hot (온도 불편)**: 현재 환경 데이터와 함께 온습도 조절 제안
5. **discomfort (일반 불편)**: 체크리스트 형태로 확인사항 제시
6. **burping (트림 필요)**: 즉시 실행 가능한 트림 방법 안내

### 스마트 기기 연동 응답 패턴:
- 기기 제어 제안 시: "~할까요?" 형태로 사용자 동의 구함
- 사용자가 "응/네/좋아요" 등 긍정 응답 시: [기기명 작동] 표시
- 부정 응답 시: 대안 방법 제시

### 응급상황 감지:
- 고위험 키워드 감지 시 즉시 의료진 연락 권유
- 응급상황 알림음 발송 요청
`;

// 상황별 구체적 대화 템플릿
export const SITUATION_RESPONSE_TEMPLATES = {
  tired: {
    initial: "아이가 졸려하는 상황이군요! 침대를 부드럽게 흔들까요?",
    deviceAccepted: "[침대 스윙을 시작합니다]\n\n침대가 부드럽게 흔들리기 시작했어요. 아기가 편안해지는지 지켜보세요.",
    deviceDeclined: "알겠어요. 다른 방법을 시도해보겠습니다.\n\n👶💬 방 조명을 낮추고 백색소음을 틀어주세요. 포근한 담요로 감싸고 등을 부드럽게 쓰다듬어 주세요. 기저귀와 실내 온·습도도 함께 확인해 주세요.",
    followUp: "아기가 진정되고 있나요? 추가로 도움이 필요하시면 말씀해주세요."
  },

  hungry: {
    initial: "아이가 배고파하는 상황이군요! 아이가 몇 개월인가요?",
    ageResponse: (age: number) => {
      if (age < 6) {
        return `${age}개월 아기는 모유나 분유만 주시면 됩니다.\n- 수유 간격: 2-3시간\n- 모유·분유 외 다른 음식이나 물은 불필요해요\n- 식사 후에는 꼭 트림을 시켜주세요!`;
      } else if (age < 12) {
        return `${age}개월 아기에게 추천하는 음식:\n- 모유·분유 + 부드러운 이유식\n- 미음, 죽, 으깬 채소/과일\n\n⚠️ 주의: 달걀, 생선, 우유, 콩류는 소량씩 시도 후 반응 확인\n❌ 금지: 소금·설탕·꿀, 견과류 통째\n\n식사 후 트림을 꼭 시켜주세요!`;
      } else if (age < 18) {
        return `${age}개월 아기에게 추천하는 음식:\n- 잘게 썬 부드러운 과일 (바나나, 배, 복숭아)\n- 으깬 고구마·단호박\n- 아기용 쌀과자, 무염 치즈, 아기 전용 요거트\n\n⚠️ 주의: 딸기·키위·토마토는 소량씩 시도\n❌ 금지: 포도 통째, 견과류, 딱딱한 과자\n\n식사 후 트림을 꼭 시켜주세요!`;
      } else {
        return `${age}개월 아기에게 추천하는 음식:\n- 한 입 크기의 밥·채소·고기\n- 잘게 썬 과일\n- 미니 샌드위치, 아기용 떡, 무가당 요구르트\n\n⚠️ 주의: 갑각류, 견과류는 버터나 가루로 소량 도입\n❌ 금지: 질기고 딱딱한 음식, 삼킬 위험이 있는 음식\n\n식사 후 트림을 꼭 시켜주세요!`;
      }
    },
    followUp: "식사 준비가 되셨나요? 수유 중에 주의사항이 있으시면 언제든 말씀해주세요."
  },

  belly_pain: {
    initial: "아이가 배앓이하는 상황이군요!\n\n📋 배앓이 원인:\n1. 소화 과정에서 생긴 가스\n2. 과식 또는 빠른 수유 속도\n3. 장 운동 미숙으로 인한 영아산통\n4. 드물게 우유 단백질 알레르기, 장염, 변비 등\n\n💡 대처 방법:\n1. **자세 조정**: 수유 후 아기를 세워 안아 트림 시킴\n2. **복부 마사지**: 시계방향으로 배를 부드럽게 마사지\n3. **온찜질**: 따뜻한 수건을 배 위에 올려 근육 이완\n4. **수유 방법 조절**: 한 번에 많이 먹이지 않고 여러 번 나눠서 수유\n5. **안정시키기**: 조용한 환경에서 백색소음 들려주기",
    emergency: "🚨 다음 증상이 있다면 즉시 병원에 가세요:\n- 발열, 혈변, 심한 구토\n- 복부 팽만이 심하고 울음이 지속되는 경우\n- 하루 이상 대소변에 변화가 있는 경우",
    followUp: "복부 마사지를 시도해보셨나요? 아기 상태에 변화가 있으면 알려주세요."
  },

  cold_hot: {
    initial: (temp: number, humidity: number, babyTemp?: number) => 
      `아이가 춥거나 더워하는 상황이군요!\n\n현재 방의 온/습도: ${temp}°C, ${humidity}%\n\n📊 적정 환경:\n**온도**\n- 여름철: 24~26℃\n- 겨울철: 20~22℃\n- 신생아(3개월 이내): 21~24℃\n\n**습도**\n- 권장 범위: 40~60%\n- 이상적: 50% 내외\n\n아기의 체온: ${babyTemp ? `${babyTemp}°C` : '측정 필요'}\n\n🌡️ 체온 상태:\n- 36.0~37.4℃: 정상 범위\n- 37.5~37.7℃: 미열 가능성, 30분~1시간 후 재측정 권장\n- ≥37.8℃: 발열 가능성 → 귀(고막) 또는 항문 체온계로 재확인 필요`,
    humidifierOffer: "습도가 낮네요. 가습기를 작동시키겠습니까?",
    humidifierOn: "[가습기를 작동시킵니다]\n\n가습기가 작동을 시작했어요. 습도가 적정 수준에 도달할 때까지 기다려주세요.",
    optimal: "방의 온/습도는 적정합니다. 아기의 옷차림을 확인해주세요.",
    followUp: "온습도 조절 후 아기가 편안해졌나요?"
  },

  discomfort: {
    initial: "아이가 불편해하는 상황이군요!\n\n다음 항목들을 체크해 주세요:\n\n✅ **의복·착용물 문제**\n- 옷이 너무 꽉 끼거나 헐렁한지 확인\n- 옷·속옷의 태그, 단추, 지퍼가 피부를 긁는지 확인\n- 모자·양말·헤어밴드가 너무 조이는지 확인\n\n✅ **피부·감각 자극**\n- 머리카락, 실, 끈이 손가락·발가락에 감겼는지 확인 (토니켓 증후군 주의)\n- 모래, 먼지, 이물질이 피부에 붙었는지 확인\n- 로션, 세제 잔여물로 인한 가려움 확인\n\n✅ **자세·지지 문제**\n- 안는 자세·누운 자세가 불편한지 확인\n- 카시트·유모차 안전벨트 압박 확인\n\n✅ **위생·기저귀 문제**\n- 기저귀가 너무 조이거나 헐거운지 확인\n- 기저귀 속 주름·이물질 확인\n- 배변 후 즉시 처리했는지 확인",
    followUp: "어떤 부분에서 문제를 발견하셨나요? 구체적으로 알려주시면 더 자세한 조치법을 안내해드릴게요."
  },

  burping: {
    initial: "아이가 트림하고 싶어하는 상황이군요!\n\n💨 **즉시 대처방안:**\n\n1. **바로 안아서 트림 시키기**\n   - 어깨에 세워 안기: 아기 턱을 어깨에 올리고 등을 부드럽게 톡톡\n   - 무릎 위에 앉히기: 한 손으로 가슴과 턱을 받치고 등을 쓰다듬기\n   - 무릎에 엎드리기: 복부 압박으로 가스 배출 도움\n\n2. **수유 중간 트림**\n   - 젖 한쪽 먹이고 중간에 잠시 멈춰서 트림 시킴\n\n3. **수유 자세 조정**\n   - 젖병 각도 45도 이상 유지\n   - 젖꼭지에 항상 우유가 차도록 함\n\n4. **수유 후 주의사항**\n   - 트림 후 10~15분 정도 세워 안아 안정시키기\n\n⚠️ **주의사항:**\n- 트림이 안 나와도 5~10분 시도 후 중단\n- 과도하게 두드리거나 세게 흔들지 말 것\n- 트림 시 구토가 잦으면 역류성 식도염 검사 필요",
    followUp: "트림이 나왔나요? 아기가 편안해졌는지 확인해보세요."
  }
};

// 기기 제어 응답 생성 함수
export const generateDeviceControlResponse = (
  device: string, 
  userResponse: string
): { action: string; message: string } => {
  const isPositive = ['응', '네', '좋아요', 'yes', 'ok', '그래', '맞아'].some(word => 
    userResponse.toLowerCase().includes(word)
  );

  const devices = {
    bed_swing: {
      action: isPositive ? '[침대 스윙을 시작합니다]' : '',
      message: isPositive 
        ? '침대가 부드럽게 흔들리기 시작했어요. 아기가 편안해지는지 지켜보세요.'
        : '알겠어요. 다른 방법을 시도해보겠습니다.\n\n👶💬 방 조명을 낮추고 백색소음을 틀어주세요. 포근한 담요로 감싸고 등을 부드럽게 쓰다듬어 주세요.'
    },
    humidifier: {
      action: isPositive ? '[가습기를 작동시킵니다]' : '',
      message: isPositive
        ? '가습기가 작동을 시작했어요. 습도가 적정 수준에 도달할 때까지 기다려주세요.'
        : '네, 알겠습니다. 다른 방법으로 습도를 조절해보세요.'
    },
    white_noise: {
      action: isPositive ? '[백색소음을 재생합니다]' : '',
      message: isPositive
        ? '백색소음이 재생되기 시작했어요. 아기가 진정되는지 확인해보세요.'
        : '알겠어요. 직접 자장가를 불러주시거나 조용한 환경을 만들어주세요.'
    },
    room_light: {
      action: isPositive ? '[조명을 수면 모드로 조절합니다]' : '',
      message: isPositive
        ? '조명이 수면에 적합하게 조절되었어요.'
        : '알겠습니다. 직접 조명을 조절해주세요.'
    }
  };

  const deviceInfo = devices[device as keyof typeof devices];
  return deviceInfo || { action: '', message: '알 수 없는 기기입니다.' };
};

// 기존 chatgpt.ts와 호환되는 확장 서비스
export class EnhancedChatGPTService {
  private currentSituation: string | null = null;
  private pendingDeviceControl: string | null = null;
  private conversationState: 'initial' | 'device_control' | 'follow_up' = 'initial';

  // 울음소리 감지 결과로 대화 시작
  async startCryDetectionConversation(
    situation: string,
    environmentData: { temperature: number; humidity: number; babyTemperature?: number },
    babyAge?: number
  ): Promise<string> {
    this.currentSituation = situation;
    this.conversationState = 'initial';

    switch (situation) {
      case 'tired':
        this.pendingDeviceControl = 'bed_swing';
        this.conversationState = 'device_control';
        return SITUATION_RESPONSE_TEMPLATES.tired.initial;

      case 'hungry':
        return SITUATION_RESPONSE_TEMPLATES.hungry.initial;

      case 'belly_pain':
        return SITUATION_RESPONSE_TEMPLATES.belly_pain.initial;

      case 'cold_hot':
        const { temperature, humidity, babyTemperature } = environmentData;
        let response = SITUATION_RESPONSE_TEMPLATES.cold_hot.initial(temperature, humidity, babyTemperature);
        
        if (humidity < 40) {
          this.pendingDeviceControl = 'humidifier';
          this.conversationState = 'device_control';
          response += '\n\n' + SITUATION_RESPONSE_TEMPLATES.cold_hot.humidifierOffer;
        } else {
          response += '\n\n' + SITUATION_RESPONSE_TEMPLATES.cold_hot.optimal;
        }
        return response;

      case 'discomfort':
        return SITUATION_RESPONSE_TEMPLATES.discomfort.initial;

      case 'burping':
        return SITUATION_RESPONSE_TEMPLATES.burping.initial;

      default:
        return "아기 상태를 분석하고 있어요. 잠시만 기다려주세요.";
    }
  }

  // 사용자 응답 처리
  async handleCryDetectionResponse(userInput: string): Promise<{ message: string; deviceAction?: string }> {
    if (this.conversationState === 'device_control' && this.pendingDeviceControl) {
      const deviceResponse = generateDeviceControlResponse(this.pendingDeviceControl, userInput);
      this.pendingDeviceControl = null;
      this.conversationState = 'follow_up';
      
      return {
        message: deviceResponse.action + '\n\n' + deviceResponse.message,
        deviceAction: deviceResponse.action
      };
    }

    // 월령 응답 처리 (hungry 상황)
    if (this.currentSituation === 'hungry') {
      const age = parseInt(userInput);
      if (!isNaN(age)) {
        const ageResponse = SITUATION_RESPONSE_TEMPLATES.hungry.ageResponse(age);
        this.conversationState = 'follow_up';
        return { message: ageResponse };
      }
      return { message: "정확한 월령을 숫자로 알려주세요. (예: 6)" };
    }

    // 일반 후속 대화
    this.conversationState = 'follow_up';
    const followUpMessage = this.getFollowUpMessage();
    return { message: followUpMessage };
  }

  private getFollowUpMessage(): string {
    if (!this.currentSituation) return "도움이 더 필요하시면 언제든 말씀해주세요.";

    const followUps = {
      tired: SITUATION_RESPONSE_TEMPLATES.tired.followUp,
      hungry: SITUATION_RESPONSE_TEMPLATES.hungry.followUp,
      belly_pain: SITUATION_RESPONSE_TEMPLATES.belly_pain.followUp,
      cold_hot: SITUATION_RESPONSE_TEMPLATES.cold_hot.followUp,
      discomfort: SITUATION_RESPONSE_TEMPLATES.discomfort.followUp,
      burping: SITUATION_RESPONSE_TEMPLATES.burping.followUp
    };

    return followUps[this.currentSituation as keyof typeof followUps] || "다른 도움이 필요하시면 말씀해주세요.";
  }

  // 기존 chatgpt.ts와 통합
  async integrateWithExistingService(
    existingChatGPTService: any,
    messages: any[],
    systemPrompt?: string
  ) {
    // 기존 서비스와 새로운 울음 감지 기능을 결합
    const enhancedSystemPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${CRY_DETECTION_ENHANCED_PROMPT}`
      : CRY_DETECTION_ENHANCED_PROMPT;
    
    // 기존 서비스의 메서드를 호출하여 통합된 응답 생성
    return await existingChatGPTService.generateResponse(
      messages,
      enhancedSystemPrompt
    );
  }
}