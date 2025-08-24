// src/pages/Live.tsx - 젯슨 나노 연동 업데이트
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Thermometer, 
  Droplets, 
  Moon, 
  Wifi,
  WifiOff,
  AlertTriangle,
  Eye,
  Shield,
  ShieldCheck,
  Clock,
  Heart,
  Activity
} from 'lucide-react';
import { useJetsonService } from '../services/jetsonService';

// VideoStream 컴포넌트 - 단일 카메라용
interface VideoStreamProps {
  streamUrl: string;
  isActive: boolean;
  onToggle: () => void;
  title: string;
}

// 유효 값으로만 좁혀주는 헬퍼
type SafetyState = 'SAFE' | 'DANGER' | 'WAITING' | 'UNKNOWN';

const toSafetyState = (v?: string): SafetyState => {
  const s = (v ?? '').trim().toUpperCase();
  switch (s) {
    case 'SAFE':
    case 'DANGER':
    case 'WAITING':
    case 'UNKNOWN':
      return s;
    default:
      return 'UNKNOWN'; // 서버 값이 이상하거나 비어있으면 기본값
  }
};


const VideoStream: React.FC<VideoStreamProps> = ({ streamUrl, isActive, onToggle, title }) => {
  const [streamError, setStreamError] = useState(false);

  return (
    <div className="bg-black rounded-xl overflow-hidden relative">
      <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        {isActive && !streamError ? (
          <img 
            src={streamUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setStreamError(true)}
            onLoad={() => setStreamError(false)}
          />
        ) : (
          <div className="text-center text-slate-400">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{streamError ? '연결 오류' : '카메라 꺼짐'}</p>
          </div>
        )}
      </div>
      
      <div className="absolute top-3 left-3">
        <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">
          {title}
        </span>
      </div>
      
      <button
        onClick={onToggle}
        className={`absolute bottom-3 right-3 p-2 rounded-full ${
          isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white transition-colors`}
      >
        <Eye className="w-4 h-4" />
      </button>
      
      {isActive && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/80 text-white px-2 py-1 rounded-full text-xs">
          <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
          LIVE
        </div>
      )}
    </div>
  );
};

// 질식감지 상태 컴포넌트
interface SafetyStatusProps {
  safetyState: 'SAFE' | 'DANGER' | 'WAITING' | 'UNKNOWN';
}


const SafetyStatus: React.FC<SafetyStatusProps> = ({ safetyState }) => {
  const getSafetyInfo = () => {
    switch (safetyState) {
      case 'SAFE':
        return {
          icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          statusText: '안전',
          description: '아기가 안전한 상태입니다.',
          statusColor: 'text-green-600'
        };
      case 'DANGER':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          statusText: '위험',
          description: '질식 위험이 감지되었습니다! 즉시 확인하세요.',
          statusColor: 'text-red-600'
        };
      case 'WAITING':
        return {
          icon: <Clock className="w-6 h-6 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          statusText: '대기 중',
          description: '수면 상태 확인 중입니다.',
          statusColor: 'text-yellow-600'
        };
      default:
        return {
          icon: <Shield className="w-6 h-6 text-gray-600" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          statusText: '알 수 없음',
          description: '상태를 확인할 수 없습니다.',
          statusColor: 'text-gray-600'
        };
    }
  };

  const safetyInfo = getSafetyInfo();

  return (
    <div className={`${safetyInfo.bgColor} ${safetyInfo.borderColor} border rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        {safetyInfo.icon}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold ${safetyInfo.textColor}`}>질식 감지</h3>
            <span className={`text-sm font-medium px-2 py-1 rounded-full bg-white ${safetyInfo.statusColor}`}>
              {safetyInfo.statusText}
            </span>
          </div>
          <p className={`text-sm ${safetyInfo.textColor} mt-1`}>{safetyInfo.description}</p>
        </div>
      </div>
    </div>
  );
};

// 센서 안전 상태 판정 함수
const getSensorSafetyStatus = (temperature?: number, humidity?: number, bodyTemperature?: number) => {
  const issues = [];
  
  // 실내 온도 체크 (적정 범위: 21-24°C)
  if (temperature !== undefined) {
    if (temperature < 18) issues.push('실내 온도가 너무 낮음');
    else if (temperature > 26) issues.push('실내 온도가 너무 높음');
  }
  
  // 습도 체크 (적정 범위: 40-60%)
  if (humidity !== undefined) {
    if (humidity < 30) issues.push('습도가 너무 낮음');
    else if (humidity > 70) issues.push('습도가 너무 높음');
  }
  
  // 체온 체크 (정상 범위: 36.0-37.5°C)
  if (bodyTemperature !== undefined) {
    if (bodyTemperature < 35.5) issues.push('체온이 너무 낮음');
    else if (bodyTemperature >= 38.0) issues.push('발열 상태');
    else if (bodyTemperature >= 37.6) issues.push('체온 상승');
  }
  
  return {
    isSafe: issues.length === 0,
    issues
  };
};

