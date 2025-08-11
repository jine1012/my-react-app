// src/components/GlobalChatbot.tsx (개선된 버전)
import { useState, useEffect } from "react";
import { MessageSquare, X, Settings, Baby, AlertCircle } from "lucide-react";
import { BabyChatbot } from "./BabyChatbot";

export default function GlobalChatbot() {
  const [open, setOpen] = useState(false);
  const [babyAge, setBabyAge] = useState<number | undefined>(undefined);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  // API 키 상태 확인
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    setApiKeyStatus(apiKey ? 'valid' : 'invalid');
  }, []);

  // 로컬 스토리지에서 아기 정보 불러오기
  useEffect(() => {
    const savedAge = localStorage.getItem('baby-age');
    if (savedAge && !isNaN(parseInt(savedAge))) {
      setBabyAge(parseInt(savedAge));
    }
  }, []);

  // 아기 나이 저장
  const updateBabyAge = (age: number) => {
    if (age >= 0 && age <= 36) {
      setBabyAge(age);
      localStorage.setItem('baby-age', age.toString());
      setShowSettings(false);
    }
  };

  // 아기 정보 초기화
  const resetBabyInfo = () => {
    setBabyAge(undefined);
    localStorage.removeItem('baby-age');
  };

  // ESC 키로 닫기
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
      {/* 플로팅 토글 버튼 */}
      <button
        aria-label={open ? "챗봇 닫기" : "아기 상담사 열기"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-50 rounded-full shadow-lg border border-gray-200 bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-4 hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        {open ? (
          <X size={24} />
        ) : (
          <div className="flex items-center gap-2">
            <Baby size={24} />
            <MessageSquare size={20} />
          </div>
        )}
        
        {/* API 키 없을 때 경고 표시 */}
        {apiKeyStatus === 'invalid' && !open && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* 챗봇 패널 */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 w-[420px] max-w-[95vw] h-[600px] max-h-[80vh] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          role="dialog"
          aria-label="아기 울음 상담사"
        >
          {/* 헤더 */}
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-pink-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Baby className="text-blue-500" size={20} />
              <div>
                <span className="text-sm font-semibold text-gray-800">아기 울음 상담사</span>
                {babyAge !== undefined && (
                  <p className="text-xs text-gray-600">{babyAge}개월 아기</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* API 키 상태 표시 */}
              {apiKeyStatus === 'invalid' && (
                <div className="flex items-center gap-1 text-red-600" title="API 키가 설정되지 않았습니다">
                  <AlertCircle size={14} />
                </div>
              )}
              
              <button
                aria-label="설정"
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings size={16} className="text-gray-600" />
              </button>
              <button
                aria-label="챗봇 닫기"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* API 키 경고 메시지 */}
          {apiKeyStatus === 'invalid' && (
            <div className="bg-red-50 border-b border-red-200 p-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">설정 필요</span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                OpenAI API 키가 설정되지 않았습니다. 오프라인 모드로 기본 조언만 제공됩니다.
              </p>
            </div>
          )}

          {/* 설정 패널 */}
          {showSettings && (
            <div className="border-b border-gray-200 p-4 bg-gray-50 flex-shrink-0">
              <h4 className="text-sm font-medium text-gray-800 mb-3">아기 정보 설정</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    아기 월령 (개월)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="36"
                    value={babyAge || ''}
                    onChange={(e) => {
                      const age = parseInt(e.target.value);
                      if (!isNaN(age)) updateBabyAge(age);
                    }}
                    placeholder="예: 3"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* 빠른 설정 버튼 */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">빠른 설정:</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 6, 12, 18, 24].map(age => (
                      <button
                        key={age}
                        onClick={() => updateBabyAge(age)}
                        className={`px-3 py-1 text-xs border rounded-full transition-colors ${
                          babyAge === age 
                            ? 'bg-blue-100 border-blue-300 text-blue-700' 
                            : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        {age}개월
                      </button>
                    ))}
                  </div>
                </div>

                {/* 초기화 버튼 */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={resetBabyInfo}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    정보 초기화
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    완료
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 챗봇 본문 */}
          <div className="flex-1 overflow-hidden">
            <BabyChatbot 
              babyAgeInMonths={babyAge}
              onAgeUpdate={updateBabyAge}
            />
          </div>
        </div>
      )}
    </>
  );
}