// src/pages/SleepAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Calendar, ChevronLeft, ChevronRight, TrendingUp, Baby, ArrowUp, ArrowDown, Lightbulb, RefreshCw } from 'lucide-react';
import { 
  getSleepQualityColor,
  getSleepQualityText,
  formatTime,
  type SleepRecord,
  type SleepStatistics,
  type SleepPrediction
} from '../services/sleepService';

export default function SleepAnalysis() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sleepData, setSleepData] = useState<SleepRecord[]>([]);
  const [statistics, setStatistics] = useState<SleepStatistics | null>(null);
  const [prediction, setPrediction] = useState<SleepPrediction | null>(null);


  // 더미 데이터로 초기화
  useEffect(() => {
    // 더미 수면 데이터 생성
    const dummyData: SleepRecord[] = [
      {
        id: '1',
        babyId: 1,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '20:00',
        wakeTime: '06:00',
        sleepHours: 10,
        sleepQuality: 'good',
        autoSoothings: 1,
        nightWakings: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        babyId: 1,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '19:30',
        wakeTime: '05:30',
        sleepHours: 9.5,
        sleepQuality: 'fair',
        autoSoothings: 2,
        nightWakings: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        babyId: 1,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '20:30',
        wakeTime: '06:30',
        sleepHours: 10,
        sleepQuality: 'good',
        autoSoothings: 0,
        nightWakings: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        babyId: 1,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '19:00',
        wakeTime: '05:00',
        sleepHours: 10,
        sleepQuality: 'good',
        autoSoothings: 1,
        nightWakings: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        babyId: 1,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '20:00',
        wakeTime: '06:00',
        sleepHours: 10,
        sleepQuality: 'good',
        autoSoothings: 0,
        nightWakings: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        babyId: 1,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bedTime: '19:30',
        wakeTime: '05:30',
        sleepHours: 9.5,
        sleepQuality: 'fair',
        autoSoothings: 2,
        nightWakings: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '7',
        babyId: 1,
        date: new Date().toISOString().split('T')[0],
        bedTime: '20:00',
        wakeTime: '06:00',
        sleepHours: 10,
        sleepQuality: 'good',
        autoSoothings: 1,
        nightWakings: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // 더미 통계 데이터
    const dummyStats: SleepStatistics = {
      totalRecords: 7,
      averageSleepHours: 9.9,
      averageBedTime: '19:45',
      averageWakeTime: '05:45',
      sleepQualityDistribution: {
        good: 5,
        fair: 2,
        poor: 0
      },
      totalAutoSoothings: 7,
      averageNightWakings: 2,
      sleepTrend: 'stable',
      period: 7
    };

    // 더미 예측 데이터
    const dummyPrediction: SleepPrediction = {
      nextSleepTime: '20:00',
      sleepDuration: 10,
      confidence: 85,
      factors: ['규칙적인 수면 패턴', '적절한 수면 환경', '일정한 취침 시간'],
      recommendations: ['저녁 7시부터는 조용한 활동만 하기', '수면 전 따뜻한 목욕', '방을 어둡고 조용하게 유지'],
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

  const getTimeProgress = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / (24 * 60)) * 100;
  };

  const getCurrentPeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) return 'day';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  // 안전한 계산을 위한 헬퍼 함수들
  const todayData = sleepData.find(data => data.date === selectedDate.toISOString().split('T')[0]);
  const weekAverage = sleepData.length > 0 
    ? sleepData.reduce((sum, data) => sum + data.sleepHours, 0) / sleepData.length 
    : 0;

  return (
    <div className="mobile-home">
      {/* 새로고침 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">수면 분석</h1>
        <div className="p-2 bg-blue-100 rounded-xl">
          <RefreshCw className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* 날짜 네비게이션 */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-6 shadow-sm">
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

        {/* 시간 원형 차트 */}
        <div className="relative mx-auto w-96 h-96 mb-6 overflow-hidden">
          {/* 외곽 원 */}
          <svg className="absolute inset-4 w-80 h-80 transform -rotate-90" viewBox="0 0 320 320">
            {/* 배경 원 */}
            <circle
              cx="160"
              cy="160"
              r="120"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="20"
            />
            
            {/* 시간 표시선들 */}
            {Array.from({ length: 24 }, (_, i) => {
              const angle = (i * 15) - 90; // 15도씩 (360/24)
              const x1 = 160 + 110 * Math.cos(angle * Math.PI / 180);
              const y1 = 160 + 110 * Math.sin(angle * Math.PI / 180);
              const x2 = 160 + (i % 6 === 0 ? 95 : 100) * Math.cos(angle * Math.PI / 180);
              const y2 = 160 + (i % 6 === 0 ? 95 : 100) * Math.sin(angle * Math.PI / 180);
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 6 === 0 ? "#64748b" : "#cbd5e1"}
                  strokeWidth={i % 6 === 0 ? "2" : "1"}
                />
              );
            })}

            {/* 수면 시간 호 (밤 8시 ~ 아침 7시) */}
            <circle
              cx="160"
              cy="160"
              r="120"
              fill="none"
              stroke="#f87171"
              strokeWidth="20"
              strokeDasharray={`${(11 / 24) * 754} ${754 - (11 / 24) * 754}`}
              strokeDashoffset={-((20 / 24) * 754)}
              opacity="0.8"
            />

            {/* 깨어있는 시간 호 */}
            <circle
              cx="160"
              cy="160"
              r="120"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="20"
              strokeDasharray={`${(11 / 24) * 754} ${754 - (11 / 24) * 754}`}
              strokeDashoffset={-((7 / 24) * 754)}
              opacity="0.8"
            />

            {/* 현재 시간 표시 */}
            <circle
              cx="160"
              cy="160"
              r="120"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="2 752"
              strokeDashoffset={-((getTimeProgress() / 100) * 754)}
            />
          </svg>

          {/* 중앙 정보 - SVG와 같은 위치에 정렬 */}
          <div className="absolute inset-4 w-80 h-80 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="mb-2">
                <Baby className="w-12 h-12 text-amber-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {new Date().toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </h3>
              <p className="text-sm text-slate-600 capitalize">
                {getCurrentPeriod() === 'day' ? '활동시간' : 
                 getCurrentPeriod() === 'evening' ? '저녁시간' : '수면시간'}
              </p>
            </div>
          </div>

          {/* 시간 레이블들 */}
          {[
            { hour: 6, label: '6 AM' },
            { hour: 12, label: '12 PM' },
            { hour: 18, label: '6 PM' },
            { hour: 0, label: '12 AM' }
          ].map(({ hour, label }) => {
            const angle = (hour * 15) - 90;
            const radius = 140; // 레이블을 위한 반지름
            const x = 192 + radius * Math.cos(angle * Math.PI / 180); // 중심점 조정 (96px * 2)
            const y = 192 + radius * Math.sin(angle * Math.PI / 180);
            
            return (
              <div
                key={hour}
                className="absolute text-xs font-semibold text-slate-700 bg-white/80 px-2 py-1 rounded-md"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {label}
              </div>
            );
          })}
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
      <div className="grid grid-cols-2 gap-4 mb-6">
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

      {/* 수면 예측 */}
      {prediction && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/60 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500 rounded-xl">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">수면 예측</h3>
              <p className="text-sm text-indigo-700">AI 기반 분석 결과</p>
            </div>
          </div>

          {/* 수면 예측 내용 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-sm text-indigo-700 mb-1">다음 수면 예정</p>
                <p className="text-xl font-bold text-indigo-900">
                  {prediction.nextSleepTime}
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-sm text-indigo-700 mb-1">예상 수면시간</p>
                <p className="text-xl font-bold text-indigo-900">
                  {prediction.sleepDuration}시간
                </p>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-indigo-700">예측 정확도</p>
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

            <div className="bg-white/80 rounded-xl p-4">
              <p className="text-sm text-indigo-700 mb-2">분석 기준</p>
              <ul className="space-y-1">
                {prediction.factors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs text-indigo-800">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    {factor}
                  </li>
                ))}
              </ul>
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

      

      {/* 주간 수면 트렌드 */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-xl">
            <Calendar className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">주간 트렌드</h3>
            <p className="text-sm text-slate-600">최근 {sleepData.length}일간 수면 패턴</p>
          </div>
        </div>

                 {sleepData.length === 0 ? (
           <div className="text-center py-8 text-slate-500">
             <Moon className="w-12 h-12 mx-auto mb-3 opacity-50" />
             <p>수면 데이터가 없습니다.</p>
             <p className="text-sm">수면 기록을 추가해보세요.</p>
           </div>
         ) : (
           <div className="space-y-3">
             {sleepData.map((data) => {
               const date = new Date(data.date);
               const isToday = date.toDateString() === new Date().toDateString();
               
               return (
                 <div key={data.date} className={`p-3 rounded-xl border-2 transition-all ${
                   isToday ? 'border-amber-300 bg-amber-50' : 'border-slate-100 bg-slate-50'
                 }`}>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="text-center min-w-[60px]">
                         <p className="text-xs text-slate-600">
                           {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                         </p>
                         <p className="text-sm font-semibold text-slate-900">
                           {date.getMonth() + 1}/{date.getDate()}
                         </p>
                       </div>
                       
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <Clock className="w-4 h-4 text-slate-500" />
                           <span className="text-sm font-medium text-slate-900">
                             {data.sleepHours.toFixed(1)}h
                           </span>
                           <span className={`text-xs px-2 py-1 rounded-full ${getSleepQualityColor(data.sleepQuality)}`}>
                             {getSleepQualityText(data.sleepQuality)}
                           </span>
                         </div>
                         
                         <div className="text-xs text-slate-600">
                           {formatTime(data.bedTime)} - {formatTime(data.wakeTime)}
                           {data.autoSoothings > 0 && (
                             <span className="ml-2">• 자동진정 {data.autoSoothings}회</span>
                           )}
                         </div>
                       </div>
                     </div>
                     
                     <div className="w-16 bg-slate-200 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full ${
                           data.sleepQuality === 'good' ? 'bg-green-500' :
                           data.sleepQuality === 'fair' ? 'bg-yellow-500' :
                           'bg-red-500'
                         }`}
                         style={{ width: `${Math.min(100, (data.sleepHours / 14) * 100)}%` }}
                       ></div>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         )}
      </div>

      {/* 통계 요약 (화면 하단) */}
      {statistics && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 p-6 mt-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">수면 통계 요약</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-xs text-blue-700 mb-1">평균 취침시간</p>
              <p className="text-lg font-bold text-blue-900">{statistics.averageBedTime}</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-xs text-blue-700 mb-1">평균 기상시간</p>
              <p className="text-lg font-bold text-blue-900">{statistics.averageWakeTime}</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-xs text-blue-700 mb-1">야간 깨움</p>
              <p className="text-lg font-bold text-blue-900">{statistics.averageNightWakings.toFixed(1)}회</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3">
              <p className="text-xs text-blue-700 mb-1">자동진정</p>
              <p className="text-lg font-bold text-blue-900">{statistics.totalAutoSoothings}회</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}