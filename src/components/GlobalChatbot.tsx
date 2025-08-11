// src/components/GlobalChatbot.tsx
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "../chatbot/config";
import  MessageParser  from "../chatbot/MessageParser";
import  ActionProvider  from "../chatbot/ActionProvider";
import "../chatbot/chatbot.css";

// 파일 상단에 추가
type Ctor = new (...args: unknown[]) => unknown;
type ChatbotConfigLoose = Record<string, unknown>;

// 생성자/설정 래핑 (any 대신 unknown 기반 단언)
const MP = MessageParser as unknown as Ctor;
const AP = ActionProvider as unknown as Ctor;
const CFG = config as ChatbotConfigLoose;



export default function GlobalChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 토글 버튼 */}
      <button
        aria-label={open ? "챗봇 닫기" : "챗봇 열기"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-50 rounded-full shadow-lg border border-line bg-white/90 backdrop-blur px-3 py-3 hover:bg-white transition"
      >
        {open ? <X size={20} className="text-cocoa" /> : <MessageSquare size={20} className="text-cocoa" />}
      </button>

      {/* 챗봇 패널 */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 w-[360px] max-w-[92vw] max-h-[72vh] bg-white border border-line rounded-2xl shadow-xl overflow-hidden"
          role="dialog"
          aria-label="BabyBot"
        >
          <div className="border-b border-line px-3 py-2 text-sm font-semibold text-cocoa">BabyBot</div>
          <div className="p-2">
            <Chatbot
              config={CFG}
              messageParser={MP}
              actionProvider={AP}
            />
          </div>
        </div>
      )}
    </>
  );
}
