// src/pages/SleepAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Lightbulb, 
  RefreshCw,
  BookOpen,
  Timer,
  Heart,
  Star
} from 'lucide-react';
import { 
  type SleepRecord,
  type SleepStatistics,
  type SleepPrediction
} from '../services/sleepService';

// 수면 교육 데이터
const sleepEducationMethods = [
  {
    id: 1,
    name: '퍼버법',
    subtitle: '(점진적 거리)',
    description: '아기가 울어하는 모습을 보며 때 완전히 잠들기 전 잠자리에 누워',
    method: '→ 스스로 진정할때까지 기다리며 주기',
    icon: <Timer className="w-6 h-6 text-blue-600" />,
    color: 'from-blue-100 to-indigo-100',
    borderColor: 'border-blue-200',
    schedule: {
      '1일차': { '2분': '5분', '10분': '10분' },
      '2일차': { '5분': '10분', '12분': '12분' },
    },
    pros: ['일관된 접근법', '빠른 결과'],
    cons: ['초기 스트레스', '부모도 힘듦']
  },
  {
    id: 2,
    name: '베이비 위스퍼 교육법',
    subtitle: '(안아법, 쉬닫법)',
    description: '아기가 울어하는 모습을 보며 때 완전히 잠들기 전 잠자리에 누워',
    method: '→ 바로 안아서 진정시켜 주기',
    icon: <Heart className="w-6 h-6 text-pink-600" />,
    color: 'from-pink-100 to-rose-100',
    borderColor: 'border-pink-200',
    techniques: ['Pick Up/Put Down 방법', '쉬잇 소리로 진정', '등 토닥이기'],
    benefits: ['부드러운 접근', '아기 스트레스 최소화', '애착 형성']
  },
  {
    id: 3,
    name: '마크법',
    subtitle: '(좀더 자유기)',
    description: '자율적 시간이 되면 아이를 잠자리에 눕히고 일어 중 방에서 나올',
    method: '→ 아이가 혼자가 스스로 잠이 드는 방법을 터득하게 만들기',
    icon: <Star className="w-6 h-6 text-amber-600" />,
    color: 'from-amber-100 to-yellow-100',
    borderColor: 'border-amber-200',
    steps: ['편안한 환경 조성', '규칙적인 루틴', '점진적 독립'],
    features: ['자율성 존중', '개별 맞춤', '장기적 효과']
  }
];

