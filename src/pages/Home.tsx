// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Play, 
  NotebookPen, 
  List, 
  Sparkles,
  Baby,
  Wifi,
  WifiOff
} from "lucide-react";

interface SensorData {
  roomTemperature: number;
  humidity: number;
  babyTemperature: number;
  timestamp: string;
  jetsonConnected: boolean;
}

// 🔥 아기 정보 인터페이스
interface BabyInfo {
  name: string;
  ageInMonths: number;
  weight: number;
}

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData>({
    roomTemperature: 23.2,
    humidity: 48,
    babyTemperature: 36.8,
    timestamp: new Date().toISOString(),
    jetsonConnected: false
  });

  // 🔥 아기 정보 상태 (RAG 챗봇에서 사용)
  const [babyInfo] = useState<BabyInfo>({
    name: '우리 아기', // 실제 아기 이름으로 변경 가능
    ageInMonths: 8,     // 실제 개월 수로 변경 가능
    weight: 8.5         // 실제 체중으로 변경 가능
  });

  // 젯슨나노 연결 상태 실시간 업데이트
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        // 젯슨나노 연결 상태 확인
        const statusResponse = await fetch('/api/jetson/status');
        const statusData = await statusResponse.json();
        
        setSensorData(prev => ({
          ...prev,
          jetsonConnected: statusData.connected || false,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('연결 상태 확인 실패:', error);
        setSensorData(prev => ({
          ...prev,
          jetsonConnected: false,
          timestamp: new Date().toISOString()
        }));
      }
    };

    // 초기 상태 확인
    fetchConnectionStatus();
    
    // 5초마다 연결 상태 확인
    const interval = setInterval(fetchConnectionStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

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
            <span className="hero-title-highlight">{babyInfo.name}</span>
          </h1>
          <p className="hero-subtitle">
            ✨<br />
            {babyInfo.ageInMonths}개월 아기의 하루를 보여드릴게요.
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
            <h3 className="font-semibold text-stone-800">연결 상태</h3>
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
        
        {/* 🔥 젯슨나노 연결 끊김 시 챗봇 활용 안내 */}
        {!sensorData.jetsonConnected && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 text-blue-800">
              <Baby className="w-4 h-4" />
              <span className="text-sm font-medium">육아 상담사가 도와드릴게요!</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              센서 연결이 원활하지 않을 때도 우측 하단 챗봇을 통해 전문적인 육아 조언을 받으실 수 있어요.
            </p>
          </div>
        )}

        {/* 업데이트 시간 */}
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-xs text-stone-500 text-center">
            마지막 업데이트: {new Date(sensorData.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}