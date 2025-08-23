// src/pages/Realtime.tsx - 젯슨 나노 연동 업데이트
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Thermometer, 
  Droplets, 
  Moon, 
  Wifi,
  WifiOff,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { useJetsonService } from '../services/jetsonService';

// VideoStream 컴포넌트
interface VideoStreamProps {
  streamUrl: string;
  isActive: boolean;
  onToggle: () => void;
  title: string;
}

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

// 메인 페이지
export default function Realtime() {
  const { 
    jetsonService, 
    systemStatus,
    sensorData: liveSensorData,
    isConnected 
  } = useJetsonService();

  const [cameraActive, setCameraActive] = useState(false);
  const [sleepModeEnabled, setSleepModeEnabled] = useState(false);
  const [sleepDetectionActive, setSleepDetectionActive] = useState(false);
  const [suffocationAlert, setSuffocationAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 🔥 수면 감지 모델 연동
  useEffect(() => {
    const sleepState = systemStatus?.currentState.sleep_state;
    setSleepModeEnabled(sleepState === 'sleep');
  }, [systemStatus?.currentState]);

  // 🔥 질식 감지 모델 상태 체크
  useEffect(() => {
    const suffocationState = systemStatus?.currentState.safety_state;
    setSuffocationAlert(suffocationState === 'DANGER');
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

        {/* 🚨 위험 감지 알림 */}
        {suffocationAlert && (
          <div className="bg-red-100 border border-red-300 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
              <div>
                <h3 className="font-bold text-red-900">위험 감지!</h3>
                <p className="text-red-700 text-sm">질식 위험이 감지되었습니다. 즉시 확인해주세요!</p>
              </div>
            </div>
          </div>
        )}

        {/* 수면 모드 상태 표시 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-slate-900">
              수면 모드: {sleepModeEnabled ? "ON" : "OFF"}
            </span>
          </div>
          <button
            onClick={toggleSleepDetection}
            className="mt-3 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
          >
            {sleepDetectionActive ? "수면 감지 끄기" : "수면 감지 켜기"}
          </button>
        </div>

        {/* 실시간 카메라 스트림 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VideoStream
            streamUrl={jetsonService.getCameraStreamUrl()}
            isActive={cameraActive}
            onToggle={toggleCamera}
            title="일반 카메라"
          />
          <VideoStream
            streamUrl={`${jetsonService.getCameraStreamUrl()}?type=infrared`}
            isActive={cameraActive}
            onToggle={toggleCamera}
            title="적외선 카메라"
          />
        </div>

        {/* 센서 데이터 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 온도 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Thermometer className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900">실내 온도</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 text-center">
              {liveSensorData?.temperature?.toFixed(1) || "--"}°C
            </div>
          </div>

          {/* 습도 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">습도</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 text-center">
              {liveSensorData?.humidity?.toFixed(1) || "--"}%
            </div>
          </div>

          {/* 체온 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Droplets className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-slate-900">아기 체온</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900 text-center">
              {liveSensorData?.bodyTemperature?.toFixed(1) || "--"}°C
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
