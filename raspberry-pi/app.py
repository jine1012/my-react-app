# raspberry-pi/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import threading
import time
import json
import requests
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)  # React 앱에서의 요청 허용

# 전역 변수로 프로세스 상태 관리
cry_detection_process = None
detection_active = False
detection_thread = None
stop_detection = False

# 설정 파일 import
from config.server_config import NODEJS_SERVER_URL, FLASK_HOST, FLASK_PORT, CORS_ORIGINS, EVENT_SEND_TIMEOUT

# Node.js 서버 설정 (감지 이벤트 전송용)
NODEJS_SERVER = NODEJS_SERVER_URL

def send_detection_event(confidence=0.85, audio_data=None):
    """
    울음 감지 시 Node.js 서버로 이벤트 전송
    """
    try:
        event_data = {
            'timestamp': datetime.now().isoformat(),
            'confidence': confidence,
            'audioData': audio_data,
            'source': 'raspberry-pi'
        }
        
        response = requests.post(
            f'{NODEJS_SERVER}/api/cry-detection/detection-event',
            json=event_data,
            timeout=EVENT_SEND_TIMEOUT
        )
        
        if response.status_code == 200:
            print(f"✅ 울음 감지 이벤트 전송 성공: {confidence}%")
        else:
            print(f"⚠️ 이벤트 전송 실패: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 이벤트 전송 오류: {e}")

def detection_worker():
    """
    실제 울음 감지를 수행하는 백그라운드 스레드
    이 함수는 babycry_detect.py의 로직을 대체하거나 호출합니다.
    """
    global stop_detection
    print("🎵 울음 감지 스레드 시작됨")
    
    while not stop_detection:
        try:
            # 실제 환경에서는 여기에 마이크 입력 처리 및 ML 모델 추론 로직이 들어갑니다
            # 예시: babycry_detect.py 스크립트 호출 또는 직접 구현
            
            # 시뮬레이션: 10초마다 랜덤하게 울음 감지 (테스트용)
            time.sleep(10)
            
            if not stop_detection:
                # 실제로는 ML 모델의 예측 결과를 사용
                import random
                if random.random() < 0.3:  # 30% 확률로 울음 감지 시뮬레이션
                    confidence = random.randint(75, 95)
                    print(f"🔔 아기 울음 감지! (신뢰도: {confidence}%)")
                    send_detection_event(confidence)
                    
        except Exception as e:
            print(f"❌ 감지 프로세스 오류: {e}")
            time.sleep(5)
    
    print("🔇 울음 감지 스레드 종료됨")

