import { Camera, Link, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { useState } from "react";

const streamUrl = (import.meta.env?.VITE_STREAM_URL ?? "").trim();

export default function Live() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!streamUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
        <div className="grid gap-6 pb-20 px-4 pt-4">
          {/* Empty State Card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-8 shadow-xl backdrop-blur-sm">
            {/* 배경 데코레이션 */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-yellow-200/20 to-amber-200/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10 text-center">
              {/* 아이콘 */}
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center shadow-2xl mb-6">
                <Camera className="w-12 h-12 text-amber-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-amber-900 mb-4">
                스트림이 설정되지 않았습니다
              </h2>
              
              <p className="text-amber-700 mb-6 leading-relaxed">
                라즈베리파이를 HLS/MP4로 송출하고<br />
                .env에 VITE_STREAM_URL을 지정하세요.
              </p>
              
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/30">
                <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                  <Link size={16} />
                  <code className="bg-white/50 px-2 py-1 rounded font-mono">
                    VITE_STREAM_URL=https://example.com/stream.m3u8
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="grid gap-6 pb-20 px-4 pt-4">
        {/* 실시간 영상 카드 */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 p-6 shadow-xl backdrop-blur-sm">
          {/* 배경 데코레이션 */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-yellow-200/20 to-amber-200/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                  <Camera className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-amber-900">실시간 영상</h1>
                  <p className="text-sm text-amber-600">우리 아기의 현재 모습</p>
                </div>
              </div>
              
              {/* 상태 표시 */}
              <div className="flex items-center gap-2 bg-green-100/50 px-3 py-2 rounded-xl border border-green-200/50">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">LIVE</span>
              </div>
            </div>

            {/* 비디오 컨테이너 */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
                <video
                  className="w-full aspect-video object-cover"
                  src={streamUrl}
                  controls={false}
                  playsInline
                  autoPlay={isPlaying}
                  muted={isMuted}
                  poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNDAiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIzODgiIHk9IjIxMyI+CjxwYXRoIGQ9Ik0yMyAxOWEyIDIgMCAwIDEtMiAySDNhMiAyIDAgMCAxLTItMlY1YTIgMiAwIDAgMSAyLTJoMThhMiAyIDAgMCAxIDIgMnYxNHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlCA0E3RiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjgiIGN5PSIxMSIgcj0iMSIgZmlsbD0iIzlCA0E3RiIvPgo8L3N2Zz4KPC9zdmc+"
                />
                
                {/* 커스텀 컨트롤 오버레이 */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    {/* 재생/일시정지 버튼 */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-4 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-300"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </button>
                    
                    {/* 음소거 버튼 */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-300"
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6 text-white" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-white" />
                      )}
                    </button>
                    
                    {/* 전체화면 버튼 */}
                    <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-300">
                      <Maximize className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 하단 정보 */}
              <div className="mt-4 bg-amber-50/50 rounded-xl p-4 border border-amber-200/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">📺 스트림 정보</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {streamUrl.includes('.m3u8') ? 'HLS 스트림' : 'MP4 비디오'} • 해상도: 자동
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-600">연결 상태</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">양호</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 카드 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-amber-200/50">
          <h3 className="text-lg font-bold text-amber-800 mb-4">빠른 동작</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:from-blue-200 hover:to-blue-300 transition-all duration-300 hover:scale-105">
              <div className="p-2 bg-white/50 rounded-lg">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-blue-800">스크린샷</p>
                <p className="text-xs text-blue-600">현재 화면 캡처</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:from-purple-200 hover:to-purple-300 transition-all duration-300 hover:scale-105">
              <div className="p-2 bg-white/50 rounded-lg">
                <Play className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-purple-800">녹화 시작</p>
                <p className="text-xs text-purple-600">영상 저장</p>
              </div>
            </button>
          </div>
        </div>

        {/* 스트림 통계 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl p-4 shadow-lg border border-amber-100/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-2xl font-bold text-amber-800">24ms</span>
            </div>
            <p className="text-sm text-amber-600 font-medium">지연 시간</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl p-4 shadow-lg border border-amber-100/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-2xl font-bold text-amber-800">1080p</span>
            </div>
            <p className="text-sm text-amber-600 font-medium">화질</p>
          </div>
        </div>
      </div>
    </div>
  );
}