import { useEffect, useRef, useState } from "react";
import { Save, Clock, Calendar, Edit3, Heart, Sparkles, FileText, MoreVertical } from "lucide-react";

const KEY = "baby-diary";
const TMP = "baby-diary-tmp";

// Custom hook for localStorage
const useLocalStorage = (key: string, initialValue: string) => {
  const [storedValue, setStoredValue] = useState<string>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: string | ((val: string) => string)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export default function Diary() {
  const [text, setText] = useLocalStorage(KEY, "");
  const [temp, setTemp] = useLocalStorage(TMP, "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [wordCount, setWordCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const timer = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 처음 로드 시 임시 데이터 불러오기
  useEffect(() => {
    setTemp(text);
  }, [text, setTemp]);

  // 글자 수 계산
  useEffect(() => {
    setWordCount(temp.length);
  }, [temp]);

  const onChange = (v: string) => {
    setTemp(v);
    setStatus("saving");

    if (timer.current) window.clearTimeout(timer.current);

    timer.current = window.setTimeout(() => {
      setText(v);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    }, 1000);
  };

  const restore = () => setText(temp);

  const manualSave = () => {
    setText(temp);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getWritingStats = () => {
    const lines = temp.split('\n').length;
    const words = temp.trim() ? temp.trim().split(/\s+/).length : 0;
    const chars = temp.length;
    const charsNoSpaces = temp.replace(/\s/g, '').length;
    
    return { lines, words, chars, charsNoSpaces };
  };

  const stats = getWritingStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="space-y-6 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">하루 기록</h1>
            <p className="text-slate-600 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {getCurrentDate()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              title="통계 보기"
            >
              <FileText className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* 상태 바 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-sm ${
                status === "saving" ? "text-amber-600" :
                status === "saved" ? "text-emerald-600" :
                "text-slate-500"
              }`}>
                {status === "saving" && (
                  <>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    자동 저장 중...
                  </>
                )}
                {status === "saved" && (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    저장됨
                  </>
                )}
                {status === "idle" && (
                  <>
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    대기 중
                  </>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {wordCount}자
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {temp !== text && (
                <button
                  onClick={restore}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  임시본 복구
                </button>
              )}
              <button
                onClick={manualSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors"
              >
                <Save className="w-3 h-3" />
                저장
              </button>
            </div>
          </div>
        </div>

        {/* 통계 패널 */}
        {showStats && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              작성 통계
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.lines}</div>
                <div className="text-sm text-slate-500">줄</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.words}</div>
                <div className="text-sm text-slate-500">단어</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.chars}</div>
                <div className="text-sm text-slate-500">전체 글자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.charsNoSpaces}</div>
                <div className="text-sm text-slate-500">공백 제외</div>
              </div>
            </div>
          </div>
        )}

        {/* 메인 에디터 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Edit3 className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">오늘의 이야기</h3>
                <p className="text-sm text-slate-600">우리 아기와 함께한 특별한 순간들을 기록해보세요</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full h-80 p-6 bg-amber-50/30 border border-amber-200/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none text-slate-900 placeholder-slate-400 leading-relaxed"
                placeholder="오늘은 어떤 일이 있었나요? 아기의 첫 미소, 새로운 표정, 귀여운 행동들... 소중한 순간들을 자유롭게 적어보세요. ✨"
                value={temp}
                onChange={(e) => onChange(e.target.value)}
              />
              
              {/* 장식 요소 */}
              <div className="absolute top-4 right-4 opacity-20">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-20">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* 하단 정보 */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span>마지막 수정: {new Date().toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
                {wordCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    약 {Math.ceil(wordCount / 200)}분 분량
                  </span>
                )}
              </div>
              <div className="text-xs">
                자동저장 활성화
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => {
              const templates = [
                "오늘 아기는 ",
                "새로운 표정: ",
                "첫 번째 시도: ",
                "귀여운 순간: ",
                "성장의 흔적: "
              ];
              const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
              setTemp(temp + (temp ? "\n\n" : "") + randomTemplate);
              textareaRef.current?.focus();
            }}
            className="flex items-center justify-center gap-3 p-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-medium transition-all hover:shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            빠른 시작
          </button>
          
          <button
            onClick={() => {
              const today = new Date().toLocaleDateString('ko-KR');
              setTemp(temp + (temp ? "\n\n" : "") + `📅 ${today}\n\n`);
              textareaRef.current?.focus();
            }}
            className="flex items-center justify-center gap-3 p-4 bg-amber-700 hover:bg-amber-800 text-white rounded-2xl font-medium shadow-lg shadow-amber-700/25 hover:shadow-xl hover:shadow-amber-700/30 transition-all"
          >
            <Calendar className="w-5 h-5" />
            날짜 추가
          </button>
        </div>
      </div>
    </div>
  );
}