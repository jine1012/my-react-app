import React, { useEffect, useState } from "react";
import { MessageSquare, X, Settings, Baby, AlertCircle } from "lucide-react";
import { BabyChatbot } from "./BabyChatbot";

/**
 * 전역 플로팅 챗봇 런처 + 패널
 * - 어떤 페이지에서도 오른쪽 아래 버튼 노출
 * - 버튼 클릭 시 오버레이 + 챗봇 패널 표시
 * - 아기 월령은 localStorage('baby-age')에 저장/로드
 * - API 키 체크는 선택(백엔드 FastAPI만 쓰면 없어도 동작)
 */
export default function GlobalChatbot() {
  const [open, setOpen] = useState(false);
  const [babyAge, setBabyAge] = useState<number | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);

  // ▶ 필요하면만 API 키 체크 (FastAPI만 쓰면 없어도 OK)
  const [apiKeyStatus, setApiKeyStatus] =
    useState<"checking" | "valid" | "invalid">("checking");
  useEffect(() => {
    // Vite 환경이면 VITE_OPENAI_API_KEY, 아니면 undefined
    const apiKey = import.meta.env?.VITE_OPENAI_API_KEY;
    // 백엔드(FastAPI)만 사용해도 문제 없도록 'valid'로 처리
    setApiKeyStatus(apiKey ? "valid" : "valid");
  }, []);

  // 로컬 스토리지에서 아기 정보 불러오기
  useEffect(() => {
    const savedAge = localStorage.getItem("baby-age");
    const n = savedAge ? parseInt(savedAge, 10) : NaN;
    if (!Number.isNaN(n)) setBabyAge(n);
  }, []);

  // 아기 나이 업데이트/저장
  const updateBabyAge = (age: number) => {
    if (age >= 0 && age <= 36) {
      setBabyAge(age);
      localStorage.setItem("baby-age", String(age));
      setShowSettings(false);
    }
  };

  // 초기화
  const resetBabyInfo = () => {
    setBabyAge(undefined);
    localStorage.removeItem("baby-age");
  };

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setShowSettings(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open]);

  return (
    <>
      {/* 🔥 플로팅 토글 버튼 - 위치 조정 */}
      <button
        aria-label={open ? "챗봇 닫기" : "아기 상담사 열기"}
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-24 right-4 z-[10000] rounded-full shadow-xl border border-white/30 
                    bg-gradient-to-r from-blue-500 to-pink-500 text-white px-3 py-3 
                    hover:shadow-2xl transition-all duration-200 hover:scale-105`}
      >
        {open ? (
          <X size={20} />
        ) : (
          <div className="flex items-center gap-1">
            <Baby size={18} />
            <MessageSquare size={16} />
          </div>
        )}

        {/* (선택) API 키 경고 점 */}
        {apiKeyStatus === "invalid" && !open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* 챗봇 패널 */}
      {open && (
        <>
          {/* 오버레이 (클릭 시 닫힘) */}
          <div
            className="fixed inset-0 bg-black/30 z-[9998]"
            onClick={() => {
              setOpen(false);
              setShowSettings(false);
            }}
          />

          <div
            className="fixed bottom-32 right-4 w-[380px] max-w-[90vw] h-[550px] max-h-[75vh]
                       bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden
                       flex flex-col z-[10001]"
            role="dialog"
            aria-modal="true"
            aria-label="아기 울음 상담사"
          >
            {/* 헤더 */}
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-pink-50">
              <div className="flex items-center gap-2">
                <Baby className="text-blue-500" size={18} />
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-gray-800">아기 울음 상담사</div>
                  {babyAge !== undefined && (
                    <div className="text-[11px] text-gray-600">{babyAge}개월 아기</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {apiKeyStatus === "invalid" && (
                  <div
                    className="flex items-center gap-1 text-red-600"
                    title="API 키가 설정되지 않았습니다 (백엔드만 사용 중이면 무시해도 됩니다)"
                  >
                    <AlertCircle size={14} />
                  </div>
                )}
                <button
                  aria-label="설정"
                  onClick={() => setShowSettings((v) => !v)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Settings size={16} className="text-gray-600" />
                </button>
                <button
                  aria-label="챗봇 닫기"
                  onClick={() => {
                    setOpen(false);
                    setShowSettings(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* 설정 패널 */}
            {showSettings && (
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-800 mb-3">아기 정보 설정</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">아기 월령 (개월)</label>
                    <input
                      type="number"
                      min={0}
                      max={36}
                      value={babyAge ?? ""}
                      onChange={(e) => {
                        const age = parseInt(e.target.value, 10);
                        if (!Number.isNaN(age)) updateBabyAge(age);
                      }}
                      placeholder="예: 3"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-2">빠른 설정:</p>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 6, 12, 18, 24].map((age) => (
                        <button
                          key={age}
                          onClick={() => updateBabyAge(age)}
                          className={`px-3 py-1 text-xs border rounded-full transition-colors ${
                            babyAge === age
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
                          }`}
                        >
                          {age}개월
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      닫기
                    </button>
                    <button
                      onClick={resetBabyInfo}
                      className="flex-1 px-3 py-2 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 챗봇 내용 */}
            <div className="flex-1 overflow-hidden">
              <BabyChatbot babyAgeInMonths={babyAge} />
            </div>
          </div>
        </>
      )}
    </>
  );
}