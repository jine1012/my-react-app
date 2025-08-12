// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Thermometer, Droplets, Play, NotebookPen, List } from "lucide-react";
import babyHero from "../assets/baby-hero.png";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";

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
    <div className="grid gap-4 pb-20">
      {/* 헤드라인 + 히어로 */}
      <section className="rounded-2xl border border-cocoa-200 bg-white p-5 shadow-sm">
        <p className="text-[12px] font-medium text-cocoa">같이 보는 오늘</p>

        <h2 className="mt-1 text-[28px] leading-[1.15] font-extrabold tracking-tight text-cocoa">
          아기의 하루,
          <span className="block">모두 여기에서</span>
        </h2>

        <p className="mt-3 text-[14px] text-cocoa">오늘의 활동 유형은</p>

        {/* 히어로 이미지 (조금 더 크게) */}
        <div className="mt-3 w-full grid place-items-center">
          <img
            src={babyHero}
            alt="아기 아이콘"
            className="w-[240px] h-[240px] object-contain drop-shadow-sm"
          />
        </div>

        <h3 className="mt-2 text-lg font-semibold text-cocoa text-center">
          활발한 활동 아기
        </h3>

        <div className="mt-1 text-center text-[14px] text-cocoa">
          안녕하세요! <br />
          오늘 하루의 활동을 보여드릴게요.
        </div>

        {/* 빠른 실행 (색 조금 연하게, 사이즈 약간 축소) */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Link
            to="/live"
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-cocoa/90 hover:bg-cocoa text-white py-2.5 text-sm font-medium shadow-sm active:scale-95 transition"
          >
            <Play size={16} /> 라이브
          </Link>
          <Link
            to="/diary"
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-cocoa/90 hover:bg-cocoa text-white py-2.5 text-sm font-medium shadow-sm active:scale-95 transition"
          >
            <NotebookPen size={16} /> 일기
          </Link>
          <Link
            to="/logs"
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-cocoa/90 hover:bg-cocoa text-white py-2.5 text-sm font-medium shadow-sm active:scale-95 transition"
          >
            <List size={16} /> 로그
          </Link>
        </div>
      </section>

      {/* 상태 요약 */}
      <SectionCard title="상태 요약">
        <div className="text-sm text-cocoa">
          {last ? (
            <>
              마지막 이벤트 · {new Date(last.ts).toLocaleTimeString()} ·{" "}
              <b className="text-cocoa">{last.type}</b> · {last.msg}
            </>
          ) : (
            <>최근 이벤트가 없습니다.</>
          )}
        </div>
      </SectionCard>

      {/* 환경 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="온도"
          value="23.2°C"
          icon={<Thermometer className="text-cocoa" />}
        />
        <StatCard
          label="습도"
          value="48%"
          icon={<Droplets className="text-cocoa" />}
        />
      </div>
    </div>
  );
}
