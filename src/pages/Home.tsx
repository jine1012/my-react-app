// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Thermometer, 
  Droplets, 
  Play, 
  NotebookPen, 
  List, 
  Sparkles,
  Baby,
  AlertTriangle,
  Wifi,
  WifiOff,
  Activity
} from "lucide-react";

interface LogEntry {
  id: number;
  ts: string;
  type: string;
  msg: string;
}

interface SensorData {
  roomTemperature: number;
  humidity: number;
  babyTemperature: number;
  timestamp: string;
  jetsonConnected: boolean;
}

export default function Home() {
  const [logs] = useState<LogEntry[]>(() => {
    const stored = localStorage.getItem("baby-logs");
    return stored ? JSON.parse(stored) : [];
  });

  const [sensorData, setSensorData] = useState<SensorData>({
    roomTemperature: 23.2,
    humidity: 48,
    babyTemperature: 36.8,
    timestamp: new Date().toISOString(),
    jetsonConnected: false
  });

  const last = logs.length > 0 ? logs[logs.length - 1] : null;

  // 젯슨나노 연결 상태 및 센서 데이터 실시간 업데이트
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        // 젯슨나노 연결 상태 확인
        const statusResponse = await fetch('/api/jetson/status');
        const statusData = await statusResponse.json();
        
        // 센서 데이터 가져오기
        const sensorResponse = await fetch('/api/sensors/data');
        const newSensorData = await sensorResponse.json();
        
        setSensorData({
          roomTemperature: newSensorData.roomTemperature || 23.2,
          humidity: newSensorData.humidity || 48,
          babyTemperature: newSensorData.babyTemperature || 36.8,
          timestamp: new Date().toISOString(),
          jetsonConnected: statusData.connected || false
        });
      } catch (error) {
        console.error('센서 데이터 가져오기 실패:', error);
        // 연결 실패 시 시뮬레이션 데이터
        setSensorData(prev => ({
          roomTemperature: parseFloat((20 + Math.random() * 6).toFixed(1)),
          humidity: Math.floor(40 + Math.random() * 30),
          babyTemperature: parseFloat((36.0 + Math.random() * 2.5).toFixed(1)),
          timestamp: new Date().toISOString(),
          jetsonConnected: false
        }));
      }
    };

    // 초기 데이터 로드
    fetchSensorData();
    
    // 3초마다 업데이트
    const interval = setInterval(fetchSensorData, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // 체온 상태 판단 함수
  const getTemperatureStatus = (temp: number) => {
    if (temp < 36.0) return { 
      status: '저체온', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      ringColor: 'ring-blue-200',
      alertLevel: 'warning'
    };
    if (temp <= 37.5) return { 
      status: '정상', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      ringColor: 'ring-green-200',
      alertLevel: 'normal'
    };
    if (temp <= 38.0) return { 
      status: '미열', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      ringColor: 'ring-yellow-200',
      alertLevel: 'warning'
    };
    return { 
      status: '고열', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      ringColor: 'ring-red-200',
      alertLevel: 'danger'
    };
  };

  const tempStatus = getTemperatureStatus(sensorData.babyTemperature);

  return (
    <div className="mobile-home">
      {/* 메인 히어로 카드 */}
      <div className="home-hero-card">
        {/* 헤더 */}
        <div className="hero-header">
          <div className="hero-badge">
            <Sparkles className="badge-icon" />
            Baby Love
          </div>
          <h1 className="hero-title">
            사랑스러운<br />
            <span className="hero-title-highlight">우리 아기</span>
          </h1>
          <p className="hero-subtitle">
            ✨<br />
            오늘 하루의 활동을 보여드릴게요.
          </p>
        </div>

        {/* 이미지 영역 */}
        <div className="hero-image-container">
          <div className="hero-image-wrapper">
            <div className="image-ring"></div>
            <img 
              className="hero-image" 
              src="/happy-baby.webp" 
              alt="Happy Baby"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.parentElement?.querySelector('.placeholder') as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            <div className="placeholder" style={{ display: 'none', width: '160px', height: '160px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
              👶
            </div>
            <div className="floating-icon floating-heart">
              <span className="icon-sm">❤️</span>
            </div>
            <div className="floating-icon floating-sparkle">
              <span className="icon-sm">✨</span>
            </div>
          </div>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="flex gap-3 justify-center">
          <Link
            to="/live"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 rounded-2xl px-4 py-3 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Play className="w-5 h-5 text-white" />
            <span className="font-medium text-white text-sm">라이브</span>
          </Link>
          <Link
            to="/diary"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-800 hover:to-amber-800 rounded-2xl px-4 py-3 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <NotebookPen className="w-5 h-5 text-white" />
            <span className="font-medium text-white text-sm">일기</span>
          </Link>
          <Link
            to="/logs"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800 rounded-2xl px-4 py-3 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <List className="w-5 h-5 text-white" />
            <span className="font-medium text-white text-sm">로그</span>
          </Link>
        </div>
      </div>

      {/* 젯슨나노 연결 상태 */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-200/50 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${sensorData.jetsonConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <h3 className="font-semibold text-stone-800">젯슨나노 상태</h3>
          </div>
          <div className="flex items-center gap-2">
            {sensorData.jetsonConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">연결됨</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">연결 끊김</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 상태 요약 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-200/50 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <h3 className="font-semibold text-stone-800">상태 요약</h3>
        </div>
        <div>
          {last ? (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-sm text-stone-600">
                마지막 이벤트 · {new Date(last.ts).toLocaleTimeString()} ·{" "}
                <span className="font-medium text-stone-800">{last.type}</span> · {last.msg}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-amber-600/70">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">최근 이벤트가 없습니다.</span>
            </div>
          )}
        </div>
      </div>

      {/* 환경 정보 카드들 - 기존 2개 + 아기 체온 추가 */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* 첫 번째 줄: 환경 센서 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-2xl font-bold text-stone-800">{sensorData.roomTemperature}°C</span>
            </div>
            <p className="text-sm font-medium text-stone-600">실내 온도</p>
            <div className="mt-2">
              <div className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                적정 온도
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-amber-200/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-stone-800">{sensorData.humidity}%</span>
            </div>
            <p className="text-sm font-medium text-stone-600">실내 습도</p>
            <div className="mt-2">
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                sensorData.humidity < 40 ? 'bg-orange-100 text-orange-700' :
                sensorData.humidity <= 60 ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {sensorData.humidity < 40 ? '건조' : sensorData.humidity <= 60 ? '적정 습도' : '습함'}
              </div>
            </div>
          </div>
        </div>

        {/* 두 번째 줄: 아기 체온 (강조된 큰 카드) */}
        <div className={`bg-white rounded-2xl shadow-sm border p-6 ring-2 ${tempStatus.ringColor} ${
          tempStatus.alertLevel === 'danger' ? 'border-red-200 animate-pulse' : 'border-amber-200/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tempStatus.bgColor}`}>
                <Baby className={`w-7 h-7 ${tempStatus.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-lg">아기 체온</h3>
                <p className="text-sm text-stone-600">적외선 센서</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${tempStatus.color}`}>
                {sensorData.babyTemperature.toFixed(1)}°C
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${tempStatus.bgColor} ${tempStatus.color}`}>
                {tempStatus.status}
              </div>
            </div>
          </div>

          {/* 체온 상태에 따른 알림 */}
          {tempStatus.alertLevel === 'danger' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">주의가 필요합니다</p>
                <p className="text-xs text-red-600">체온이 정상 범위를 벗어났습니다. 의료진과 상담을 권장합니다.</p>
              </div>
            </div>
          )}

          {tempStatus.alertLevel === 'warning' && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <Activity className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">관찰이 필요합니다</p>
                <p className="text-xs text-yellow-600">체온 변화를 지속적으로 모니터링하세요.</p>
              </div>
            </div>
          )}

          {tempStatus.alertLevel === 'normal' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <Sparkles className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">정상 체온 범위입니다. 건강한 상태를 유지하고 있어요! 👶✨</p>
            </div>
          )}

          {/* 업데이트 시간 */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-500 text-center">
              마지막 업데이트: {new Date(sensorData.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}