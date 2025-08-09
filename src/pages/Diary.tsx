import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../lib/useLocalStorage";
import SectionCard from "../components/SectionCard";

const KEY = "baby-diary";
const TMP = "baby-diary-tmp";

export default function Diary() {
  const [text, setText]     = useLocalStorage(KEY, "");
  const [temp, setTemp]     = useLocalStorage(TMP, "");
  const [status, setStatus] = useState<"idle"|"saving"|"saved">("idle");
  const timer = useRef<number | null>(null);

  // 처음 로드 시 임시 데이터 불러오기
  useEffect(() => {
    setTemp(text);
  }, [text, setTemp]);

  const onChange = (v: string) => {
    setTemp(v);
    setStatus("saving");

    if (timer.current) window.clearTimeout(timer.current);

    timer.current = window.setTimeout(() => {
      setText(v);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 800);
    }, 500);
  };

  const restore = () => setText(temp);

  return (
    <div className="grid gap-3">
      <SectionCard
        title="하루 기록"
        right={
          <div className="text-xs text-gray-500">
            {status === "saving"
              ? "자동 저장 중…"
              : status === "saved"
              ? "저장됨"
              : " "}
          </div>
        }
      >
        <textarea
          className="border border-gray-300 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-yellow-50"
          style={{ height: 260, resize: "vertical" }}
          placeholder="오늘의 메모를 적어보세요…"
          value={temp}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>글자수: {temp.length}</span>
          {temp !== text && (
            <button
              className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg shadow"
              onClick={restore}
            >
              임시본 복구
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
