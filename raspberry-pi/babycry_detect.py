#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
아기 울음 감지 시스템
실시간 마이크 입력을 통해 아기 울음을 감지하고 Node.js 서버로 이벤트를 전송합니다.

사용법:
    python babycry_detect.py                    # 기본 감지 모드
    python babycry_detect.py --save-audio       # 오디오 저장 모드
    python babycry_detect.py --mode test        # 마이크 테스트 모드
"""

import numpy as np
import pyaudio
import threading
import queue
import time
import json
import requests
import argparse
import os
import wave
import subprocess
from datetime import datetime
from typing import Optional, Tuple, Any
import signal
import sys

try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    print("⚠️ librosa가 설치되지 않았습니다. 시뮬레이션 모드로 실행됩니다.")
    print("설치 방법: pip install librosa")
    HAS_LIBROSA = False

try:
    import tensorflow as tf
    HAS_TENSORFLOW = True
except ImportError:
    print("⚠️ TensorFlow가 설치되지 않았습니다. 시뮬레이션 모드로 실행됩니다.")
    print("설치 방법: pip install tensorflow")
    HAS_TENSORFLOW = False


class BabyCryDetector:
    """
    아기 울음 감지 시스템
    
    실시간 오디오 스트림을 분석하여 아기 울음을 감지하고,
    감지 결과를 Node.js 서버로 전송합니다.
    """
    
    def __init__(self, 
                 confidence_threshold: float = 0.8,
                 nodejs_server: str = 'http://192.168.0.4:5000',
                 save_audio: bool = False,
                 sample_rate: int = 16000,
                 chunk_size: int = 8192):
        """
        감지기 초기화
        
        Args:
            confidence_threshold: 감지 신뢰도 임계값 (0.0-1.0)
            nodejs_server: Node.js 서버 URL
            save_audio: 오디오 파일 저장 여부
            sample_rate: 오디오 샘플링 레이트
            chunk_size: 오디오 처리 청크 크기
        """
        self.confidence_threshold = confidence_threshold
        self.nodejs_server = nodejs_server
        self.save_audio = save_audio
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        
        # 오디오 관련 변수
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.audio_queue = queue.Queue(maxsize=50)
        self.is_running = False
        
        # ML 모델 (있는 경우)
        self.model = None
        
        # 오디오 저장 설정
        self.audio_save_path = "recorded_audio"
        if self.save_audio:
            self._setup_audio_directories()
        
        # 시그널 핸들러 설정
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        print(f"🎙️ 아기 울음 감지 시스템 초기화")
        print(f"   - 신뢰도 임계값: {confidence_threshold}")
        print(f"   - Node.js 서버: {nodejs_server}")
        print(f"   - 오디오 저장: {'활성화' if save_audio else '비활성화'}")
        print(f"   - 샘플링 레이트: {sample_rate}Hz")
        
        # ML 모델 로드 시도
        self._load_model()
    
    def _setup_audio_directories(self) -> None:
        """오디오 저장 디렉토리 설정"""
        try:
            os.makedirs(self.audio_save_path, exist_ok=True)
            os.makedirs(f"{self.audio_save_path}/detections", exist_ok=True)
            os.makedirs(f"{self.audio_save_path}/continuous", exist_ok=True)
            print(f"📁 오디오 저장 디렉토리 생성: {self.audio_save_path}")
        except Exception as e:
            print(f"❌ 디렉토리 생성 실패: {e}")
            self.save_audio = False
    
    def _signal_handler(self, signum, frame):
        """시그널 핸들러 (Ctrl+C 등)"""
        print(f"\n📡 시그널 {signum} 수신됨. 정리 중...")
        self.stop_detection()
        sys.exit(0)
    
    def _load_model(self) -> None:
        """ML 모델 로드"""
        try:
            # 모델 파일이 있는 경우 로드
            model_path = "models/baby_cry_model.h5"
            if os.path.exists(model_path) and HAS_TENSORFLOW:
                self.model = tf.keras.models.load_model(model_path)
                print(f"✅ ML 모델 로드 성공: {model_path}")
            else:
                print("📝 ML 모델이 없습니다. 시뮬레이션 모드로 실행됩니다.")
                self.model = None
                
        except Exception as e:
            print(f"❌ 모델 로드 실패: {e}")
            print("📝 시뮬레이션 모드로 전환합니다.")
            self.model = None
    
    def save_audio_chunk(self, audio_data: np.ndarray, detection_result: bool = False) -> Optional[str]:
        """
        오디오 청크를 WAV 파일로 저장
        
        Args:
            audio_data: 저장할 오디오 데이터
            detection_result: 울음이 감지되었는지 여부
            
        Returns:
            저장된 파일 경로 또는 None
        """
        if not self.save_audio:
            return None
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
            
            if detection_result:
                # 울음이 감지된 경우 특별 폴더에 저장
                filename = f"{self.audio_save_path}/detections/cry_detected_{timestamp}.wav"
            else:
                # 일반 오디오는 연속 녹음 폴더에 저장
                filename = f"{self.audio_save_path}/continuous/audio_{timestamp}.wav"
            
            # WAV 파일로 저장
            with wave.open(filename, 'wb') as wav_file:
                wav_file.setnchannels(1)  # 모노
                wav_file.setsampwidth(4)  # 32-bit float를 위해 4바이트
                wav_file.setframerate(self.sample_rate)
                
                # float32를 int32로 변환하여 저장
                audio_int = (audio_data * 2147483647).astype(np.int32)
                wav_file.writeframes(audio_int.tobytes())
            
            print(f"💾 오디오 저장: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ 오디오 저장 실패: {e}")
            return None
    
    def audio_callback(self, in_data, frame_count, time_info, status):
        """
        실시간 오디오 데이터 수집 콜백
        """
        if status:
            print(f"⚠️ 오디오 상태 경고: {status}")
        
        # 오디오 데이터를 큐에 추가
        audio_data = np.frombuffer(in_data, dtype=np.float32)
        
        if not self.audio_queue.full():
            self.audio_queue.put(audio_data)
        
        return (in_data, pyaudio.paContinue)
    
    def extract_features(self, audio_data: np.ndarray) -> Optional[np.ndarray]:
        """
        오디오에서 특징 추출 (MFCC, 스펙트로그램 등)
        
        Args:
            audio_data: 입력 오디오 데이터
            
        Returns:
            추출된 특징 벡터 또는 None
        """
        try:
            if not HAS_LIBROSA:
                # librosa가 없는 경우 간단한 특징 사용
                features = np.array([
                    np.mean(audio_data),  # 평균
                    np.std(audio_data),   # 표준편차
                    np.max(audio_data),   # 최대값
                    np.min(audio_data),   # 최소값
                    np.mean(np.abs(audio_data))  # 절대값 평균
                ])
                return features.reshape(1, -1)
            
            # MFCC 특징 추출
            mfccs = librosa.feature.mfcc(
                y=audio_data, 
                sr=self.sample_rate, 
                n_mfcc=13
            )
            
            # 추가 특징들
            spectral_centroid = librosa.feature.spectral_centroid(
                y=audio_data, 
                sr=self.sample_rate
            )
            
            zero_crossing_rate = librosa.feature.zero_crossing_rate(audio_data)
            
            # 특징 벡터 결합
            features = np.concatenate([
                np.mean(mfccs, axis=1),
                np.mean(spectral_centroid),
                np.mean(zero_crossing_rate)
            ])
            
            return features.reshape(1, -1)
            
        except Exception as e:
            print(f"❌ 특징 추출 실패: {e}")
            return None
    
    def predict_cry(self, features: np.ndarray) -> Tuple[bool, float]:
        """
        특징 벡터를 바탕으로 울음 예측
        
        Args:
            features: 입력 특징 벡터
            
        Returns:
            (울음 여부, 신뢰도)
        """
        if self.model is None:
            # 시뮬레이션: 오디오 레벨 기반 간단한 휴리스틱
            import random
            
            # 오디오 레벨 기반 간단한 휴리스틱
            if len(features.shape) > 1:
                audio_level = np.mean(np.abs(features))
            else:
                audio_level = np.mean(np.abs(features))
            
            if audio_level > 0.1:  # 일정 볼륨 이상
                confidence = random.uniform(0.6, 0.95)
                is_cry = confidence > self.confidence_threshold
            else:
                confidence = random.uniform(0.1, 0.4)
                is_cry = False
            
            return is_cry, confidence
        
        else:
            # 실제 모델 예측
            try:
                prediction = self.model.predict(features)[0]
                confidence = float(prediction[0])
                is_cry = confidence > self.confidence_threshold
                
                return is_cry, confidence
                
            except Exception as e:
                print(f"❌ 모델 예측 실패: {e}")
                return False, 0.0
    
    def send_detection_event(self, confidence: float, audio_features: Optional[np.ndarray] = None, audio_file_path: Optional[str] = None) -> bool:
        """
        Node.js 서버로 감지 이벤트 전송
        
        Args:
            confidence: 감지 신뢰도
            audio_features: 오디오 특징 (선택사항)
            audio_file_path: 저장된 오디오 파일 경로 (선택사항)
            
        Returns:
            전송 성공 여부
        """
        try:
            event_data = {
                'timestamp': datetime.now().isoformat(),
                'confidence': round(confidence * 100, 2),  # 백분율로 변환
                'source': 'babycry_detect.py',
                'audio_features': audio_features.tolist() if audio_features is not None else None,
                'audio_file_path': audio_file_path  # 저장된 파일 경로 추가
            }
            
            response = requests.post(
                f'{self.nodejs_server}/api/cry-detection/detection-event',
                json=event_data,
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ 감지 이벤트 전송 성공: {confidence*100:.1f}%")
                return True
            else:
                print(f"⚠️ 이벤트 전송 실패: HTTP {response.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            print("⚠️ 서버 응답 시간 초과")
            return False
        except requests.exceptions.ConnectionError:
            print("⚠️ 서버 연결 실패")
            return False
        except Exception as e:
            print(f"❌ 이벤트 전송 오류: {e}")
            return False
    
    def log_detection(self, confidence: float, audio_file_path: Optional[str] = None) -> None:
        """
        감지 이벤트를 로컬 파일에 기록
        
        Args:
            confidence: 감지 신뢰도
            audio_file_path: 저장된 오디오 파일 경로 (선택사항)
        """
        try:
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'confidence': confidence,
                'type': 'baby_cry_detected',
                'audio_file': audio_file_path
            }
            
            with open('detection_log.json', 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
                
        except Exception as e:
            print(f"⚠️ 로그 저장 실패: {e}")
    
    def process_audio_chunk(self, audio_data: np.ndarray) -> None:
        """
        오디오 청크를 처리하여 울음 감지
        
        Args:
            audio_data: 처리할 오디오 데이터
        """
        try:
            # 특징 추출
            features = self.extract_features(audio_data)
            if features is None:
                return
            
            # 울음 예측
            is_cry, confidence = self.predict_cry(features)
            
            # 현재 시간
            current_time = datetime.now().strftime("%H:%M:%S")
            
            # 오디오 저장 (울음 감지된 경우 특별 저장)
            saved_file = None
            if self.save_audio:
                if is_cry:
                    saved_file = self.save_audio_chunk(audio_data, detection_result=True)
                elif int(time.time()) % 60 == 0:  # 1분마다 일반 오디오도 저장
                    saved_file = self.save_audio_chunk(audio_data, detection_result=False)
            
            if is_cry:
                print(f"🔔 [{current_time}] 아기 울음 감지! (신뢰도: {confidence*100:.1f}%)")
                if saved_file:
                    print(f"   📁 저장됨: {saved_file}")
                
                # Node.js 서버로 이벤트 전송 (파일 경로 포함)
                self.send_detection_event(confidence, features, saved_file)
                
                # 로컬 로그 저장 (파일 경로 포함)
                self.log_detection(confidence, saved_file)
                
            else:
                # 낮은 빈도로 정상 상태 로깅
                if int(time.time()) % 30 == 0:  # 30초마다
                    print(f"🔇 [{current_time}] 정상 상태 (신뢰도: {confidence*100:.1f}%)")
        
        except Exception as e:
            print(f"❌ 오디오 처리 오류: {e}")
    
    def start_detection(self) -> None:
        """
        울음 감지 시작
        """
        try:
            print("🚀 울음 감지 시작...")
            
            # 오디오 스트림 시작
            self.stream = self.audio.open(
                format=pyaudio.paFloat32,
                channels=1,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=1024,
                stream_callback=self.audio_callback
            )
            
            self.stream.start_stream()
            self.is_running = True
            
            print(f"🎙️ 마이크 스트림 시작됨 (샘플링: {self.sample_rate}Hz)")
            print("🔄 울음 감지 중... (Ctrl+C로 중지)")
            
            # 메인 처리 루프
            audio_buffer = []
            
            while self.is_running:
                try:
                    # 큐에서 오디오 데이터 가져오기
                    if not self.audio_queue.empty():
                        chunk = self.audio_queue.get(timeout=1)
                        audio_buffer.extend(chunk)
                        
                        # 충분한 데이터가 모이면 처리
                        if len(audio_buffer) >= self.chunk_size:
                            audio_data = np.array(audio_buffer[:self.chunk_size])
                            audio_buffer = audio_buffer[self.chunk_size:]
                            
                            # 백그라운드에서 처리
                            processing_thread = threading.Thread(
                                target=self.process_audio_chunk,
                                args=(audio_data,),
                                daemon=True
                            )
                            processing_thread.start()
                    
                    time.sleep(0.1)  # CPU 사용량 조절
                    
                except queue.Empty:
                    continue
                except KeyboardInterrupt:
                    print("\n🛑 사용자에 의해 중단됨")
                    break
                except Exception as e:
                    print(f"❌ 메인 루프 오류: {e}")
                    time.sleep(1)
        
        except Exception as e:
            print(f"❌ 울음 감지 시작 실패: {e}")
        
        finally:
            self.stop_detection()
    
    def stop_detection(self) -> None:
        """
        울음 감지 중지
        """
        print("🛑 울음 감지 중지 중...")
        
        self.is_running = False
        
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        if self.audio:
            self.audio.terminate()
        
        print("✅ 울음 감지 완전히 중지됨")
    
    def test_microphone(self) -> None:
        """
        마이크 연결 테스트
        """
        print("🎤 마이크 테스트 중...")
        
        try:
            # 짧은 녹음 테스트
            test_stream = self.audio.open(
                format=pyaudio.paFloat32,
                channels=1,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=1024
            )
            
            print("5초 동안 소리를 내보세요...")
            
            for i in range(50):  # 5초간 테스트
                data = test_stream.read(1024)
                audio_data = np.frombuffer(data, dtype=np.float32)
                volume = np.sqrt(np.mean(audio_data**2))
                
                print(f"\r볼륨 레벨: {'█' * int(volume * 50):<50} {volume:.4f}", end='')
                time.sleep(0.1)
            
            test_stream.close()
            print("\n✅ 마이크 테스트 완료")
            
        except Exception as e:
            print(f"❌ 마이크 테스트 실패: {e}")
    
    def cleanup_old_files(self, days_to_keep: int = 7) -> None:
        """
        오래된 오디오 파일 정리
        
        Args:
            days_to_keep: 보관할 일수
        """
        if not self.save_audio:
            return
        
        try:
            cutoff_time = time.time() - (days_to_keep * 24 * 60 * 60)
            
            for folder in ['detections', 'continuous']:
                folder_path = f"{self.audio_save_path}/{folder}"
                if os.path.exists(folder_path):
                    for filename in os.listdir(folder_path):
                        file_path = os.path.join(folder_path, filename)
                        if os.path.isfile(file_path) and os.path.getctime(file_path) < cutoff_time:
                            os.remove(file_path)
                            print(f"🗑️ 오래된 파일 삭제: {filename}")
                            
        except Exception as e:
            print(f"⚠️ 파일 정리 실패: {e}")


def main():
    """메인 실행 함수"""
    parser = argparse.ArgumentParser(description='아기 울음 감지 시스템')
    parser.add_argument('--mode', choices=['detect', 'test'], default='detect',
                       help='실행 모드: detect (감지) 또는 test (마이크 테스트)')
    parser.add_argument('--confidence', type=float, default=0.8,
                       help='감지 신뢰도 임계값 (0.0-1.0)')
    parser.add_argument('--server', type=str, default='http://192.168.0.4:5000',
                       help='Node.js 서버 URL')
    parser.add_argument('--save-audio', action='store_true',
                       help='오디오 파일 저장 활성화')
    parser.add_argument('--sample-rate', type=int, default=16000,
                       help='오디오 샘플링 레이트 (Hz)')
    parser.add_argument('--chunk-size', type=int, default=8192,
                       help='오디오 처리 청크 크기')
    
    args = parser.parse_args()
    
    # 감지기 인스턴스 생성
    detector = BabyCryDetector(
        confidence_threshold=args.confidence,
        nodejs_server=args.server,
        save_audio=args.save_audio,
        sample_rate=args.sample_rate,
        chunk_size=args.chunk_size
    )
    
    if args.mode == 'test':
        detector.test_microphone()
    else:
        try:
            # 시작 시 오래된 파일 정리
            if args.save_audio:
                detector.cleanup_old_files()
            
            detector.start_detection()
        except KeyboardInterrupt:
            print("\n👋 프로그램을 종료합니다.")
        finally:
            detector.stop_detection()


if __name__ == "__main__":
    main()