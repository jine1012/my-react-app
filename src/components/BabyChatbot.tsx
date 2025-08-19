// src/components/BabyChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertTriangle, Baby, Clock, RefreshCw, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useBabyAdvice } from '../hooks/useBabyAdvice';

interface BabyChatbotProps {
  babyAgeInMonths?: number;
  onAgeUpdate?: (age: number) => void;
}

export const BabyChatbot: React.FC<BabyChatbotProps> = ({ 
  babyAgeInMonths, 
  onAgeUpdate 
}) => {
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 🎤 음성 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [autoPlayTTS, setAutoPlayTTS] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  
  // 🎤 음성 관련 refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearChat, 
    lastResponse 
  } = useBabyAdvice(babyAgeInMonths);

  // 메시지 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // 🎤 음성 에러 자동 숨김
  useEffect(() => {
    if (voiceError) {
      const timer = setTimeout(() => setVoiceError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [voiceError]);

  // 🎤 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  // 초기 웰컴 메시지
  useEffect(() => {
    if (messages.length === 0) {
      // 자동으로 웰컴 메시지 추가
      const welcomeText = `안녕하세요! 👶 아기 울음 전문 상담사입니다.

아기가 울고 있어서 걱정이시군요. 함께 원인을 찾아보고 해결책을 찾아보겠습니다.

${babyAgeInMonths !== undefined 
  ? `현재 등록된 아기 월령: ${babyAgeInMonths}개월` 
  : '먼저 아기의 월령을 알려주시면 더 정확한 조언을 드릴 수 있어요.'}

어떤 도움이 필요하신가요?`;
    }
  }, [babyAgeInMonths]);

  // 🎤 새 응답이 왔을 때 자동 TTS 재생
  useEffect(() => {
    if (autoPlayTTS && lastResponse && !isSpeaking && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        playTTS(lastMessage.content);
      }
    }
  }, [messages, autoPlayTTS, isSpeaking]);

  const quickActions = [
    { text: "아기가 계속 울어요", icon: "😭" },
    { text: "배고픈 것 같아요", icon: "🍼" },
    { text: "기저귀를 확인했어요", icon: "👶" },
    { text: "잠을 안 자려고 해요", icon: "😴" },
    { text: "열이 있는 것 같아요", icon: "🌡️" },
    { text: "아픈 것 같아요", icon: "😰" }
  ];

  // 🎤 음성 녹음 시작
  const startRecording = async () => {
    try {
      setVoiceError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('녹음 시작 오류:', error);
      setVoiceError('마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
    }
  };

  // 🎤 음성 녹음 정지
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 🎤 녹음된 오디오 처리 (STT)
  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      setVoiceError('녹음된 오디오가 없습니다.');
      return;
    }

    setIsProcessingVoice(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: 'audio/webm' 
      });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/stt', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.text) {
        setInput(result.text);
        setShowQuickActions(false);
        // 자동으로 메시지 전송
        await handleVoiceMessage(result.text);
      } else {
        setVoiceError(result.error || '음성 인식에 실패했습니다.');
      }
    } catch (error) {
      console.error('STT 처리 오류:', error);
      setVoiceError('음성 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // 🎤 TTS 음성 재생
  const playTTS = async (text: string) => {
    try {
      setIsSpeaking(true);

      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          speed: 1.0
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          setVoiceError('음성 재생에 실패했습니다.');
        };

        await audio.play();
      } else {
        throw new Error('TTS 요청 실패');
      }
    } catch (error) {
      console.error('TTS 재생 오류:', error);
      setIsSpeaking(false);
    }
  };

  // 🎤 음성 재생 중지
  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  // 🎤 음성 메시지 처리
  const handleVoiceMessage = async (messageText: string) => {
    setInput('');
    setShowQuickActions(false);
    await sendMessage(messageText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setShowQuickActions(false);
    
    await sendMessage(messageText);
  };

  const handleQuickAction = async (text: string) => {
    setShowQuickActions(false);
    await sendMessage(text);
  };

  const handleRetry = async () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      if (lastUserMessage) {
        await sendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* 🎤 음성 설정 헤더 */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Baby className="text-blue-500" size={20} />
            <span className="font-semibold text-gray-700">아기 울음 상담사</span>
            {babyAgeInMonths !== undefined && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {babyAgeInMonths}개월
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            {/* 음성 선택 */}
            <select 
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1"
            >
              <option value="nova">Nova (여성)</option>
              <option value="shimmer">Shimmer (여성)</option>
              <option value="alloy">Alloy (중성)</option>
              <option value="echo">Echo (남성)</option>
            </select>
            
            {/* 자동 재생 토글 */}
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlayTTS}
                onChange={(e) => setAutoPlayTTS(e.target.checked)}
                className="w-3 h-3"
              />
              <span className="text-xs text-gray-600">자동재생</span>
            </label>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {/* 웰컴 메시지 */}
        {messages.length === 0 && !isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="text-blue-500" size={20} />
              <span className="text-blue-800 font-semibold">아기 울음 상담사</span>
            </div>
            <p className="text-blue-700 text-sm leading-relaxed">
              안녕하세요! 👶 아기 울음 전문 상담사입니다.<br />
              아기가 울고 있어서 걱정이시군요. 함께 원인을 찾아보고 해결책을 찾아보겠습니다.
              {babyAgeInMonths !== undefined && (
                <><br /><br />현재 등록된 아기 월령: <strong>{babyAgeInMonths}개월</strong></>
              )}
              <br /><br />어떤 도움이 필요하신가요?
              <br />
              <span className="text-xs bg-blue-100 px-2 py-1 rounded mt-2 inline-block">
                🎤 음성으로도 질문할 수 있어요!
              </span>
            </p>
          </div>
        )}

        {/* 메시지 표시 */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Baby size={16} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600">아기 상담사</span>
                  </div>
                  {/* 🎤 TTS 재생 버튼 */}
                  <button
                    onClick={() => playTTS(message.content)}
                    disabled={isSpeaking}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Volume2 size={12} />
                    듣기
                  </button>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
              
              {/* 응급상황 경고 */}
              {message.role === 'assistant' && lastResponse?.isEmergency && index === messages.length - 1 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">응급상황 감지</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    즉시 병원 방문이나 119 신고를 고려해보세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 답변 대기중 표시 - 개선된 메시지 */}
        {(isLoading || isProcessingVoice) && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Baby size={16} className="text-blue-500" />
                <span className="text-xs font-semibold text-blue-600">아기 상담사</span>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={16} />
                <span className="text-sm text-gray-600">
                  {isProcessingVoice ? '음성을 인식하고 있어요...' : '답변을 준비하고 있어요...'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                아기에게 맞는 조언을 찾고 있습니다 💭
              </p>
            </div>
          </div>
        )}
        
        {/* 에러 메시지 개선 */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 max-w-[90%]">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} />
                <span className="text-sm font-semibold">연결 문제가 발생했어요</span>
              </div>
              <p className="text-sm mb-3">{error}</p>
              
              {/* API 키 설정 안내 */}
              {error.includes('API 키') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                  <p className="text-xs text-yellow-800 font-medium mb-2">
                    💡 해결 방법:
                  </p>
                  <ol className="text-xs text-yellow-700 list-decimal list-inside space-y-1">
                    <li>프로젝트 루트에 <code className="bg-yellow-100 px-1 rounded">.env.local</code> 파일 생성</li>
                    <li><code className="bg-yellow-100 px-1 rounded">VITE_OPENAI_API_KEY=your_api_key</code> 추가</li>
                    <li>개발 서버 재시작</li>
                  </ol>
                  <p className="text-xs text-yellow-600 mt-2">
                    자세한 내용은 <code className="bg-yellow-100 px-1 rounded">API_SETUP.md</code> 파일을 참고하세요.
                  </p>
                </div>
              )}
              
              {/* 재시도 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs transition-colors"
                >
                  <RefreshCw size={12} />
                  다시 시도
                </button>
              </div>
              
              {/* 기본 대처법 제공 */}
              <div className="text-sm bg-white rounded p-3 mb-3 mt-3">
                <p className="font-medium mb-2">📋 일반적인 아기 울음 대처법:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>수유 시간 확인 (2-4시간 간격)</li>
                  <li>기저귀 상태 확인 및 교체</li>
                  <li>트림 시켜주기</li>
                  <li>포근하게 안아주며 달래기</li>
                  <li>조용하고 어두운 환경 만들기</li>
                </ol>
                <p className="mt-2 text-xs text-red-600 font-medium">
                  ⚠️ 지속적으로 울거나 평소와 다르다면 소아과에 문의하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 퀵 액션 버튼들 */}
        {showQuickActions && messages.length === 0 && !isLoading && (
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-600 font-medium">
              자주 묻는 질문을 선택해보세요
            </p>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.text)}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left group"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm text-gray-700 group-hover:text-blue-700">
                    {action.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🎤 음성 오류 메시지 */}
      {voiceError && (
        <div className="mx-4 mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">🎤 {voiceError}</span>
            <button onClick={() => setVoiceError(null)} className="text-red-500">✕</button>
          </div>
        </div>
      )}

      {/* 🎤 음성 컨트롤 + 입력 영역 */}
      <div className="border-t border-gray-200 p-4 bg-white space-y-3">
        {/* 음성 컨트롤 버튼들 */}
        <div className="flex items-center gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isProcessingVoice}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50`}
          >
            {isRecording ? (
              <>
                <MicOff size={16} />
                녹음 중지
              </>
            ) : (
              <>
                <Mic size={16} />
                음성 질문
              </>
            )}
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              <VolumeX size={16} />
              음성 정지
            </button>
          )}

          {/* 상태 표시 */}
          <div className="flex-1 text-center">
            {isRecording && (
              <span className="text-sm text-red-600 animate-pulse">🎤 말씀하세요...</span>
            )}
            {isSpeaking && (
              <span className="text-sm text-blue-600 animate-pulse">🔊 음성 재생 중...</span>
            )}
          </div>
        </div>

        {/* 텍스트 입력 */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="아기 상태를 자세히 설명해주세요... (또는 음성으로 질문하세요)"
            disabled={isLoading || isRecording}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isRecording}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
        
        {/* 입력 도움말 */}
        <p className="text-xs text-gray-500 text-center">
          💡 "아기가 30분째 울고 있어요", "수유 후에도 계속 울어요" 처럼 구체적으로 설명해주세요
        </p>
      </div>
    </div>
  );
};