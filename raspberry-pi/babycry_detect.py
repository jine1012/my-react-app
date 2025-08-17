# raspberry-pi/babycry_detect.py
import numpy as np
import pyaudio
import librosa
import tensorflow as tf
import requests
import json
import time
import threading
from datetime import datetime
import queue
import argparse
import sys

class BabyCryDetector:
    def __init__(self, 
                 model_path='models/baby_cry_model.h5',
                 confidence_threshold=0.8,
                 sample_rate=22050,
                 chunk_duration=3.0,
                 nodejs_server='http://192.168.1.101:5000'):
        
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.sample_rate = sample_rate
        self.chunk_duration = chunk_duration
        self.nodejs_server = nodejs_server
        
        # 오디오 설정
        self.chunk_size = int(sample_rate * chunk_duration)
        self.audio_queue = queue.Queue()
        self.is_running = False
        
        # PyAudio 초기화
        self.audio = pyaudio.PyAudio()
        self.stream = None
        
        # 모델 로드 (실제 환경에서는 훈련된 모델 사용)
        self.model = self.load_model()
        
        print(f"🎵 울음 감지기 초기화 완료")
        print(f"   - 모델: {model_path}")
        print(f"   - 신뢰도 임계값: {confidence_threshold}")
        print(f"   - 샘플링 레이트: {sample_rate}Hz")
        print(f"   - 청크 길이: {chunk_duration}초")
    
    def load_model(self):
        """
        사전 훈련된 아기 울음 감지 모델 로드
        실제 환경에서는 TensorFlow/PyTorch 모델을 사용
        """
        try:
            # 실제 모델이 있다면 로드
            # model = tf.keras.models.load_model(self.model_path)
            # return model
            
            # 시뮬레이션용 더미 모델
            print("⚠️ 실제 모델이 없어 시뮬레이션 모드로 실행합니다.")
            return None
            
        except Exception as e:
            print(f"❌ 모델 로드 실패: {e}")
            print("📝 시뮬레이션 모드로 전환합니다.")
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
    
    def extract_features(self, audio_data):
        """
        오디오에서 특징 추출 (MFCC, 스펙트로그램 등)
        """
        try:
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
    
    def predict_cry(self, features):
        """
        특징 벡터를 바탕으로 울음 예측
        """
        if self.model is None:
            # 시뮬레이션: 랜덤 예측
            import random
            
            # 오디오 레벨 기반 간단한 휴리스틱
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
    
    def send_detection_event(self, confidence, audio_features=None):
        """
        Node.js 서버로 감지 이벤트 전송
        """
        try:
            event_data = {
                'timestamp': datetime.now().isoformat(),
                'confidence': round(confidence * 100, 2),  # 백분율로 변환
                'source': 'babycry_detect.py',
                'audio_features': audio_features.tolist() if audio_features is not None else None
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
    
    def process_audio_chunk(self, audio_data):
        """
        오디오 청크를 처리하여 울음 감지
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
            
            if is_cry:
                print(f"🔔 [{current_time}] 아기 울음 감지! (신뢰도: {confidence*100:.1f}%)")
                
                # Node.js 서버로 이벤트 전송
                self.send_detection_event(confidence, features)
                
                # 로컬 로그 저장
                self.log_detection(confidence)
                
            else:
                # 낮은 빈도로 정상 상태 로깅
                if int(time.time()) % 30 == 0:  # 30초마다
                    print(f"🔇 [{current_time}] 정상 상태 (신뢰도: {confidence*100:.1f}%)")
        
        except Exception as e:
            print(f"❌ 오디오 처리 오류: {e}")
    
    def log_detection(self, confidence):
        """
        감지 이벤트를 로컬 파일에 기록
        """
        try:
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'confidence': confidence,
                'type': 'baby_cry_detected'
            }
            
            with open('detection_log.json', 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
                
        except Exception as e:
            print(f"⚠️ 로그 저장 실패: {e}")
    
    def start_detection(self):
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
    
    def stop_detection(self):
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
    
    def test_microphone(self):
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

def main():
    parser = argparse.ArgumentParser(description='아기 울음 감지 시스템')
    parser.add_argument('--mode', choices=['detect', 'test'], default='detect',
                       help='실행 모드: detect (감지) 또는 test (마이크 테스트)')
    parser.add_argument('--confidence', type=float, default=0.8,
                       help='감지 신뢰도 임계값 (0.0-1.0)')
    parser.add_argument('--server', type=str, default='http://192.168.1.101:5000',
                       help='Node.js 서버 URL')
    
    args = parser.parse_args()
    
    # 감지기 인스턴스 생성
    detector = BabyCryDetector(
        confidence_threshold=args.confidence,
        nodejs_server=args.server
    )
    
    if args.mode == 'test':
        detector.test_microphone()
    else:
        try:
            detector.start_detection()
        except KeyboardInterrupt:
            print("\n👋 프로그램을 종료합니다.")
        finally:
            detector.stop_detection()

if __name__ == "__main__":
    main()