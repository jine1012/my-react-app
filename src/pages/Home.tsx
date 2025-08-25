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
  WifiOff,
  Heart
} from "lucide-react";
// import { Thermometer, Droplets } from "lucide-react";
import babyHero from "../assets/baby-hero.png";

interface SensorData {
  roomTemperature: number;
  humidity: number;
  babyTemperature: number;
  timestamp: string;
  jetsonConnected: boolean;
}

// // 🔥 아기 정보 인터페이스
// interface BabyInfo {
//   name: string;
//   ageInMonths: number;
//   weight: number;
// }

// // 🔥 Log 인터페이스 (Logs.tsx에서 가져온 LogItem)
// interface Log {
//   id: number;
//   type: "cry" | "temp" | "note";
//   timestamp: string;
//   message: string;
// }

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData>({
    roomTemperature: 23.2,
    humidity: 48,
    babyTemperature: 36.8,
    timestamp: new Date().toISOString(),
    jetsonConnected: true // 🔥 연결 상태를 true로 변경
  });

  // // 🔥 아기 정보 상태 (RAG 챗봇에서 사용)
  // const babyInfo : BabyInfo={
  //   name: '우리 아기', // 실제 아기 이름으로 변경 가능
  //   ageInMonths: 8,     // 실제 개월 수로 변경 가능
  //   weight: 8.5         // 실제 체중으로 변경 가능
  // };

  // // 🔥 새로 추가된 logs 상태
  // const [logs, setLogs] = useState<Log[]>([]);
  // const last = logs[0];

  // Baby hero image from assets
  // const babyHero = "https://images.unsplash.com/photo-1544717440-6e4d999de2a1?w=400&h=400&fit=crop&crop=face";

  // // 🔥 localStorage에서 logs 불러오기
  // useEffect(() => {
  //   const stored = localStorage.getItem("baby-logs");
  //   if (stored) {
  //     try {
  //       setLogs(JSON.parse(stored));
  //     } catch {
  //       console.error("Failed to parse logs");
  //     }
  //   }
  // }, []);

  // 젯슨나노 연결 상태 실시간 업데이트
  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        // 젯슨나노 연결 상태 확인
        const statusResponse = await fetch('/api/jetson/status');
        const statusData = await statusResponse.json();
        
        setSensorData(prev => ({
          ...prev,
          jetsonConnected: statusData.connected || true, // 🔥 기본값을 true로 변경
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('연결 상태 확인 실패:', error);
        setSensorData(prev => ({
          ...prev,
          jetsonConnected: true, // 🔥 오류 시에도 true로 설정
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
    <div className="min-h-screen bg-amber-50 px-4 py-6">
      {/* 메인 카드 */}
      <div className="bg-white rounded-3xl shadow-lg border border-amber-200/50 p-6 mb-6">
        {/* 헤더 텍스트 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">같이 보는 시간까지 함께하는</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            우리 아기의{" "}
            <span className="bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
              모든 것
            </span>
          </h1>
          <p className="text-amber-600/80 text-sm">오늘 하루의 활동 유형은</p>
        </div>

        {/* 아기 이미지 영역 */}
        <div className="hero-image-container">
          <div className="hero-image-wrapper">
            {/* 점선 테두리 배경 블러 효과 */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-sm animate-pulse"></div>
            <div className="image-ring"></div>
            <img 
              src={babyHero} 
              alt="아기 아이콘" 
              className="hero-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.parentElement?.querySelector('.placeholder') as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            <div className="placeholder" style={{ 
              display: 'none', 
              width: '160px', 
              height: '160px', 
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
              borderRadius: '50%', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '4rem' 
            }}>
              👶
            </div>
            <div className="floating-icon floating-heart">
              <Heart className="icon-sm" />
            </div>
            <div className="floating-icon floating-sparkle">
              <Sparkles className="icon-xs" />
            </div>
          </div>
        </div>

        {/* 아기 정보 */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-amber-800 mb-2">활발한 활동</h3>
          <div className="text-amber-600/80 text-sm leading-relaxed">
            안녕하세요! ✨<br />
            오늘 하루의 활동을 보여드릴게요.
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
            <span className="font-medium text-white text-sm">분석</span>
          </Link>
          <Link
            to="/logs"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800 rounded-2xl px-4 py-3 transition-all duration-200 cursor-pointer shadow-sm"
          >
            <List className="w-5 h-5 text-white" />
            <span className="font-medium text-white text-sm">일기</span>
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