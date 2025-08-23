// src/pages/Live.tsx
import { useState, useEffect } from "react";
import { 
  Camera, 
  Video, 
  ShieldCheck, 
  ShieldAlert,
  Thermometer, 
  Droplets, 
  User,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Wifi,
  WifiOff
} from "lucide-react";

interface SensorData {
  temperature: number;
  humidity: number;
  babyTemp: number;
}

interface DangerDetection {
  status: 'safe' | 'danger';
  confidence: number;
  timestamp: Date;
  type?: 'suffocation' | 'position' | 'breathing';
}

export default function Live() {
  // 수면 모드 상태
  const [sleepMode, setSleepMode] = useState(false);
  const [sleepModeLoading, setSleepModeLoading] = useState(false);
  
  // 카메라 상태
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  
  // 위험 감지 상태
  const [dangerStatus, setDangerStatus] = useState<DangerDetection>({
    status: 'safe',
    confidence: 95,
    timestamp: new Date(),
  });
  
  // 센서 데이터
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 22.5,
    humidity: 45,
    babyTemp: 36.8
  });
  
  // 연결 상태
  const [jetsonConnected, setJetsonConnected] = useState(false);

  // 🔄 수면 모드 토글
  const toggleSleepMode = async () => {
    setSleepModeLoading(true);
    
    try {
      // 젯슨에 수면모드 요청 (현재는 Mock)
      const response = await fetch('/api/jetson/sleep-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !sleepMode })
      });
      
      if (response.ok) {
        setSleepMode(!sleepMode);
        // 수면모드 ON이면 카메라도 자동 켜기
        if (!sleepMode) {
          setCameraActive(true);
        }
      }
    } catch (error) {
      console.error('수면모드 토글 실패:', error);
      // 서버 연결 실패 시에도 일단 UI 상태는 변경 (개발용)
      setSleepMode(!sleepMode);
      if (!sleepMode) {
        setCameraActive(true);
      }
    } finally {
      setSleepModeLoading(false);
    }
  };

  // 📹 카메라 토글
  const toggleCamera = async () => {
    setCameraLoading(true);
    
    try {
      const response = await fetch('/api/jetson/camera/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !cameraActive })
      });
      
      if (response.ok) {
        setCameraActive(!cameraActive);
      }
    } catch (error) {
      console.error('카메라 토글 실패:', error);
      // 서버 연결 실패 시에도 UI 상태 변경 (개발용)
      setCameraActive(!cameraActive);
    } finally {
      setCameraLoading(false);
    }
  };

  // 🔍 젯슨 연결 상태 체크
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/jetson/status');
        setJetsonConnected(response.ok);
      } catch {
        setJetsonConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // 10초마다 체크
    
    return () => clearInterval(interval);
  }, []);

  // 📊 센서 데이터 업데이트
  useEffect(() => {
    const updateSensorData = async () => {
      try {
        const response = await fetch('/api/jetson/sensors');
        if (response.ok) {
          const data = await response.json();
          setSensorData(data);
        }
      } catch (error) {
        console.error('센서 데이터 업데이트 실패:', error);
        // Mock 데이터로 시뮬레이션
        setSensorData({
          temperature: 22 + Math.random() * 4, // 22-26도
          humidity: 40 + Math.random() * 20,   // 40-60%
          babyTemp: 36.2 + Math.random() * 1.2 // 36.2-37.4도
        });
      }
    };

    // 실시간 센서 데이터 업데이트 (5초마다)
    const sensorInterval = setInterval(updateSensorData, 5000);
    updateSensorData(); // 초기 데이터 로드

    return () => clearInterval(sensorInterval);
  }, []);

  // 🛡️ 위험 감지 시뮬레이션 (실제로는 젯슨에서 받아올 데이터)
  useEffect(() => {
    const simulateDangerDetection = () => {
      // 위험도를 랜덤하게 시뮬레이션 (실제로는 젯슨 AI 모델 결과)
      const randomRisk = Math.random();
      const newStatus: DangerDetection = {
        status: randomRisk > 0.85 ? 'danger' : 'safe', // 15% 확률로 위험
        confidence: Math.floor(85 + Math.random() * 15), // 85-100%
        timestamp: new Date(),
        type: randomRisk > 0.95 ? 'suffocation' : randomRisk > 0.9 ? 'position' : undefined
      };
      
      setDangerStatus(newStatus);
    };

    if (sleepMode && cameraActive) {
      const interval = setInterval(simulateDangerDetection, 3000); // 3초마다 체크
      return () => clearInterval(interval);
    }
  }, [sleepMode, cameraActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="space-y-6 pb-20 px-4 pt-6">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">실시간 모니터링</h1>
            <p className="text-slate-600 mt-1">아기의 상태를 실시간으로 확인하세요</p>
          </div>
          
          {/* 연결 상태 표시 */}
          <div className={`flex items-center gap-2 text-sm ${jetsonConnected ? 'text-green-600' : 'text-red-600'}`}>
            {jetsonConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{jetsonConnected ? '연결됨' : '연결 끊김'}</span>
          </div>
        </div>

        {/* 1. 수면모드 ON/OFF 스위치 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${sleepMode ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                {sleepMode ? <Moon className="w-6 h-6 text-indigo-600" /> : <Sun className="w-6 h-6 text-slate-600" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">수면 모드</h3>
                <p className="text-sm text-slate-600">
                  {sleepMode ? '아기가 잠들어 있어요' : '수면 감지를 시작하세요'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleSleepMode}
              disabled={sleepModeLoading}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                sleepMode ? 'bg-indigo-500' : 'bg-slate-300'
              } ${sleepModeLoading ? 'opacity-50' : ''}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                sleepMode ? 'translate-x-9' : 'translate-x-1'
              }`}>
                {sleepModeLoading && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 2. 실시간 카메라 모니터링 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${cameraActive ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {cameraActive ? <Eye className="w-5 h-5 text-green-600" /> : <EyeOff className="w-5 h-5 text-slate-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">실시간 카메라</h3>
                  <p className="text-sm text-slate-600">
                    {cameraActive ? '스트리밍 중' : sleepMode ? '수면모드에서 자동 활성화됨' : '비활성화됨'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={toggleCamera}
                disabled={cameraLoading}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  cameraActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } ${cameraLoading ? 'opacity-50' : ''}`}
              >
                {cameraLoading ? '처리 중...' : cameraActive ? '중지' : '시작'}
              </button>
            </div>
          </div>
          
          {/* 카메라 화면 영역 */}
          <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
            {cameraActive ? (
              <div className="relative w-full h-full">
                {/* 실제 환경에서는 Jetson Nano의 스트리밍 URL */}
                <img 
                  src="/api/jetson/camera/stream" 
                  alt="실시간 카메라"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 스트림 오류 시 대체 이미지 또는 플레이스홀더
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* 녹화 중 표시 */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
                
                {/* 카메라 컨트롤 */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">카메라가 비활성화되어 있습니다</p>
                <p className="text-sm">{sleepMode ? '수면모드를 켜면 자동으로 활성화됩니다' : '카메라를 켜서 모니터링을 시작하세요'}</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. 위험감지 상태 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${
              dangerStatus.status === 'safe' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {dangerStatus.status === 'safe' ? 
                <ShieldCheck className="w-6 h-6 text-green-600" /> : 
                <ShieldAlert className="w-6 h-6 text-red-600" />
              }
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">위험 감지 상태</h3>
              <p className="text-sm text-slate-600">질식감지 AI 모델이 실시간으로 분석 중</p>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${
            dangerStatus.status === 'safe' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${
                dangerStatus.status === 'safe' ? 'text-green-700' : 'text-red-700'
              }`}>
                {dangerStatus.status === 'safe' ? 'SAFE' : 'DANGER'}
              </span>
              <span className={`text-sm font-medium ${
                dangerStatus.status === 'safe' ? 'text-green-600' : 'text-red-600'
              }`}>
                신뢰도: {dangerStatus.confidence}%
              </span>
            </div>
            
            {dangerStatus.type && (
              <p className="text-sm text-red-700 mb-2">
                감지된 위험: {dangerStatus.type === 'suffocation' ? '질식 위험' : 
                           dangerStatus.type === 'position' ? '자세 이상' : '호흡 이상'}
              </p>
            )}
            
            <p className="text-xs text-slate-600">
              마지막 업데이트: {dangerStatus.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* 4. 환경 센서 정보 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">환경 센서</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {/* 실내 온도 */}
            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-xl mx-auto w-fit mb-2">
                <Thermometer className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {sensorData.temperature.toFixed(1)}°C
              </div>
              <div className="text-sm text-slate-600">실내온도</div>
            </div>
            
            {/* 실내 습도 */}
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-xl mx-auto w-fit mb-2">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {sensorData.humidity.toFixed(0)}%
              </div>
              <div className="text-sm text-slate-600">실내습도</div>
            </div>
            
            {/* 아기 체온 */}
            <div className="text-center">
              <div className={`p-3 rounded-xl mx-auto w-fit mb-2 ${
                sensorData.babyTemp > 37.5 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <User className={`w-6 h-6 ${
                  sensorData.babyTemp > 37.5 ? 'text-red-600' : 'text-green-600'
                }`} />
              </div>
              <div className={`text-2xl font-bold ${
                sensorData.babyTemp > 37.5 ? 'text-red-600' : 'text-slate-900'
              }`}>
                {sensorData.babyTemp.toFixed(1)}°C
              </div>
              <div className="text-sm text-slate-600">아기 체온</div>
              {sensorData.babyTemp > 37.5 && (
                <div className="text-xs text-red-600 mt-1">⚠️ 발열 주의</div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}