// 메인 페이지
export default function Live() {
  const { 
    jetsonService, 
    systemStatus,
    sensorData: liveSensorData,
    isConnected 
  } = useJetsonService();

  const [cameraActive, setCameraActive] = useState(false);
  const [sleepModeEnabled, setSleepModeEnabled] = useState(false);
  const [sleepDetectionActive, setSleepDetectionActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 🔥 수면 감지 모델 연동
  useEffect(() => {
    const sleepState = systemStatus?.currentState?.sleep_state;
    setSleepModeEnabled(sleepState === 'SLEEP');
  }, [systemStatus?.currentState]);

  // 카메라 제어
  const toggleCamera = async () => {
    try {
      if (cameraActive) {
        await jetsonService.stopCamera();
        setCameraActive(false);
      } else {
        await jetsonService.startCamera();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('카메라 제어 오류:', error);
    }
  };

  // 수면 감지 모델 제어
  const toggleSleepDetection = async () => {
    try {
      await jetsonService.toggleModel(!sleepDetectionActive);
      setSleepDetectionActive(!sleepDetectionActive);
    } catch (error) {
      console.error('수면 감지 모델 제어 오류:', error);
    }
  };

  // 센서 데이터 업데이트 시간 기록
  useEffect(() => {
    if (liveSensorData) {
      setLastUpdate(new Date());
    }
  }, [liveSensorData]);

  // 센서 안전 상태 계산
  const sensorSafety = getSensorSafetyStatus(
    liveSensorData?.temperature,
    liveSensorData?.humidity,
    liveSensorData?.bodyTemperature
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30">
      <div className="space-y-6 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">실시간 모니터링</h1>
            <p className="text-slate-600 mt-1">아기의 상태를 실시간으로 확인해요</p>
          </div>
          
          {/* 연결 상태 표시 */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">연결됨</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">연결 끊김</span>
              </div>
            )}
          </div>
        </div>

        {/* 수면 모드 상태 표시 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-slate-900">
                수면 모드: <span className={sleepModeEnabled ? 'text-green-600' : 'text-gray-600'}>
                  {sleepModeEnabled ? "ON" : "OFF"}
                </span>
              </span>
            </div>
            <button
              onClick={toggleSleepDetection}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                sleepDetectionActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              {sleepDetectionActive ? "수면 감지 끄기" : "수면 감지 켜기"}
            </button>
          </div>
        </div>

        {/* 🔥 단일 실시간 카메라 스트림 */}
        <div className="w-full max-w-2xl mx-auto">
          <VideoStream
            streamUrl={jetsonService.getCameraStreamUrl()}
            isActive={cameraActive}
            onToggle={toggleCamera}
            title="실시간 모니터링 카메라"
          />
        </div>
        
        
        {/* 🔥 질식감지 상태 표시 */}
        <SafetyStatus
        safetyState={toSafetyState(systemStatus?.currentState?.safety_state)}
        />

        

        {/* 🔥 센서 데이터 카드 - 안전 상태 포함 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 실내 온도 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">실내 온도</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {liveSensorData?.temperature?.toFixed(1) || "--"}°C
                  </span>
                  {liveSensorData?.temperature && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      liveSensorData.temperature >= 21 && liveSensorData.temperature <= 24
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {liveSensorData.temperature >= 21 && liveSensorData.temperature <= 24 
                        ? '적정' : '주의'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 습도 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">습도</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {liveSensorData?.humidity?.toFixed(1) || "--"}%
                  </span>
                  {liveSensorData?.humidity && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      liveSensorData.humidity >= 40 && liveSensorData.humidity <= 60
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {liveSensorData.humidity >= 40 && liveSensorData.humidity <= 60
                        ? '적정' : '조절 필요'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 아기 체온 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">아기 체온</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {liveSensorData?.bodyTemperature?.toFixed(1) || "--"}°C
                  </span>
                  {liveSensorData?.bodyTemperature && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      liveSensorData.bodyTemperature >= 36.0 && liveSensorData.bodyTemperature <= 37.5
                        ? 'bg-green-100 text-green-700'
                        : liveSensorData.bodyTemperature >= 38.0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {liveSensorData.bodyTemperature >= 38.0 ? '발열' :
                       liveSensorData.bodyTemperature >= 37.6 ? '상승' :
                       liveSensorData.bodyTemperature >= 36.0 ? '정상' : '저체온'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 전체 환경 안전 상태 */}
        <div className={`rounded-xl p-4 border ${
          sensorSafety.isSafe 
            ? 'bg-green-50 border-green-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center gap-3">
            <Activity className={`w-6 h-6 ${
              sensorSafety.isSafe ? 'text-green-600' : 'text-orange-600'
            }`} />
            <div className="flex-1">
              <h3 className={`font-bold ${
                sensorSafety.isSafe ? 'text-green-900' : 'text-orange-900'
              }`}>
                환경 상태: {sensorSafety.isSafe ? '안전' : '주의 필요'}
              </h3>
              {!sensorSafety.isSafe && (
                <ul className="text-sm text-orange-700 mt-1">
                  {sensorSafety.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              )}
              {sensorSafety.isSafe && (
                <p className="text-sm text-green-700 mt-1">
                  모든 센서 값이 안전 범위 내에 있습니다.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 최근 업데이트 */}
        {lastUpdate && (
          <p className="text-xs text-slate-500 text-right">
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}