@app.route('/start', methods=['POST'])
def start_detection():
    """
    울음 감지 시작 엔드포인트
    """
    global cry_detection_process, detection_active, detection_thread, stop_detection
    
    try:
        if detection_active:
            return jsonify({
                'status': 'already_running',
                'message': '울음 감지가 이미 실행 중입니다.',
                'timestamp': datetime.now().isoformat()
            })
        
        print("🚀 울음 감지 시작 요청 받음")
        
        # 방법 1: 별도 프로세스로 babycry_detect.py 실행
        # cry_detection_process = subprocess.Popen(['python3', 'babycry_detect.py'])
        
        # 방법 2: 백그라운드 스레드로 실행 (권장)
        stop_detection = False
        detection_thread = threading.Thread(target=detection_worker, daemon=True)
        detection_thread.start()
        
        detection_active = True
        
        return jsonify({
            'status': 'started',
            'message': '울음 감지가 시작되었습니다.',
            'timestamp': datetime.now().isoformat(),
            'method': 'background_thread'
        })
        
    except Exception as e:
        print(f"❌ 울음 감지 시작 실패: {e}")
        return jsonify({
            'status': 'error',
            'message': f'울음 감지 시작에 실패했습니다: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/stop', methods=['POST'])
def stop_detection():
    """
    울음 감지 중지 엔드포인트
    """
    global cry_detection_process, detection_active, detection_thread, stop_detection
    
    try:
        if not detection_active:
            return jsonify({
                'status': 'already_stopped',
                'message': '울음 감지가 이미 중지되어 있습니다.',
                'timestamp': datetime.now().isoformat()
            })
        
        print("🛑 울음 감지 중지 요청 받음")
        
        # 방법 1: 프로세스 종료
        if cry_detection_process:
            cry_detection_process.terminate()
            cry_detection_process.wait()
            cry_detection_process = None
        
        # 방법 2: 스레드 중지
        stop_detection = True
        if detection_thread and detection_thread.is_alive():
            detection_thread.join(timeout=5)  # 최대 5초 대기
        
        detection_active = False
        
        return jsonify({
            'status': 'stopped',
            'message': '울음 감지가 중지되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ 울음 감지 중지 실패: {e}")
        return jsonify({
            'status': 'error',
            'message': f'울음 감지 중지에 실패했습니다: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/status', methods=['GET'])
def get_status():
    """
    현재 울음 감지 상태 조회
    """
    process_status = 'running' if detection_active else 'stopped'
    
    # 시스템 정보 수집
    import psutil
    cpu_usage = psutil.cpu_percent(interval=1)
    memory_info = psutil.virtual_memory()
    
    return jsonify({
        'isActive': detection_active,
        'status': process_status,
        'timestamp': datetime.now().isoformat(),
        'system': {
            'cpu_usage': f"{cpu_usage}%",
            'memory_usage': f"{memory_info.percent}%",
            'available_memory': f"{memory_info.available / 1024 / 1024:.1f}MB"
        },
        'detection_info': {
            'thread_alive': detection_thread.is_alive() if detection_thread else False,
            'process_id': cry_detection_process.pid if cry_detection_process else None
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """
    서버 상태 확인 엔드포인트
    """
    return jsonify({
        'status': 'healthy',
        'service': 'raspberry-pi-cry-detection',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'detection_active': detection_active,
        'nodejs_server': NODEJS_SERVER
    })

@app.route('/test-microphone', methods=['GET'])
def test_microphone():
    """
    마이크 연결 테스트
    """
    try:
        import pyaudio
        
        # 마이크 장치 목록 조회
        p = pyaudio.PyAudio()
        devices = []
        
        for i in range(p.get_device_count()):
            device_info = p.get_device_info_by_index(i)
            if device_info['maxInputChannels'] > 0:  # 입력 장치만
                devices.append({
                    'index': i,
                    'name': device_info['name'],
                    'channels': device_info['maxInputChannels'],
                    'sample_rate': device_info['defaultSampleRate']
                })
        
        p.terminate()
        
        return jsonify({
            'status': 'success',
            'microphone_available': len(devices) > 0,
            'devices': devices,
            'timestamp': datetime.now().isoformat()
        })
        
    except ImportError:
        return jsonify({
            'status': 'error',
            'message': 'PyAudio가 설치되지 않았습니다.',
            'timestamp': datetime.now().isoformat()
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'마이크 테스트 실패: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/config', methods=['GET', 'POST'])
def manage_config():
    """
    감지 설정 관리 (민감도, 임계값 등)
    """
    config_file = 'detection_config.json'
    
    if request.method == 'GET':
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
        except FileNotFoundError:
            # 기본 설정
            config = {
                'sensitivity': 0.7,
                'confidence_threshold': 0.8,
                'sample_rate': 44100,
                'chunk_size': 1024,
                'detection_interval': 1.0
            }
        
        return jsonify({
            'status': 'success',
            'config': config,
            'timestamp': datetime.now().isoformat()
        })
    
    elif request.method == 'POST':
        try:
            new_config = request.get_json()
            
            # 설정 검증
            if 'sensitivity' in new_config:
                if not 0 <= new_config['sensitivity'] <= 1:
                    raise ValueError('민감도는 0과 1 사이의 값이어야 합니다.')
            
            # 설정 저장
            with open(config_file, 'w') as f:
                json.dump(new_config, f, indent=2)
            
            return jsonify({
                'status': 'success',
                'message': '설정이 저장되었습니다.',
                'config': new_config,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'설정 저장 실패: {str(e)}',
                'timestamp': datetime.now().isoformat()
            }), 400

# 애플리케이션 종료 시 정리
def cleanup():
    """
    애플리케이션 종료 시 프로세스 정리
    """
    global cry_detection_process, detection_active, stop_detection
    
    print("🧹 애플리케이션 종료 - 정리 작업 수행 중...")
    
    stop_detection = True
    detection_active = False
    
    if cry_detection_process:
        cry_detection_process.terminate()
        cry_detection_process.wait()

import atexit
atexit.register(cleanup)

if __name__ == "__main__":
    print("🥧 라즈베리파이 울음 감지 서버 시작")
    print(f"🔗 Node.js 서버: {NODEJS_SERVER}")
    print("📡 엔드포인트:")
    print("  - POST /start    : 울음 감지 시작")
    print("  - POST /stop     : 울음 감지 중지") 
    print("  - GET  /status   : 상태 조회")
    print("  - GET  /health   : 헬스 체크")
    print("  - GET  /test-microphone : 마이크 테스트")
    print("  - GET/POST /config : 설정 관리")
    
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=True)