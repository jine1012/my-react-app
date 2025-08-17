// src/pages/Live.tsx
import { useState, useEffect } from "react";
import { Camera, Video, Play, Square, AlertTriangle, Mic, MicOff } from "lucide-react";

export default function Live() {
  const [detectionOn, setDetectionOn] = useState(false); // 울음 감지 ON/OFF 상태
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'starting' | 'active' | 'stopping'>('idle');
  const [lastDetectionTime, setLastDetectionTime] = useState<string | null>(null);

  // 울음 감지 토글 함수
  const toggleDetection = async () => {
    const action = detectionOn ? 'stop' : 'start';
    setDetectionStatus(detectionOn ? 'stopping' : 'starting');
    
    try {
      // Node.js 서버의 API 엔드포인트로 POST 요청 보내기
      const response = await fetch(`/api/cry-detection/${action}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDetectionOn(!detectionOn);
        setDetectionStatus(result.status === 'started' ? 'active' : 'idle');
        
        if (result.status === 'started') {
          console.log('🎵 울음 감지가 시작되었습니다.');
        } else {
          console.log('🔇 울음 감지가 중지되었습니다.');
        }
      } else {
        const error = await response.json();
        console.error("울음 감지 토글 실패:", error);
        setDetectionStatus('idle');
        alert(`울음 감지 ${action === 'start' ? '시작' : '중지'}에 실패했습니다.`);
      }
    } catch (err) {
      console.error("서버 요청 에러:", err);
      setDetectionStatus('idle');
      alert('서버와의 연결에 실패했습니다.');
    }
  };

  // 울음 감지 상태 체크 (주기적으로 서버에서 상태 확인)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/cry-detection/status');
        if (response.ok) {
          const result = await response.json();
          setDetectionOn(result.isActive);
          setDetectionStatus(result.isActive ? 'active' : 'idle');
          if (result.lastDetection) {
            setLastDetectionTime(result.lastDetection);
          }
        }
      } catch (err) {
        console.error('상태 확인 실패:', err);
      }
    };

    // 컴포넌트 마운트 시 초기 상태 확인
    checkStatus();

    // 5초마다 상태 확인
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="space-y-6 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">실시간 모니터링</h1>
          <p className="text-slate-600 mt-1">아기의 상태를 실시간으로 확인하세요</p>
        </div>

        {/* 울음 감지 상태 카드 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">울음 감지 시스템</h2>
            <div className={`flex items-center gap-2 text-sm font-medium ${
              detectionStatus === 'active' ? 'text-green-600' :
              detectionStatus === 'starting' || detectionStatus === 'stopping' ? 'text-amber-600' :
              'text-slate-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                detectionStatus === 'active' ? 'bg-green-500 animate-pulse' :
                detectionStatus === 'starting' || detectionStatus === 'stopping' ? 'bg-amber-500 animate-pulse' :
                'bg-slate-300'
              }`}></div>
              {detectionStatus === 'active' && '감지 중'}
              {detectionStatus === 'starting' && '시작 중...'}
              {detectionStatus === 'stopping' && '중지 중...'}
              {detectionStatus === 'idle' && '대기 중'}
            </div>
          </div>

          {/* 마지막 감지 시간 표시 */}
          {lastDetectionTime && (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  마지막 울음 감지: {new Date(lastDetectionTime).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* 울음 감지 버튼 */}
          <button
            onClick={toggleDetection}
            disabled={detectionStatus === 'starting' || detectionStatus === 'stopping'}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              detectionOn
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
            } ${
              (detectionStatus === 'starting' || detectionStatus === 'stopping')
                ? 'opacity-75 cursor-not-allowed'
                : ''
            }`}
          >
            {detectionOn ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            {detectionStatus === 'starting' && '시작 중...'}
            {detectionStatus === 'stopping' && '중지 중...'}
            {detectionStatus === 'active' && '울음 감지 중지'}
            {detectionStatus === 'idle' && '울음 감지 시작'}
          </button>

          <p className="text-xs text-slate-500 mt-3 text-center">
            라즈베리파이의 마이크를 통해 실시간으로 아기 울음을 감지합니다
          </p>
        </div>

        {/* 기존 빠른 동작 섹션 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">빠른 동작</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <Camera className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">스크린샷</span>
            </button>
            
            <button className="flex flex-col items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
              <Video className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">녹화 시작</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}