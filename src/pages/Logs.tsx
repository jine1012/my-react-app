import React, { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  Baby, 
  Thermometer, 
  NotebookPen, 
  TrendingUp, 
  MoreVertical, 
  Calendar,
  Sparkles,
  BookOpen,
  RefreshCw,
  Save,
  Wand2,
  Heart,
  Moon,
  Utensils,
  Droplets
} from "lucide-react";

// 아기 활동 데이터 인터페이스
interface BabyActivityData {
  date: string;
  sleepHours: number;
  feedingTimes: string[];
  cryingSessions: Array<{
    time: string;
    duration: number; // 분
    reason: 'hungry' | 'tired' | 'discomfort' | 'belly_pain' | 'burping';
  }>;
  temperatureReadings: Array<{
    time: string;
    bodyTemp: number;
    roomTemp: number;
  }>;
  diaperChanges: number;
  playTime: number; // 분
  milestones: string[];
  mood: 'happy' | 'fussy' | 'calm' | 'sleepy';
  notes: string[];
}

// 당일 아기 데이터 (임의 생성)
const generateTodayData = (): BabyActivityData => {
  return {
    date: new Date().toISOString().split('T')[0],
    sleepHours: 14.5,
    feedingTimes: ['06:30', '10:00', '13:30', '17:00', '20:30'],
    cryingSessions: [
      { time: '08:20', duration: 15, reason: 'hungry' },
      { time: '12:45', duration: 8, reason: 'tired' },
      { time: '16:30', duration: 20, reason: 'belly_pain' },
      { time: '19:15', duration: 5, reason: 'burping' }
    ],
    temperatureReadings: [
      { time: '07:00', bodyTemp: 36.8, roomTemp: 23.2 },
      { time: '12:00', bodyTemp: 37.1, roomTemp: 24.5 },
      { time: '18:00', bodyTemp: 36.9, roomTemp: 22.8 },
      { time: '21:00', bodyTemp: 36.7, roomTemp: 23.0 }
    ],
    diaperChanges: 6,
    playTime: 90,
    milestones: ['목을 더 안정적으로 가눔', '손가락 빨기 시작'],
    mood: 'happy',
    notes: ['오늘 첫 미소를 보여줬어요!', '새로운 장난감에 관심을 보임', '목욕을 좋아하는 것 같아요']
  };
};

