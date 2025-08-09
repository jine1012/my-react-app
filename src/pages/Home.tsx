import { useEffect, useState } from "react";
import { Thermometer, Droplets, Play, NotebookPen, List } from "lucide-react";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";

type Log = { ts: number; type: "note" | "cry" | "temp"; msg: string };

export default function Home() {
  const [logs, setLogs] = useState<Log[]>([]);
  const last = logs[0];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("baby-logs");
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load logs:", e);
    }
  }, []); // ✅ 의존성 문제 없음

  return (
    <div className="grid gap-3">
      <SectionCard title="상태 요약">
        <div className="text-sm text-cocoa-50">
          {last ? (
            <>마지막 이벤트 · {new Date(last.ts).toLocaleTimeString()} · <b>{last.type}</b> · {last.msg}</>
          ) : (<>최근 이벤트가 없습니다.</>)}
        </div>
      </SectionCard>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="온도" value="23.2°C" icon={<Thermometer className="text-cocoa" />} />
        <StatCard label="습도" value="48%"   icon={<Droplets className="text-cocoa" />} />
      </div>

      <SectionCard title="빠른 동작" right={<span className="text-xs text-cocoa-50">자주 쓰는 작업</span>}>
        <div className="flex gap-2">
          <a href="/live" className="btn btn-primary inline-flex items-center gap-1"><Play size={16}/> 라이브</a>
          <a href="/diary" className="btn inline-flex items-center gap-1"><NotebookPen size={16}/> 일기</a>
          <a href="/logs" className="btn inline-flex items-center gap-1"><List size={16}/> 로그</a>
        </div>
      </SectionCard>
    </div>
  );
}

