import { useState, useEffect } from "react";
import { 
  Mic, 
  Brain, 
  Bed, 
  Droplets, 
  Zap,
  TrendingUp,
  Settings,
  MoreVertical,
  Volume2
} from "lucide-react";

type CryReason = "belly_pain" | "burp" | "discomfort" | "hungry" | "tired" | "cold" | "hot";

interface AnalysisResult {
  reasons: { reason: CryReason; confidence: number }[];
  timestamp: Date;
  duration: number;
  intensity: number;
}

interface SmartDevice {
  id: string;
  name: string;
  type: "bed" | "humidifier";
  status: "on" | "off";
  icon: React.ReactNode;
  action: string;
}

export default function CryAnalysis() {
  const [isListening, setIsListening] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(false); // 자동분석 상태 추가
  const [devices, setDevices] = useState<SmartDevice[]>([
    { id: "bed", name: "스마트 침대", type: "bed", status: "off", icon: <Bed className="w-5 h-5" />, action: "흔들기" },
    { id: "humidifier", name: "가습기", type: "humidifier", status: "off", icon: <Droplets className="w-5 h-5" />, action: "켜기" },
  ]);

  // Mock analysis data
  useEffect(() => {
    const mockAnalyses = [
      { 
        reasons: [
          { reason: "tired" as CryReason, confidence: 67 },
          { reason: "hungry" as CryReason, confidence: 23 },
          { reason: "discomfort" as CryReason, confidence: 8 },
          { reason: "cold" as CryReason, confidence: 2 }
        ], 
        timestamp: new Date(Date.now() - 300000), 
        duration: 45, 
        intensity: 6 
      },
      { 
        reasons: [
          { reason: "hungry" as CryReason, confidence: 82 },
          { reason: "belly_pain" as CryReason, confidence: 15 },
          { reason: "burp" as CryReason, confidence: 3 }
        ], 
        timestamp: new Date(Date.now() - 1800000), 
        duration: 120, 
        intensity: 8 
      },
      { 
        reasons: [
          { reason: "belly_pain" as CryReason, confidence: 78 },
          { reason: "discomfort" as CryReason, confidence: 15 },
          { reason: "hot" as CryReason, confidence: 7 }
        ], 
        timestamp: new Date(Date.now() - 3600000), 
        duration: 30, 
        intensity: 5 
      },
    ];
    setRecentAnalyses(mockAnalyses);
    setCurrentAnalysis(mockAnalyses[0]);
  }, []);

  const getCryReasonInfo = (reason: CryReason) => {
    const reasons: Record<CryReason, { label: string; emoji: string; color: string; description: string }> = {
      belly_pain: { label: "배앓이", emoji: "😣", color: "red", description: "배가 아픈 것 같아요" },
      burp: { label: "트림", emoji: "😮", color: "blue", description: "트림이 필요해요" },
      discomfort: { label: "불편함", emoji: "😤", color: "orange", description: "뭔가 불편한 상태예요" },
      hungry: { label: "배고픔", emoji: "🍼", color: "green", description: "수유 시간이 될 것 같아요" },
      tired: { label: "피곤함", emoji: "😴", color: "purple", description: "잠들고 싶어해요" },
      cold: { label: "추움", emoji: "🥶", color: "cyan", description: "춥다고 느끼는 것 같아요" },
      hot: { label: "더움", emoji: "🥵", color: "pink", description: "덥다고 느끼는 것 같아요" }
    };
    return reasons[reason];
  };

    const getRecommendedActions = (reasons: { reason: CryReason; confidence: number }[]) => {
    const topReason: CryReason | undefined = reasons[0]?.reason;

    // CryReason 전부를 키로 갖는 매핑
    const actions: Record<CryReason, string[]> = {
      belly_pain: ["bed"],        // 배앓이 → 스마트 침대
      burp: ["bed"],              // 트림 → 침대 흔들기
      discomfort: ["bed"],        // 불편함 → 침대
      hungry: ["bed"],            // 배고픔 → (예: 수유 알림, 기기는 임시로 bed로 연결)
      tired: ["bed"],             // 피곤함 → 침대
      cold: ["humidifier"],       // 추움 → 가습기 (습도 올리기)
      hot: ["humidifier"],        // 더움 → 가습기 OFF 등
    };

    return topReason ? actions[topReason] : [];
  };


  const toggleDevice = (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, status: device.status === "on" ? "off" : "on" }
        : device
    ));
  };

  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
        const mockResult: AnalysisResult = {
            reasons: [
                { reason: "belly_pain" as CryReason, confidence: Math.floor(Math.random() * 30) + 50 },
                { reason: "hungry" as CryReason, confidence: Math.floor(Math.random() * 20) + 15 },
                { reason: "discomfort" as CryReason, confidence: Math.floor(Math.random() * 15) + 5 },
                { reason: "tired" as CryReason, confidence: Math.floor(Math.random() * 10) + 2 },
            ].sort((a, b) => b.confidence - a.confidence),
            timestamp: new Date(),
            duration: Math.floor(Math.random() * 60) + 20,
            intensity: Math.floor(Math.random() * 5) + 4
        };
        setCurrentAnalysis(mockResult);
        setRecentAnalyses(prev => [mockResult, ...prev.slice(0, 4)]);
        setIsListening(false);
    }, 3000);
  };

  
  // 자동 울음 분석 토글
  const toggleAutoAnalysis = async () => {
    try {
      const response = await fetch('/api/cry-detection/auto-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoAnalysisEnabled })
      });
      
      if (response.ok) {
        setAutoAnalysisEnabled(!autoAnalysisEnabled);
      }
    } catch (error) {
      console.error('자동 분석 토글 실패:', error);
      // 서버 연결 실패 시에도 UI 상태 변경 (개발용)
      setAutoAnalysisEnabled(!autoAnalysisEnabled);
    }
  };

  const topReason = currentAnalysis?.reasons[0];
  const currentReason = topReason ? getCryReasonInfo(topReason.reason) : null;
  const recommendedActions = currentAnalysis ? getRecommendedActions(currentAnalysis.reasons) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="space-y-6 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">울음 분석</h1>
            <p className="text-slate-600 mt-1">AI가 아기의 울음을 분석하고 해결책을 제안해요</p>
          </div>
          <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* 🔥 자동울음분석 ON/OFF 스위치 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${autoAnalysisEnabled ? 'bg-green-100' : 'bg-slate-100'}`}>
                {autoAnalysisEnabled ? <Volume2 className="w-6 h-6 text-green-600" /> : <Mic className="w-6 h-6 text-slate-600" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">자동 울음 분석</h3>
                <p className="text-sm text-slate-600">
                  {autoAnalysisEnabled ? '울음 소리를 실시간으로 감지하고 분석합니다' : '수동으로 분석을 시작할 수 있습니다'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleAutoAnalysis}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                autoAnalysisEnabled ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                autoAnalysisEnabled ? 'translate-x-9' : 'translate-x-1'
              }`}>
              </div>
            </button>
          </div>
          
          {autoAnalysisEnabled && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">자동 분석 활성화됨 - 울음 소리를 감지 중입니다</span>
              </div>
            </div>
          )}
        </div>

        {/* 실시간 분석 카드 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">실시간 울음 분석</h3>
                <p className="text-sm text-slate-600">AI가 울음소리를 실시간으로 분석합니다</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* 분석 버튼 */}
            <div className="text-center mb-6">
              <button
                onClick={startListening}
                disabled={isListening}
                className={`relative w-24 h-24 rounded-full shadow-2xl transition-all duration-300 ${
                  isListening 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse scale-110' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105'
                }`}
              >
                <div className="absolute inset-2 bg-white/20 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                )}
              </button>
              <p className="text-sm text-slate-600 mt-3">
                {isListening ? "분석 중..." : "분석 시작"}
              </p>
            </div>

            {/* 분석 결과 */}
            {currentAnalysis && currentReason && (
              <div className="bg-gradient-to-r from-slate-50 to-amber-50/30 rounded-2xl p-6 border border-amber-200/30">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-2">{currentReason.emoji}</div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-1">{currentReason.label}</h4>
                  <p className="text-slate-600 mb-2">{currentReason.description}</p>
                  <div className="inline-flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    최고 확률 {topReason?.confidence}%
                  </div>
                </div>

                {/* 모든 분석 결과 표시 */}
                <div className="space-y-3 mb-6">
                  {currentAnalysis.reasons.map((result, index) => {
                    const reason = getCryReasonInfo(result.reason);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{reason.emoji}</div>
                          <div>
                            <div className="font-medium text-slate-900">{reason.label}</div>
                            <div className="text-sm text-slate-600">{reason.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">{result.confidence}%</div>
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                index === 0 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                index === 2 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                'bg-gradient-to-r from-slate-400 to-slate-500'
                              }`}
                              style={{ width: `${result.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 분석 상세 정보 */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{currentAnalysis.duration}초</div>
                    <div className="text-xs text-slate-600">지속 시간</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{currentAnalysis.intensity}/10</div>
                    <div className="text-xs text-slate-600">강도</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">방금</div>
                    <div className="text-xs text-slate-600">분석 시간</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 추천 액션 */}
        {recommendedActions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">추천 액션</h3>
                  <p className="text-sm text-slate-600">AI가 추천하는 해결 방법입니다</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {devices
                  .filter(device => recommendedActions.includes(device.id))
                  .map(device => (
                    <button
                      key={device.id}
                      onClick={() => toggleDevice(device.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        device.status === "on"
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          device.status === "on" ? 'bg-emerald-100' : 'bg-slate-200'
                        }`}>
                          {device.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-slate-900">{device.name}</div>
                          <div className="text-sm text-slate-600">
                            {device.status === "on" ? "작동 중" : device.action}
                          </div>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-colors ${
                        device.status === "on" ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                          device.status === "on" ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 스마트 기기 제어 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">스마트 기기 제어</h3>
                <p className="text-sm text-slate-600">연결된 기기들을 직접 제어할 수 있어요</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              {devices.map(device => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      {device.icon}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{device.name}</div>
                      <div className="text-sm text-slate-600">
                        {device.status === "on" ? "작동 중" : "대기 중"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDevice(device.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      device.status === "on"
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-amber-700 hover:bg-amber-800 text-white'
                    }`}
                  >
                    {device.status === "on" ? "끄기" : device.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 분석 기록 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">최근 분석 기록</h3>
                <p className="text-sm text-slate-600">지난 분석 결과들을 확인할 수 있어요</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {recentAnalyses.map((analysis, index) => {
                const topReason = getCryReasonInfo(analysis.reasons[0].reason);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{topReason.emoji}</div>
                      <div>
                        <div className="font-medium text-slate-900">{topReason.label}</div>
                        <div className="text-sm text-slate-600">
                          {analysis.timestamp.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">{analysis.reasons[0].confidence}%</div>
                      <div className="text-xs text-slate-600">{analysis.duration}초</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}