export default function SleepAnalysis() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sleepData, setSleepData] = useState<SleepRecord[]>([]);
  const [statistics, setStatistics] = useState<SleepStatistics | null>(null);
  const [prediction, setPrediction] = useState<SleepPrediction | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<number>(0);

  // 더미 데이터로 초기화 - 신생아 기준
  useEffect(() => {
    // 신생아 수면 데이터 생성 (2-4시간 간격으로 자주 깨어남)
    const dummyData: SleepRecord[] = [
      {
        id: '1',
        babyId: 1,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '21:00',
        wakeTime: '06:30',
        sleepHours: 16.5, // 신생아는 16-17시간 수면
        sleepQuality: 'fair',
        autoSoothings: 4,
        nightWakings: 5, // 밤에 자주 깨어남
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        babyId: 1,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '22:30',
        wakeTime: '07:00',
        sleepHours: 15.5,
        sleepQuality: 'poor', // 신생아는 수면 패턴이 불규칙
        autoSoothings: 6,
        nightWakings: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        babyId: 1,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '20:15',
        wakeTime: '05:45',
        sleepHours: 17.0,
        sleepQuality: 'fair',
        autoSoothings: 5,
        nightWakings: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        babyId: 1,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '21:45',
        wakeTime: '06:15',
        sleepHours: 16.0,
        sleepQuality: 'good',
        autoSoothings: 3,
        nightWakings: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        babyId: 1,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '23:00',
        wakeTime: '07:30',
        sleepHours: 15.8,
        sleepQuality: 'fair',
        autoSoothings: 7,
        nightWakings: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        babyId: 1,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '20:30',
        wakeTime: '06:00',
        sleepHours: 16.8,
        sleepQuality: 'good',
        autoSoothings: 4,
        nightWakings: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '7',
        babyId: 1,
        date: new Date().toISOString().split('T')[0],
        bedTime: '21:30',
        wakeTime: '06:45',
        sleepHours: 16.2, // 오늘 수면시간
        sleepQuality: 'fair',
        autoSoothings: 5,
        nightWakings: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // 신생아 통계 데이터
    const dummyStats: SleepStatistics = {
      totalRecords: 7,
      averageSleepHours: 16.1, // 신생아 평균 수면시간
      averageBedTime: '21:15', // 취침 시간도 다양함
      averageWakeTime: '06:30',
      sleepQualityDistribution: {
        good: 2,
        fair: 4,
        poor: 1 // 신생아는 수면의 질이 불안정
      },
      totalAutoSoothings: 34, // 자주 진정 필요
      averageNightWakings: 5.7, // 밤에 자주 깨어남
      sleepTrend: 'improving', // 점차 개선되는 중
      period: 7
    };

    // 신생아 예측 데이터
    const dummyPrediction: SleepPrediction = {
      nextSleepTime: '21:00',
      sleepDuration: 16, // 16시간 수면 예상
      confidence: 65, // 신생아는 예측이 어려움
      factors: ['불규칙한 수면 패턴', '수유 주기', '신생아 특성'],
      recommendations: [
        '2-3시간마다 수유 준비하기', 
        '낮밤 구분을 위해 낮에는 밝게, 밤에는 어둡게',
        '아기가 졸린 신호를 보이면 바로 재우기',
        '완전히 잠들기 전에 침대에 눕히기'
      ],
      analysisDate: new Date().toISOString(),
      basedOnDays: 7
    };

    setSleepData(dummyData);
    setStatistics(dummyStats);
    setPrediction(dummyPrediction);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  // const getTimeProgress = () => {
  //   const now = new Date();
  //   const hours = now.getHours();
  //   const minutes = now.getMinutes();
  //   const totalMinutes = hours * 60 + minutes;
  //   return (totalMinutes / (24 * 60)) * 100;
  // };

  // const getCurrentPeriod = () => {
  //   const hour = new Date().getHours();
  //   if (hour >= 6 && hour < 18) return 'day';
  //   if (hour >= 18 && hour < 22) return 'evening';
  //   return 'night';
  // };

  // 안전한 계산을 위한 헬퍼 함수들
  const todayData = sleepData.find(data => data.date === selectedDate.toISOString().split('T')[0]);
  const weekAverage = sleepData.length > 0 
    ? sleepData.reduce((sum, data) => sum + data.sleepHours, 0) / sleepData.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="space-y-6 pb-20 px-4 pt-6">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">수면 분석</h1>
          <div className="p-2 bg-blue-100 rounded-xl">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-sm text-slate-600">Sleep Analysis</p>
            </div>
            
            <button 
              onClick={() => navigateDate('next')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              disabled={selectedDate >= new Date()}
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* 신생아 수면 패턴 원형 차트 */}
          <div className="relative w-80 h-80 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* 배경 원 (회색) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
              />

              
              {/* 신생아 수면 패턴 (2-3시간 간격으로 반복) */}
              {todayData && (
                <>
                  {/* 24시간을 8개 구간으로 나누어 수면/깨어있음 패턴 표시 */}
                  {[
                    { start: 0, duration: 2.5, type: 'sleep' },    // 00:00-02:30 수면
                    { start: 2.5, duration: 0.5, type: 'awake' },  // 02:30-03:00 수유
                    { start: 3, duration: 2.5, type: 'sleep' },    // 03:00-05:30 수면
                    { start: 5.5, duration: 0.5, type: 'awake' },  // 05:30-06:00 수유
                    { start: 6, duration: 2, type: 'sleep' },      // 06:00-08:00 수면
                    { start: 8, duration: 1, type: 'awake' },      // 08:00-09:00 깨어있음
                    { start: 9, duration: 2, type: 'sleep' },      // 09:00-11:00 낮잠
                    { start: 11, duration: 0.5, type: 'awake' },   // 11:00-11:30 수유
                    { start: 11.5, duration: 2, type: 'sleep' },   // 11:30-13:30 낮잠
                    { start: 13.5, duration: 1, type: 'awake' },   // 13:30-14:30 깨어있음
                    { start: 14.5, duration: 1.5, type: 'sleep' }, // 14:30-16:00 낮잠
                    { start: 16, duration: 1, type: 'awake' },     // 16:00-17:00 깨어있음
                    { start: 17, duration: 2, type: 'sleep' },     // 17:00-19:00 저녁잠
                    { start: 19, duration: 0.5, type: 'awake' },   // 19:00-19:30 수유
                    { start: 19.5, duration: 1, type: 'sleep' },   // 19:30-20:30 수면
                    { start: 20.5, duration: 0.5, type: 'awake' }, // 20:30-21:00 수유
                    { start: 21, duration: 3, type: 'sleep' },     // 21:00-24:00 밤 수면
                  ].map((period, index) => {
                    const circumference = 2 * Math.PI * 80; // 원 둘레
                    const totalHours = 24;
                    const startOffset = (period.start / totalHours) * circumference;
                    const arcLength = (period.duration / totalHours) * circumference;
                    
                    return (
                      <circle
                        key={index}
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={period.type === 'sleep' ? '#f472b6' : '#facc15'}
                        strokeWidth="16"
                        strokeDasharray={`${arcLength} ${circumference}`}
                        strokeDashoffset={-startOffset + circumference / 4} // 12시부터 시작하도록 조정
                        opacity="0.9"
                      />
                    );
                  })}
                </>
              )}
            </svg>

            {/* 중앙 아기 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">😴</div>
                <div className="text-xs text-slate-600 font-medium">
                  신생아 수면
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  2-3시간 주기
                </div>
              </div>
            </div>

            {/* 시간 레이블들 */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="text-sm font-semibold text-slate-700">12 AM</div>
            </div>
            <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2">
              <div className="text-sm font-semibold text-slate-700">6 AM</div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
              <div className="text-sm font-semibold text-slate-700">12 PM</div>
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2">
              <div className="text-sm font-semibold text-slate-700">6 PM</div>
            </div>
          </div>

          {/* 범례 */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-400 rounded-full opacity-80"></div>
              <span className="text-slate-600">수면</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-80"></div>
              <span className="text-slate-600">깨어있음</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">현재시간</span>
            </div>
          </div>
        </div>

        {/* 수면 통계 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">총 수면시간</p>
                <p className="text-2xl font-bold text-slate-900">
                  {todayData ? `${todayData.sleepHours.toFixed(1)}h` : 
                   statistics ? `${statistics.averageSleepHours.toFixed(1)}h` : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {todayData && weekAverage > 0 && todayData.sleepHours > weekAverage ? (
                <>
                  <ArrowUp className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">평균보다 좋음</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3 h-3 text-orange-600" />
                  <span className="text-orange-600">평균보다 부족</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <TrendingUp className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">주간 평균</p>
                <p className="text-2xl font-bold text-slate-900">
                  {statistics ? `${statistics.averageSleepHours.toFixed(1)}h` : 
                   weekAverage > 0 ? `${weekAverage.toFixed(1)}h` : '—'}
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              지난 {statistics?.period || 7}일간 평균
            </div>
          </div>
        </div>

        {/* 간소화된 수면 예측 */}
        {prediction && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500 rounded-xl">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900">수면 예측</h3>
                <p className="text-sm text-indigo-700">AI 기반 분석 결과</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-sm text-indigo-700 mb-1">다음 수면</p>
                  <p className="text-xl font-bold text-indigo-900">
                    {prediction.nextSleepTime}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-sm text-indigo-700 mb-1">예상 시간</p>
                  <p className="text-xl font-bold text-indigo-900">
                    {prediction.sleepDuration}시간
                  </p>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-indigo-700">정확도</p>
                  <span className="text-sm font-semibold text-indigo-900">
                    {prediction.confidence}%
                  </span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
              </div>
              
      {prediction.recommendations && prediction.recommendations.length > 0 && (
        <div className="bg-white/80 rounded-xl p-4">
          <p className="text-sm text-indigo-700 mb-2">추천사항</p>
          <ul className="space-y-1">
            {prediction.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-center gap-2 text-xs text-indigo-800">
                <Lightbulb className="w-3 h-3 text-indigo-500" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}

        {/* 수면 교육 섹션 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">수면 교육</h3>
                <p className="text-sm text-slate-600">검증된 수면 훈련 방법을 알아보세요</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* 카드 네비게이션 */}
            <div className="flex gap-2 mb-4">
              {sleepEducationMethods.map((method, index) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(index)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedMethod === index
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {method.name}
                </button>
              ))}
            </div>

            {/* 선택된 카드 내용 */}
            <div className={`bg-gradient-to-r ${sleepEducationMethods[selectedMethod].color} rounded-2xl border ${sleepEducationMethods[selectedMethod].borderColor} p-6 shadow-sm`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  {sleepEducationMethods[selectedMethod].icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-900 mb-1">
                    {sleepEducationMethods[selectedMethod].name}
                  </h4>
                  <p className="text-sm text-slate-700 font-medium mb-2">
                    {sleepEducationMethods[selectedMethod].subtitle}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {sleepEducationMethods[selectedMethod].description}
                  </p>
                </div>
              </div>

              <div className="bg-white/70 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-800 font-medium">
                  {sleepEducationMethods[selectedMethod].method}
                </p>
              </div>

              {/* 각 방법별 상세 정보 */}
              {selectedMethod === 0 && sleepEducationMethods[0].schedule && (
                <div className="bg-white/70 rounded-xl p-4 mb-4">
                  <h5 className="font-medium text-slate-900 mb-2">단계별 시간표</h5>
                  <div className="space-y-2">
                    {Object.entries(sleepEducationMethods[0].schedule).map(([day, times]) => (
                      <div key={day} className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-slate-700 w-12">{day}:</span>
                        {Object.entries(times).map(([time, duration]) => (
                          <span key={time} className="bg-white px-2 py-1 rounded text-xs">
                            {time} → {duration}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 1 && sleepEducationMethods[1].techniques && (
                <div className="grid grid-cols-1 gap-2">
                  {sleepEducationMethods[1].techniques.map((technique, index) => (
                    <div key={index} className="bg-white/70 rounded-lg p-3 text-sm text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        {technique}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedMethod === 2 && sleepEducationMethods[2].steps && (
                <div className="grid grid-cols-1 gap-2">
                  {sleepEducationMethods[2].steps.map((step, index) => (
                    <div key={index} className="bg-white/70 rounded-lg p-3 text-sm text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}