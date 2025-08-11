// src/components/GlobalChatbot.tsx
import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "../chatbot/config";
import MessageParser from "../chatbot/MessageParser";
import ActionProvider from "../chatbot/ActionProvider";
import "../chatbot/chatbot.css";

// 타입 선언
type Ctor = new (...args: unknown[]) => unknown;
type ChatbotConfigLoose = Record<string, unknown>;

// any 대신 타입 안전 단언
const MP = MessageParser as unknown as Ctor;
const AP = ActionProvider as unknown as Ctor;
const CFG = config as ChatbotConfigLoose;

export default function GlobalChatbot() {
  const [open, setOpen] = useState(false);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* 플로팅 토글 버튼 */}
      <button
        aria-label={open ? "챗봇 닫기" : "챗봇 열기"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-50 rounded-full shadow-lg border border-line bg-white/90 backdrop-blur px-3 py-3 hover:bg-white transition"
      >
        {open ? (
          <X size={20} className="text-cocoa" />
        ) : (
          <MessageSquare size={20} className="text-cocoa" />
        )}
      </button>

      {/* 챗봇 패널 */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 w-[360px] max-w-[92vw] max-h-[72vh] bg-white border border-line rounded-2xl shadow-xl overflow-hidden"
          role="dialog"
          aria-label="BabyBot"
        >
          {/* 헤더 + 닫기 버튼 */}
          <div className="border-b border-line px-3 py-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-cocoa">BabyBot</span>
            <button
              aria-label="챗봇 닫기"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-butter-50"
            >
              <X size={18} className="text-cocoa" />
            </button>
          </div>

          {/* 챗봇 본문 */}
          <div className="p-2">
            <Chatbot config={CFG} messageParser={MP} actionProvider={AP} />
          </div>
        </div>
      )}
    </>
  );
}
