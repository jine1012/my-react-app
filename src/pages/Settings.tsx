import { useState } from "react";
import { 
  Download, 
  Upload, 
  Trash2, 
  Settings, 
  Database, 
  Palette, 
  Info, 
  AlertCircle,
  FileText,
  Smartphone,
  Moon,
  Sun,
  Bell,
  MoreVertical
} from "lucide-react";

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const exportData = async () => {
    setIsExporting(true);
    try {
      const payload = {
        logs: JSON.parse(localStorage.getItem("baby-logs") || "[]"),
        diary: localStorage.getItem("baby-diary") || "",
        settings: {
          notifications,
          darkMode,
          autoSave
        },
        exportedAt: new Date().toISOString(),
        version: "1.0.0"
      };
      
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileName = `baby-monitor-${new Date().toISOString().split('T')[0]}.json`;
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      // 성공 알림 (실제로는 toast나 알림 시스템 사용)
      alert("데이터가 성공적으로 백업되었습니다!");
    } catch (error) {
      alert("백업 중 오류가 발생했습니다.");
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async () => {
    setIsImporting(true);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        setIsImporting(false);
        return;
      }

      try {
        const txt = await file.text();
        const data = JSON.parse(txt);
        
        // 데이터 유효성 검사
        if (!data.exportedAt) {
          throw new Error("올바르지 않은 백업 파일입니다.");
        }
        
        // 복원 확인
        const confirmRestore = confirm(
          `${new Date(data.exportedAt).toLocaleDateString('ko-KR')}에 백업된 데이터를 복원하시겠습니까?\n현재 데이터는 덮어쓰여집니다.`
        );
        
        if (confirmRestore) {
          if (data.logs) localStorage.setItem("baby-logs", JSON.stringify(data.logs));
          if (typeof data.diary === "string") localStorage.setItem("baby-diary", data.diary);
          if (data.settings) {
            setNotifications(data.settings.notifications ?? true);
            setDarkMode(data.settings.darkMode ?? false);
            setAutoSave(data.settings.autoSave ?? true);
          }
          
          alert("데이터가 성공적으로 복원되었습니다!");
          location.reload();
        }
      } catch (error) {
        alert("파일을 읽는 중 오류가 발생했습니다. 올바른 백업 파일인지 확인해주세요.");
        console.error("Import error:", error);
      } finally {
        setIsImporting(false);
      }
    };
    
    input.click();
  };

  const clearAll = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    localStorage.clear();
    alert("모든 데이터가 삭제되었습니다.");
    setShowDeleteConfirm(false);
    location.reload();
  };

  const getStorageInfo = () => {
    const logs = localStorage.getItem("baby-logs") || "[]";
    const diary = localStorage.getItem("baby-diary") || "";
    const logsSize = new Blob([logs]).size;
    const diarySize = new Blob([diary]).size;
    const totalSize = logsSize + diarySize;
    
    return {
      logsCount: JSON.parse(logs).length,
      diaryLength: diary.length,
      totalSize: (totalSize / 1024).toFixed(1) + " KB"
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="space-y-6 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">설정</h1>
            <p className="text-slate-600 mt-1">앱 환경설정 및 데이터 관리</p>
          </div>
          <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* 데이터 관리 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Database className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">데이터 관리</h3>
                <p className="text-sm text-slate-600">백업, 복원 및 데이터 삭제</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* 스토리지 정보 */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                저장된 데이터
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900">{storageInfo.logsCount}</div>
                  <div className="text-xs text-slate-600">로그 개수</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{storageInfo.diaryLength}</div>
                  <div className="text-xs text-slate-600">일기 글자</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{storageInfo.totalSize}</div>
                  <div className="text-xs text-slate-600">총 용량</div>
                </div>
              </div>
            </div>

            {/* 데이터 관리 버튼들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={exportData}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 p-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-medium transition-all hover:shadow-lg"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    백업 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    백업
                  </>
                )}
              </button>

              <button
                onClick={importData}
                disabled={isImporting}
                className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-all hover:shadow-lg"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    복원 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    복원
                  </>
                )}
              </button>

              <button
                onClick={clearAll}
                className="flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all hover:shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                전체 삭제
              </button>
            </div>
          </div>
        </div>

        {/* 앱 설정 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Settings className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">앱 설정</h3>
                <p className="text-sm text-slate-600">알림, 테마 및 기본 설정</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* 알림 설정 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="font-medium text-slate-900">알림</div>
                  <div className="text-sm text-slate-600">새로운 활동 알림 받기</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* 다크모드 설정 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-slate-600" />}
                <div>
                  <div className="font-medium text-slate-900">다크 모드</div>
                  <div className="text-sm text-slate-600">어두운 테마 사용</div>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* 자동저장 설정 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="font-medium text-slate-900">자동 저장</div>
                  <div className="text-sm text-slate-600">일기 자동 저장 활성화</div>
                </div>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoSave ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  autoSave ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* 테마 설정 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-xl">
                <Palette className="w-5 h-5 text-pink-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">테마</h3>
                <p className="text-sm text-slate-600">앱 외관 및 색상 설정</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Palette className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">현재 테마: 따뜻한 코코아</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    부드러운 앰버와 오렌지 톤으로 구성된 따뜻하고 아늑한 테마입니다.
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    더 많은 테마는 향후 업데이트에서 제공될 예정입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Smartphone className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">앱 정보</h3>
                <p className="text-sm text-slate-600">버전 및 시스템 정보</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">앱 버전</span>
              <span className="font-medium text-slate-900">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">마지막 업데이트</span>
              <span className="font-medium text-slate-900">2025.08.13</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">개발자</span>
              <span className="font-medium text-slate-900">Baby Monitor Team</span>
            </div>
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">정말 삭제하시겠습니까?</h3>
                <p className="text-slate-600 mb-6">
                  모든 로그, 일기, 설정이 영구적으로 삭제됩니다.<br />
                  이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}