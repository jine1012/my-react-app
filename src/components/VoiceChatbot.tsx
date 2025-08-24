// src/components/VoiceChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, Baby } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  audioUrl?: string;
}

interface VoiceSettings {
  voice: string;
  speed: number;
  autoPlay: boolean;
}

const VoiceChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 아기 돌봄 도우미입니다. 궁금한 것이 있으시면 음성이나 텍스트로 질문해주세요! 🍼',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: 'nova',
    speed: 1.0,
    autoPlay: true
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // 컴포넌트 언마운트 시 정리
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

  // 에러 메시지 자동 숨김
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      setError(null);
      
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
      setError('마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
    }
  };

  // 음성 녹음 정지
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 녹음된 오디오 처리 (STT)
  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('녹음된 오디오가 없습니다.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // 오디오 Blob 생성
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: 'audio/webm' 
      });

      // FormData로 서버에 전송
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/stt', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.text) {
        // 사용자 메시지 추가
        const userMessage: Message = {
          id: Date.now().toString(),
          text: result.text,
          sender: 'user',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // 챗봇 응답 요청
        await getChatResponse(result.text);
      } else {
        setError(result.error || '음성 인식에 실패했습니다.');
      }
    } catch (error) {
      console.error('STT 처리 오류:', error);
      setError('음성 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 텍스트 메시지 전송
  const sendTextMessage = async () => {
    if (!textInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textInput.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTextInput('');
    
    await getChatResponse(userMessage.text);
  };

  // 챗봇 응답 요청
  const getChatResponse = async (userMessage: string) => {
    setIsProcessing(true);
    
    try {
      // 기존 채팅 API 사용
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'baby_monitoring'
        }),
      });

      const result = await response.json();

      if (result.success) {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: result.response,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

        // TTS로 음성 재생
        if (voiceSettings.autoPlay) {
          await playTTS(result.response);
        }
      } else {
        setError(result.error || '챗봇 응답 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('채팅 응답 오류:', error);
      setError('챗봇 서비스에 연결할 수 없습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // TTS 음성 재생
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
          voice: voiceSettings.voice,
          speed: voiceSettings.speed
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
          setError('음성 재생에 실패했습니다.');
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

  // 음성 재생 중지
  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3">
          <Baby size={32} />
          <div>
            <h2 className="text-2xl font-bold">AI 아기 돌봄 도우미</h2>
            <p className="text-blue-100">음성과 텍스트로 언제든 질문하세요</p>
          </div>
        </div>
        
        {/* 음성 설정 */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <span>음성:</span>
            <select 
              value={voiceSettings.voice}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice: e.target.value }))}
              className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white"
            >
              <option value="nova">Nova (여성)</option>
              <option value="shimmer">Shimmer (여성)</option>
              <option value="alloy">Alloy (중성)</option>
              <option value="echo">Echo (남성)</option>
              <option value="fable">Fable (영국식)</option>
              <option value="onyx">Onyx (남성)</option>
            </select>
          </label>
          
          <label className="flex items-center gap-2">
            <span>속도:</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceSettings.speed}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
              className="w-20"
            />
            <span>{voiceSettings.speed}x</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={voiceSettings.autoPlay}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
            />
            <span>자동 음성 재생</span>
          </label>
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                  <Baby size={16} />
                  <span>아기 돌봄 도우미</span>
                </div>
              )}
              
              <p className="text-sm leading-relaxed">{message.text}</p>
              
              {message.sender === 'bot' && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => playTTS(message.text)}
                    disabled={isSpeaking}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                  >
                    <Volume2 size={12} />
                    다시 듣기
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 처리 중 표시 */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={16} />
                <span className="text-sm text-gray-600">
                  {isRecording ? '음성을 듣고 있어요...' : '답변을 준비하고 있어요...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <span className="text-sm">⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-200">
        {/* 음성 컨트롤 */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } disabled:opacity-50`}
          >
            {isRecording ? (
              <>
                <MicOff size={20} />
                녹음 중지
              </>
            ) : (
              <>
                <Mic size={20} />
                음성으로 질문
              </>
            )}
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            >
              <VolumeX size={16} />
              음성 정지
            </button>
          )}

          <div className="flex-1 text-center">
            {isRecording && (
              <div className="text-sm text-red-600 animate-pulse">
                🎤 말씀하세요...
              </div>
            )}
            {isSpeaking && (
              <div className="text-sm text-blue-600 animate-pulse">
                🔊 음성 재생 중...
              </div>
            )}
          </div>
        </div>

        {/* 텍스트 입력 */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="텍스트로 질문하기... (Enter: 전송, Shift+Enter: 줄바꿈)"
              className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {textInput.length}/500
            </div>
          </div>
          
          <button
            onClick={sendTextMessage}
            disabled={!textInput.trim() || isProcessing}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={16} />
            전송
          </button>
        </div>

        {/* 빠른 질문 버튼들 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            '아기가 자꾸 울어요',
            '분유량이 궁금해요',
            '수면 패턴 조언',
            '기저귀 갈아주는 시기',
            '예방접종 일정'
          ].map((question) => (
            <button
              key={question}
              onClick={() => {
                setTextInput(question);
                setTimeout(() => sendTextMessage(), 100);
              }}
              disabled={isProcessing}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceChatbot;