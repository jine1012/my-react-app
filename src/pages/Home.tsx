// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Thermometer, Droplets, Play, NotebookPen, List, Heart, Sparkles } from "lucide-react";
import babyHero from "../assets/baby-hero.png";

type Log = { ts: number; type: "note" | "cry" | "temp"; msg: string };

export default function Home() {
  const [logs, setLogs] = useState<Log[]>([]);
  const last = logs[0];

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="grid gap-6 pb-20 px-4 pt-4">
        {/* 헤드라인 + 히어로 */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-6 shadow-xl backdrop-blur-sm">
          {/* 배경 데코레이션 */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-yellow-200/20 to-amber-200/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <p className="text-sm font-bold text-amber-700 uppercase tracking-wider">TODAY'S JOURNEY</p>
            </div>

            <h2 className="text-3xl font-black leading-tight text-amber-900 mb-2">
              아기의 하루,
              <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                모두 여기에서
              </span>
            </h2>

            <p className="mt-3 text-[14px] text-amber-600">오늘의 활동 유형은</p>

            {/* 히어로 이미지 (조금 더 크게) */}
            <div className="relative mt-6 mb-6">
              <div className="relative mx-auto w-56 h-56 rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/50 flex items-center justify-center shadow-2xl shadow-amber-200/30">
                {/* 배경 링 */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-amber-300/40 animate-spin"></div>
                
                {/* Baby Hero Image */}
                <img
                  src={babyHero}
                  alt="아기 아이콘"
                  className="w-[240px] h-[240px] object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300"
                />
                
                {/* 플로팅 아이콘들 */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Heart className="w-4 h-4 text-pink-500" />
                </div>
                <div className="absolute -bottom-1 -left-3 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shadow-md animate-bounce" style={{animationDelay: '0.5s'}}>
                  <Sparkles className="w-3 h-3 text-blue-500" />
                </div>
              </div>
            </div>

            <h3 className="mt-2 text-xl font-bold text-amber-800 text-center">
              활발한 활동 아기
            </h3>

            <div className="mt-1 text-center text-sm text-amber-600/80 leading-relaxed">
              안녕하세요! ✨<br />
              오늘 하루의 활동을 보여드릴게요.
            </div>

            {/* 빠른 실행 (색 조금 연하게, 사이즈 약간 축소) */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Link
                to="/live"
                className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white py-4 text-sm font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Play size={20} className="drop-shadow-sm" />
                <span className="relative z-10">라이브</span>
              </Link>
              <Link
                to="/diary"
                className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white py-4 text-sm font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <NotebookPen size={20} className="drop-shadow-sm" />
                <span className="relative z-10">일기</span>
              </Link>
              <Link
                to="/logs"
                className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white py-4 text-sm font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <List size={20} className="drop-shadow-sm" />
                <span className="relative z-10">로그</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 상태 요약 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-amber-200/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-amber-800">상태 요약</h3>
          </div>
          <div className="text-sm text-amber-700 bg-amber-50/50 rounded-xl p-3 border border-amber-200/30">
            {last ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                <span>
                  마지막 이벤트 · {new Date(last.ts).toLocaleTimeString()} ·{" "}
                  <b className="text-amber-800">{last.type}</b> · {last.msg}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600/70">
                <Sparkles className="w-4 h-4" />
                <span>최근 이벤트가 없습니다.</span>
              </div>
            )}
          </div>
        </div>

        {/* 환경 카드 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl p-4 shadow-lg border border-amber-100/50">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
                  <Thermometer className="text-orange-600 w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-amber-800">23.2°C</span>
              </div>
              <p className="text-sm text-amber-600 font-medium">온도</p>
            </div>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl p-4 shadow-lg border border-amber-100/50">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full">
                  <Droplets className="text-blue-600 w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-amber-800">48%</span>
              </div>
              <p className="text-sm text-amber-600 font-medium">습도</p>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
}