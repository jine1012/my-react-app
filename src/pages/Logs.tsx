import React, { useState, useEffect } from "react";
import { Clock, Baby, Thermometer, NotebookPen, Search, TrendingUp, MoreVertical, X, BarChart3, PieChart } from "lucide-react";

interface LogItem {
  id: number;
  type: "cry" | "temp" | "note";
  timestamp: string;
  message: string;
}

type LogFilterType = LogItem["type"] | "all";

const sampleLogs: LogItem[] = [
  { id: 1, type: "cry", timestamp: "2025-08-13 10:30", message: "아기가 울음" },
  { id: 2, type: "temp", timestamp: "2025-08-13 11:00", message: "온도 26°C" },
  { id: 3, type: "note", timestamp: "2025-08-13 12:00", message: "분유 먹임" },
  { id: 4, type: "cry", timestamp: "2025-08-13 13:20", message: "아기가 울음" },
  { id: 5, type: "note", timestamp: "2025-08-13 14:15", message: "기저귀 교체" },
  { id: 6, type: "temp", timestamp: "2025-08-13 15:30", message: "온도 24°C" },
  { id: 7, type: "cry", timestamp: "2025-08-13 16:45", message: "아기가 울음" },
  { id: 8, type: "note", timestamp: "2025-08-13 17:20", message: "놀이 시간" },
];

