import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Thermometer, Droplets, Play, NotebookPen, List, Heart, Sparkles } from "lucide-react";
import babyHero from "../assets/baby-hero.png";

type Log = { ts: number; type: "note" | "cry" | "temp"; msg: string };

export default function Home() {
  const [logs, setLogs] = useState<Log[]>([]);
  const last = logs[0];

  // Baby hero image from assets
  // const babyHero = "https://images.unsplash.com/photo-1544717440-6e4d999de2a1?w=400&h=400&fit=crop&crop=face";

  useEffect(() => {
    const stored = localStorage.getItem("baby-logs");
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch {
        console.error("Failed to parse logs");
      }
    }
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
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-md animate-pulse"></div>
            <div className="image-ring"></div>
            <img
              src={babyHero}
              alt="아기 아이콘"
              className="hero-image"
            />
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
          <h3 className="text-xl font-bold text-amber-800 mb-2">활발한 활동 아기</h3>
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

      {/* 환경 정보 카드들 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-2xl font-bold text-stone-800">23.2°C</span>
          </div>
          <p className="text-sm font-medium text-stone-600">온도</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-200/50 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-stone-800">48%</span>
          </div>
          <p className="text-sm font-medium text-stone-600">습도</p>
        </div>
      </div>
    </div>
  );
}