export default function Logs() {
  const [todayData, setTodayData] = useState<BabyActivityData | null>(null);
  const [generatedDiary, setGeneratedDiary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableDiary, setEditableDiary] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 당일 데이터 로드
    setTodayData(generateTodayData());
    
    // 저장된 일기가 있는지 확인
    const savedDiary = localStorage.getItem(`baby-diary-${new Date().toISOString().split('T')[0]}`);
    if (savedDiary) {
      setEditableDiary(savedDiary);
      setGeneratedDiary(savedDiary);
    }
  }, []);

  // AI 기반 일기 생성 함수
  const generateDiary = async () => {
    if (!todayData) return;

    setIsGenerating(true);

    // 실제로는 AI API를 호출하겠지만, 여기서는 템플릿 기반으로 생성
    setTimeout(() => {
      const diary = createDiaryFromData(todayData);
      setGeneratedDiary(diary);
      setEditableDiary(diary);
      setIsGenerating(false);
    }, 2000);
  };

  // 데이터 기반 일기 생성 템플릿
  const createDiaryFromData = (data: BabyActivityData): string => {
    const date = new Date(data.date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    let diary = `📅 ${date}\n\n`;

    // 전체적인 하루 요약
    const moodEmoji = {
      happy: '😊',
      fussy: '😤',
      calm: '😌',
      sleepy: '😴'
    }[data.mood];

    diary += `오늘 우리 아기는 ${moodEmoji} 기분이 좋아 보이는 하루를 보냈어요!\n\n`;

    // 수면
    diary += `💤 **수면 기록**\n`;
    diary += `총 ${data.sleepHours}시간 동안 잠을 잤어요. `;
    if (data.sleepHours >= 14) {
      diary += `충분한 잠을 잔 덕분에 컨디션이 좋아 보였어요.\n\n`;
    } else {
      diary += `평소보다 잠을 적게 잤지만 그래도 건강하게 잘 지냈어요.\n\n`;
    }

    // 수유
    diary += `🍼 **수유 시간**\n`;
    diary += `총 ${data.feedingTimes.length}번 수유했어요: ${data.feedingTimes.join(', ')}\n`;
    diary += `규칙적인 수유 패턴을 보여주고 있어서 다행이에요.\n\n`;

    // 울음 분석
    if (data.cryingSessions.length > 0) {
      diary += `😢 **울음 분석**\n`;
      const totalCryTime = data.cryingSessions.reduce((sum, session) => sum + session.duration, 0);
      diary += `총 ${data.cryingSessions.length}번, ${totalCryTime}분 동안 울었어요.\n`;
      
      const reasonCounts = data.cryingSessions.reduce((acc, session) => {
        acc[session.reason] = (acc[session.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const reasonTexts = {
        hungry: '배고플 때',
        tired: '졸릴 때',
        discomfort: '불편할 때',
        belly_pain: '배아플 때',
        burping: '트림할 때'
      };

      Object.entries(reasonCounts).forEach(([reason, count]) => {
        diary += `- ${reasonTexts[reason as keyof typeof reasonTexts]}: ${count}번\n`;
      });
      diary += '\n';
    }

    // 체온 기록
    diary += `🌡️ **체온 기록**\n`;
    const avgBodyTemp = data.temperatureReadings.reduce((sum, reading) => sum + reading.bodyTemp, 0) / data.temperatureReadings.length;
    const avgRoomTemp = data.temperatureReadings.reduce((sum, reading) => sum + reading.roomTemp, 0) / data.temperatureReadings.length;
    
    diary += `평균 체온: ${avgBodyTemp.toFixed(1)}°C (정상 범위)\n`;
    diary += `평균 실내온도: ${avgRoomTemp.toFixed(1)}°C\n`;
    if (avgBodyTemp >= 36.0 && avgBodyTemp <= 37.5) {
      diary += `체온이 정상 범위 내에서 안정적으로 유지되었어요.\n\n`;
    } else {
      diary += `체온 변화를 조금 더 주의깊게 관찰해야 할 것 같아요.\n\n`;
    }

    // 기저귀 교체
    diary += `👶 **기저귀 교체**\n`;
    diary += `총 ${data.diaperChanges}번 기저귀를 갈아줬어요. 건강한 배변 활동을 보여주고 있어요.\n\n`;

    // 놀이 시간
    if (data.playTime > 0) {
      diary += `🎮 **놀이 시간**\n`;
      diary += `총 ${Math.floor(data.playTime / 60)}시간 ${data.playTime % 60}분 동안 놀았어요. `;
      diary += `활발하게 놀면서 건강하게 발달하고 있어요.\n\n`;
    }

    // 성장 기록
    if (data.milestones.length > 0) {
      diary += `🌟 **오늘의 성장**\n`;
      data.milestones.forEach(milestone => {
        diary += `- ${milestone}\n`;
      });
      diary += `새로운 발달을 보여준 특별한 하루였어요!\n\n`;
    }

    // 특별한 순간들
    if (data.notes.length > 0) {
      diary += `✨ **특별한 순간들**\n`;
      data.notes.forEach(note => {
        diary += `- ${note}\n`;
      });
      diary += '\n';
    }

    // 마무리
    diary += `오늘도 건강하고 사랑스러운 하루를 보낸 우리 아기에게 감사해요. 💕\n`;
    diary += `내일은 또 어떤 새로운 모습을 보여줄지 기대돼요!`;

    return diary;
  };

  const saveDiary = () => {
    const dateKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`baby-diary-${dateKey}`, editableDiary);
    setLastSaved(new Date());
  };

  const getReasonIcon = (reason: string) => {
    const icons = {
      hungry: <Utensils className="w-4 h-4 text-orange-500" />,
      tired: <Moon className="w-4 h-4 text-indigo-500" />,
      discomfort: <Baby className="w-4 h-4 text-rose-500" />,
      belly_pain: <Heart className="w-4 h-4 text-red-500" />,
      burping: <Droplets className="w-4 h-4 text-blue-500" />
    };
    return icons[reason as keyof typeof icons] || <Baby className="w-4 h-4 text-gray-500" />;
  };

  const getReasonText = (reason: string) => {
    const texts = {
      hungry: '배고픔',
      tired: '졸림',
      discomfort: '불편함',
      belly_pain: '배앓이',
      burping: '트림 필요'
    };
    return texts[reason as keyof typeof texts] || reason;
  };

  if (!todayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-slate-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="max-w-md mx-auto space-y-4 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">오늘의 일기</h1>
            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })}
            </p>
          </div>
          <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* 오늘의 데이터 요약 - 2x2 그리드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-indigo-100 rounded-lg mb-2">
                <Moon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{todayData.sleepHours}</div>
              <div className="text-xs text-slate-500">수면시간</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-orange-100 rounded-lg mb-2">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{todayData.feedingTimes.length}</div>
              <div className="text-xs text-slate-500">수유 횟수</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-rose-100 rounded-lg mb-2">
                <Baby className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{todayData.cryingSessions.length}</div>
              <div className="text-xs text-slate-500">울음 횟수</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 bg-green-100 rounded-lg mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xl font-bold text-slate-900">{todayData.milestones.length}</div>
              <div className="text-xs text-slate-500">새로운 발달</div>
            </div>
          </div>
        </div>

        {/* 울음 패턴 분석 */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm mb-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Baby className="w-4 h-4 text-rose-500" />
            울음 패턴 분석
          </h3>
          <div className="space-y-2">
            {todayData.cryingSessions.slice(0, 3).map((session, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                {getReasonIcon(session.reason)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 text-sm">{session.time}</span>
                    <span className="text-xs text-slate-600">{session.duration}분</span>
                  </div>
                  <div className="text-xs text-slate-600">{getReasonText(session.reason)}</div>
                </div>
              </div>
            ))}
            {todayData.cryingSessions.length > 3 && (
              <div className="text-xs text-slate-500 text-center pt-1">
                +{todayData.cryingSessions.length - 3}개 더
              </div>
            )}
          </div>
        </div>

        {/* 체온 기록 */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm mb-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-500" />
            체온 기록
          </h3>
          <div className="space-y-2">
            {todayData.temperatureReadings.slice(0, 3).map((reading, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{reading.time}</div>
                  <div className="text-xs text-slate-600">체온 {reading.bodyTemp.toFixed(1)}°C</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  reading.bodyTemp >= 36.0 && reading.bodyTemp <= 37.5 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {reading.bodyTemp >= 36.0 && reading.bodyTemp <= 37.5 ? '정상' : '관찰'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 성장 기록 & 특별한 순간들 */}
        {(todayData.milestones.length > 0 || todayData.notes.length > 0) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 p-4 shadow-sm mb-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              오늘의 특별한 순간들
            </h3>
            
            {todayData.milestones.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-amber-900 mb-2 text-sm">🌟 새로운 발달</h4>
                <div className="space-y-1">
                  {todayData.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-amber-800">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="leading-relaxed">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {todayData.notes.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-900 mb-2 text-sm">💝 기억하고 싶은 순간</h4>
                <div className="space-y-1">
                  {todayData.notes.map((note, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-amber-800">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="leading-relaxed">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 일기 생성 버튼 */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">AI 일기 생성</h3>
              <p className="text-xs text-slate-600">오늘의 데이터로 자동 일기 작성</p>
            </div>
          </div>
          
          <button
            onClick={generateDiary}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                일기 생성하기
              </>
            )}
          </button>
        </div>

        {/* 일기 에디터 */}
        {editableDiary && (
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">생성된 일기</h3>
            </div>

            <div className="p-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={editableDiary}
                  onChange={(e) => setEditableDiary(e.target.value)}
                  placeholder="AI가 생성한 일기가 여기에 표시됩니다."
                  className="w-full h-64 p-3 bg-slate-50/50 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none text-sm text-slate-900 placeholder-slate-400 leading-relaxed"
                />
                
                {/* 장식 요소 */}
                <div className="absolute top-2 right-2 opacity-20">
                  <Heart className="w-4 h-4 text-pink-400" />
                </div>
              </div>

              {/* 저장 정보 */}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <div>
                  {editableDiary.length > 0 && (
                    <>
                      {editableDiary.length}자
                      {lastSaved && (
                        <span className="ml-2">
                          저장: {lastSaved.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 저장 버튼 */}
              <button
                onClick={saveDiary}
                disabled={!editableDiary.trim()}
                className="w-full mt-3 flex items-center justify-center gap-2 p-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                일기 저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}