export default function Logs() {
  const [type, setType] = useState<LogFilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [newLogType, setNewLogType] = useState<LogItem["type"]>("note");
  const [newLogMessage, setNewLogMessage] = useState("");

  useEffect(() => {
    // 실제 localStorage에서 로그 불러오기
    const stored = localStorage.getItem("baby-logs");
    if (stored) {
      try {
        const parsedLogs = JSON.parse(stored);
        setLogs(parsedLogs);
      } catch {
        console.error("Failed to parse logs");
        setLogs(sampleLogs); // 오류 시 샘플 데이터 사용
      }
    } else {
      setLogs(sampleLogs); // localStorage에 데이터가 없으면 샘플 데이터 사용
    }
  }, []);

  const addNewLog = () => {
    if (!newLogMessage.trim()) return;

    const newLog: LogItem = {
      id: Date.now(),
      type: newLogType,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      message: newLogMessage.trim()
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    
    // localStorage에 저장
    localStorage.setItem("baby-logs", JSON.stringify(updatedLogs));
    
    // 폼 초기화
    setNewLogMessage("");
    setNewLogType("note");
    setShowAddModal(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = type === "all" || log.type === type;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getLogIcon = (logType: LogItem["type"]) => {
    switch (logType) {
      case "cry": return <Baby className="w-4 h-4 text-rose-600" />;
      case "temp": return <Thermometer className="w-4 h-4 text-blue-600" />;
      case "note": return <NotebookPen className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getLogBadgeStyle = (logType: LogItem["type"]) => {
    switch (logType) {
      case "cry": return "bg-rose-50 text-rose-700 border-rose-200/30";
      case "temp": return "bg-blue-50 text-blue-700 border-blue-200/30";
      case "note": return "bg-emerald-50 text-emerald-700 border-emerald-200/30";
    }
  };

  const getLogTypeLabel = (logType: LogItem["type"]) => {
    switch (logType) {
      case "cry": return "울음";
      case "temp": return "온도";
      case "note": return "메모";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 통계 계산
  const cryCount = logs.filter(log => log.type === "cry").length;
  const tempCount = logs.filter(log => log.type === "temp").length;
  const noteCount = logs.filter(log => log.type === "note").length;

  // 시간대별 분석
  const getHourlyStats = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      cry: 0,
      temp: 0,
      note: 0
    }));

    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      if (hourlyData[hour]) {
        hourlyData[hour][log.type]++;
      }
    });

    return hourlyData;
  };

  // 최근 7일 통계
  const getWeeklyStats = () => {
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        cry: 0,
        temp: 0,
        note: 0
      };
    }).reverse();

    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const daysDiff = Math.floor((new Date().getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 7) {
        weekData[6 - daysDiff][log.type]++;
      }
    });

    return weekData;
  };

  const hourlyStats = getHourlyStats();
  const weeklyStats = getWeeklyStats();
  const totalLogs = logs.length;
  const avgPerDay = totalLogs > 0 ? (totalLogs / 7).toFixed(1) : '0';

  // 가장 활발한 시간대
  const mostActiveHour = hourlyStats.reduce((max, current, index) => {
    const currentTotal = current.cry + current.temp + current.note;
    const maxTotal = hourlyStats[max].cry + hourlyStats[max].temp + hourlyStats[max].note;
    return currentTotal > maxTotal ? index : max;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="space-y-6 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">활동 로그</h1>
            <p className="text-slate-600 mt-1">아기의 일상을 한눈에 확인하세요</p>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* 검색 & 필터 섹션 */}
        <div className="space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="활동 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 placeholder-slate-400 text-slate-900 shadow-sm"
            />
          </div>

          {/* 필터 태그들 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: "all", label: "전체", count: logs.length },
              { value: "cry", label: "울음", count: cryCount },
              { value: "temp", label: "온도", count: tempCount },
              { value: "note", label: "메모", count: noteCount }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setType(filter.value as LogFilterType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  type === filter.value
                    ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  type === filter.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-rose-50 rounded-xl">
                <Baby className="w-6 h-6 text-rose-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{cryCount}</div>
                <div className="text-sm text-slate-500">울음</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Thermometer className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{tempCount}</div>
                <div className="text-sm text-slate-500">온도</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <NotebookPen className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{noteCount}</div>
                <div className="text-sm text-slate-500">메모</div>
              </div>
            </div>
          </div>
        </div>

        {/* 로그 리스트 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">
              최근 활동 ({filteredLogs.length})
            </h3>
          </div>

          {filteredLogs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="p-6 hover:bg-slate-50/50 transition-colors group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* 아이콘 & 타임라인 */}
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors shadow-sm">
                        {getLogIcon(log.type)}
                      </div>
                      {index < filteredLogs.length - 1 && (
                        <div className="w-px h-6 bg-slate-200 mt-4"></div>
                      )}
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 leading-relaxed">
                            {log.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-slate-500">
                              {formatDate(log.timestamp)}
                            </span>
                            <span className="text-sm text-slate-400">
                              {formatTime(log.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* 타입 배지 */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLogBadgeStyle(log.type)}`}>
                          {getLogTypeLabel(log.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">로그가 없습니다</h4>
              <p className="text-slate-500">
                {searchTerm ? '검색 조건에 맞는 활동을 찾을 수 없어요' : '아직 기록된 활동이 없습니다'}
              </p>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-3 p-4 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl font-medium shadow-lg shadow-amber-700/25 hover:shadow-xl hover:shadow-amber-700/30 transition-all"
          >
            <NotebookPen className="w-5 h-5" />
            새 메모 추가
          </button>
          
          <button 
            onClick={() => setShowStatsModal(true)}
            className="flex items-center justify-center gap-3 p-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-medium transition-all hover:shadow-lg"
          >
            <TrendingUp className="w-5 h-5" />
            통계 보기
          </button>
        </div>

        {/* 새 메모 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">새 활동 기록</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 타입 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    활동 타입
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "note", label: "메모", icon: NotebookPen, color: "emerald" },
                      { value: "cry", label: "울음", icon: Baby, color: "rose" },
                      { value: "temp", label: "온도", icon: Thermometer, color: "blue" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setNewLogType(option.value as LogItem["type"])}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          newLogType === option.value
                            ? `bg-${option.color}-50 border-${option.color}-200 text-${option.color}-700`
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 메시지 입력 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    내용
                  </label>
                  <textarea
                    value={newLogMessage}
                    onChange={(e) => setNewLogMessage(e.target.value)}
                    placeholder="활동 내용을 입력하세요..."
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
                    rows={3}
                  />
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={addNewLog}
                    disabled={!newLogMessage.trim()}
                    className="flex-1 p-3 bg-amber-700 hover:bg-amber-800 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통계 보기 모달 */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">활동 통계</h3>
                    <p className="text-sm text-slate-600">최근 7일간의 활동 분석</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 전체 통계 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-slate-900">{totalLogs}</div>
                    <div className="text-sm text-slate-600">전체 활동</div>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-rose-700">{cryCount}</div>
                    <div className="text-sm text-rose-600">울음</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-700">{tempCount}</div>
                    <div className="text-sm text-blue-600">온도 체크</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-emerald-700">{noteCount}</div>
                    <div className="text-sm text-emerald-600">메모</div>
                  </div>
                </div>

                {/* 인사이트 */}
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">📊 주요 인사이트</h4>
                  <div className="space-y-1 text-sm text-amber-800">
                    <p>• 하루 평균 {avgPerDay}개의 활동이 기록되었어요</p>
                    <p>• 가장 활발한 시간대는 {mostActiveHour}시입니다</p>
                    <p>• {cryCount > noteCount ? '울음' : noteCount > tempCount ? '메모' : '온도 체크'}이 가장 많이 기록되었어요</p>
                  </div>
                </div>

                {/* 최근 7일 차트 */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    최근 7일 활동
                  </h4>
                  <div className="space-y-3">
                    {weeklyStats.map((day, index) => {
                      const dayTotal = day.cry + day.temp + day.note;
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-16 text-sm text-slate-600 font-medium">{day.date}</div>
                          <div className="flex-1 flex items-center gap-1">
                            <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden flex">
                              {dayTotal > 0 && (
                                <>
                                  <div 
                                    className="bg-rose-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                    style={{ width: `${(day.cry / dayTotal) * 100}%` }}
                                  >
                                    {day.cry > 0 && day.cry}
                                  </div>
                                  <div 
                                    className="bg-blue-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                    style={{ width: `${(day.temp / dayTotal) * 100}%` }}
                                  >
                                    {day.temp > 0 && day.temp}
                                  </div>
                                  <div 
                                    className="bg-emerald-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                    style={{ width: `${(day.note / dayTotal) * 100}%` }}
                                  >
                                    {day.note > 0 && day.note}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="w-8 text-sm text-slate-600 text-right">{dayTotal}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 시간대별 패턴 */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    시간대별 활동 패턴
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {hourlyStats.map((hour, index) => {
                      const hourTotal = hour.cry + hour.temp + hour.note;
                      const maxHourTotal = Math.max(...hourlyStats.map(h => h.cry + h.temp + h.note));
                      const intensity = maxHourTotal > 0 ? (hourTotal / maxHourTotal) : 0;
                      return (
                        <div key={index} className="text-center">
                          <div 
                            className={`w-full h-12 rounded-lg mb-1 flex items-end justify-center text-xs font-medium ${
                              intensity > 0.7 ? 'bg-amber-500 text-white' :
                              intensity > 0.4 ? 'bg-amber-300 text-amber-800' :
                              intensity > 0.1 ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {hourTotal > 0 && hourTotal}
                          </div>
                          <div className="text-xs text-slate-500">{index}시</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 범례 */}
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400 rounded"></div>
                    <span className="text-slate-600">울음</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    <span className="text-slate-600">온도</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                    <span className="text-slate-600">메모</span>
                  </div>
                </div>

                {/* 닫기 버튼 */}
                <div className="pt-4">
                  <button
                    onClick={() => setShowStatsModal(false)}
                    className="w-full p-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-medium transition-colors"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
