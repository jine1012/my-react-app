// src/pages/AudioFiles.tsx
import { useState, useEffect } from 'react';
import { Play, Download, Calendar, Activity, Volume2 } from 'lucide-react';

interface AudioFile {
  id: string;
  filePath: string;
  timestamp: string;
  confidence: number;
  source: string;
  size?: number;
  duration?: number;
}

interface AudioStats {
  total: number;
  today: number;
  yesterday: number;
  thisWeek: number;
  averageConfidence: string;
  lastDetection: string;
}

export default function AudioFiles() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [stats, setStats] = useState<AudioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAudioFiles();
    fetchStats();
  }, []);

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch('/api/cry-detection/audio-files?limit=50');
      if (response.ok) {
        const result = await response.json();
        setAudioFiles(result.files);
      }
    } catch (error) {
      console.error('오디오 파일 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cry-detection/audio-stats');
      if (response.ok) {
        const result = await response.json();
        setStats(result.stats);
      }
    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  const handlePlay = async (fileId: string) => {
    try {
      setPlayingId(fileId);
      
      // 오디오 파일 다운로드 및 재생
      const response = await fetch(`/api/cry-detection/audio-file/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
        audio.onended = () => {
          setPlayingId(null);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('오디오 재생 실패:', error);
      setPlayingId(null);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/cry-detection/audio-file/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">오디오 파일을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="space-y-6 pb-20 px-4 pt-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">녹음된 오디오</h1>
          <p className="text-slate-600 mt-1">아기 울음 감지로 저장된 오디오 파일들</p>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3">
                <Volume2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-500">전체 파일</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.today}</p>
                  <p className="text-sm text-slate-500">오늘</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.averageConfidence}%</p>
                  <p className="text-sm text-slate-500">평균 신뢰도</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.thisWeek}</p>
                  <p className="text-sm text-slate-500">이번 주</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 오디오 파일 목록 */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="p-6 border-b border-slate-200/60">
            <h2 className="text-xl font-semibold text-slate-900">최근 녹음 파일</h2>
          </div>

          {audioFiles.length === 0 ? (
            <div className="p-8 text-center">
              <Volume2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">저장된 오디오 파일이 없습니다.</p>
              <p className="text-sm text-slate-400 mt-1">
                울음 감지 시 '--save-audio' 옵션으로 실행하면 파일이 저장됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/60">
              {audioFiles.map((file) => (
                <div key={file.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          file.confidence >= 80 ? 'bg-red-500' :
                          file.confidence >= 60 ? 'bg-amber-500' : 'bg-green-500'
                        }`}></div>
                        <h3 className="font-medium text-slate-900">
                          울음 감지 - 신뢰도 {file.confidence}%
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {file.source}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(file.timestamp).toLocaleString('ko-KR')}
                        </span>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {file.filePath?.split('/').pop()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handlePlay(file.id)}
                        disabled={playingId === file.id}
                        className={`p-2 rounded-lg transition-colors ${
                          playingId === file.id
                            ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                        }`}
                        title="재생"
                      >
                        <Play className={`w-5 h-5 ${playingId === file.id ? 'animate-pulse' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleDownload(file.id, file.filePath?.split('/').pop() || 'audio.wav')}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="다운로드"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* 신뢰도 바 */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>신뢰도</span>
                      <span>{file.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          file.confidence >= 80 ? 'bg-red-500' :
                          file.confidence >= 60 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${file.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 도움말 */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200/60 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 오디오 파일 저장 방법</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>라즈베리파이에서 다음 명령으로 오디오 저장을 활성화할 수 있습니다:</p>
            <code className="block bg-blue-100 text-blue-900 p-2 rounded font-mono text-xs">
              python babycry_detect.py --save-audio
            </code>
            <p className="text-blue-700">
              • 울음이 감지된 경우: <strong>detections/</strong> 폴더에 저장<br/>
              • 일반 오디오: <strong>continuous/</strong> 폴더에 1분마다 저장<br/>
              • 파일은 7일 후 자동 정리됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}