#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jetson Nano Baby Monitor Server
아기 모니터링을 위한 Jetson Nano Flask 서버
"""

import os
import json
import time
import threading
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import cv2
import numpy as np
import pyaudio
import wave
import tempfile
import subprocess
import psutil
import GPUtil

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('jetson_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # CORS 활성화

# 전역 변수
detection_active = False
camera_active = False
recording_active = False
current_camera = 'normal'  # 'normal' 또는 'infrared'
audio_buffer = []
sensor_data = {
    'room_temperature': 23.5,
    'humidity': 45.0,
    'baby_temperature': 36.8,
    'timestamp': datetime.now().isoformat()
}

# Jetson Nano 하드웨어 정보
JETSON_MODEL = os.environ.get('JETSON_MODEL', 'Jetson Nano')
GPU_MEMORY = os.environ.get('GPU_MEMORY', '4GB')

class JetsonMonitor:
    """Jetson Nano 모니터링 클래스"""
    
    def __init__(self):
        self.camera = None
        self.audio_stream = None
        self.recording_thread = None
        
    def get_system_info(self):
        """시스템 정보 조회"""
        try:
            # CPU 사용률
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # 메모리 사용률
            memory = psutil.virtual_memory()
            
            # GPU 정보 (Jetson Nano)
            gpu_info = {
                'model': JETSON_MODEL,
                'memory': GPU_MEMORY,
                'temperature': self.get_gpu_temperature(),
                'utilization': self.get_gpu_utilization()
            }
            
            # 온도 센서 데이터 (시뮬레이션)
            sensor_data = {
                'room_temperature': round(20 + np.random.random() * 8, 1),
                'humidity': round(40 + np.random.random() * 30, 1),
                'baby_temperature': round(36.0 + np.random.random() * 2.5, 1),
                'timestamp': datetime.now().isoformat()
            }
            
            return {
                'cpu': {
                    'percent': cpu_percent,
                    'count': psutil.cpu_count(),
                    'freq': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent,
                    'used': memory.used
                },
                'gpu': gpu_info,
                'sensors': sensor_data,
                'uptime': time.time() - psutil.boot_time()
            }
        except Exception as e:
            logger.error(f"시스템 정보 조회 실패: {e}")
            return None
    
    def get_gpu_temperature(self):
        """GPU 온도 조회 (Jetson Nano)"""
        try:
            # Jetson Nano GPU 온도 조회
            result = subprocess.run(['cat', '/sys/class/thermal/thermal_zone0/temp'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                temp = int(result.stdout.strip()) / 1000.0
                return round(temp, 1)
        except:
            pass
        return round(45 + np.random.random() * 15, 1)  # 시뮬레이션
    
    def get_gpu_utilization(self):
        """GPU 사용률 조회 (Jetson Nano)"""
        try:
            # Jetson Nano GPU 사용률 조회
            result = subprocess.run(['cat', '/sys/devices/gpu.0/load'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                load = float(result.stdout.strip()) / 100.0
                return round(load * 100, 1)
        except:
            pass
        return round(np.random.random() * 100, 1)  # 시뮬레이션

# Jetson 모니터 인스턴스
jetson_monitor = JetsonMonitor()

@app.route('/health', methods=['GET'])
def health_check():
    """건강 체크 엔드포인트"""
    try:
        system_info = jetson_monitor.get_system_info()
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'jetson_model': JETSON_MODEL,
            'system_info': system_info,
            'services': {
                'detection': detection_active,
                'camera': camera_active,
                'recording': recording_active
            }
        })
    except Exception as e:
        logger.error(f"건강 체크 실패: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/start', methods=['POST'])
def start_detection():
    """울음 감지 시작"""
    global detection_active
    
    try:
        if detection_active:
            return jsonify({
                'status': 'already_running',
                'message': '울음 감지가 이미 실행 중입니다.'
            })
        
        detection_active = True
        logger.info("울음 감지 시작")
        
        # 실제 울음 감지 로직 시작 (여기에 구현)
        # threading.Thread(target=start_audio_detection, daemon=True).start()
        
        return jsonify({
            'status': 'started',
            'message': '울음 감지가 시작되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"울음 감지 시작 실패: {e}")
        return jsonify({
            'status': 'error',
            'message': f'울음 감지 시작 실패: {str(e)}'
        }), 500

@app.route('/stop', methods=['POST'])
def stop_detection():
    """울음 감지 중지"""
    global detection_active
    
    try:
        if not detection_active:
            return jsonify({
                'status': 'not_running',
                'message': '울음 감지가 실행되지 않고 있습니다.'
            })
        
        detection_active = False
        logger.info("울음 감지 중지")
        
        return jsonify({
            'status': 'stopped',
            'message': '울음 감지가 중지되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"울음 감지 중지 실패: {e}")
        return jsonify({
            'status': 'error',
            'message': f'울음 감지 중지 실패: {str(e)}'
        }), 500

@app.route('/status', methods=['GET'])
def get_status():
    """울음 감지 상태 조회"""
    return jsonify({
        'active': detection_active,
        'timestamp': datetime.now().isoformat(),
        'total_detections': len(audio_buffer),
        'camera_active': camera_active,
        'recording_active': recording_active
    })

@app.route('/sensors/all', methods=['GET'])
def get_all_sensors():
    """모든 센서 데이터 조회"""
    try:
        # 실제 센서 데이터 수집 (현재는 시뮬레이션)
        sensor_data.update({
            'room_temperature': round(20 + np.random.random() * 8, 1),
            'humidity': round(40 + np.random.random() * 30, 1),
            'baby_temperature': round(36.0 + np.random.random() * 2.5, 1),
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify(sensor_data)
        
    except Exception as e:
        logger.error(f"센서 데이터 조회 실패: {e}")
        return jsonify({
            'error': '센서 데이터를 가져올 수 없습니다.',
            'details': str(e)
        }), 500

@app.route('/camera/switch', methods=['POST'])
def switch_camera():
    """카메라 전환"""
    global current_camera
    
    try:
        data = request.get_json()
        camera_type = data.get('cameraType')
        
        if camera_type not in ['normal', 'infrared']:
            return jsonify({
                'error': '유효하지 않은 카메라 타입입니다.'
            }), 400
        
        current_camera = camera_type
        logger.info(f"카메라 전환: {camera_type}")
        
        return jsonify({
            'success': True,
            'camera_type': camera_type,
            'message': f'{camera_type} 카메라로 전환되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"카메라 전환 실패: {e}")
        return jsonify({
            'error': '카메라 전환에 실패했습니다.',
            'details': str(e)
        }), 500

@app.route('/recording/start', methods=['POST'])
def start_recording():
    """녹화 시작"""
    global recording_active
    
    try:
        if recording_active:
            return jsonify({
                'error': '녹화가 이미 진행 중입니다.'
            }), 400
        
        recording_active = True
        logger.info("녹화 시작")
        
        # 실제 녹화 로직 시작 (여기에 구현)
        # threading.Thread(target=start_video_recording, daemon=True).start()
        
        return jsonify({
            'success': True,
            'message': '녹화가 시작되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"녹화 시작 실패: {e}")
        return jsonify({
            'error': '녹화 시작에 실패했습니다.',
            'details': str(e)
        }), 500

@app.route('/recording/stop', methods=['POST'])
def stop_recording():
    """녹화 중지"""
    global recording_active
    
    try:
        if not recording_active:
            return jsonify({
                'error': '녹화가 진행되지 않고 있습니다.'
            }), 400
        
        recording_active = False
        logger.info("녹화 중지")
        
        return jsonify({
            'success': True,
            'message': '녹화가 중지되었습니다.',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"녹화 중지 실패: {e}")
        return jsonify({
            'error': '녹화 중지에 실패했습니다.',
            'details': str(e)
        }), 500

@app.route('/video/stream/<camera_type>')
def video_stream(camera_type):
    """비디오 스트림 (MJPEG)"""
    if camera_type not in ['normal', 'infrared']:
        return jsonify({'error': '유효하지 않은 카메라 타입입니다.'}), 400
    
    def generate_frames():
        """프레임 생성 (시뮬레이션)"""
        while True:
            # 실제 카메라 스트림 구현 (여기에 구현)
            # frame = get_camera_frame(camera_type)
            
            # 시뮬레이션 프레임
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(frame, f'{camera_type.upper()} Camera', (50, 240), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(frame, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 
                       (50, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            # JPEG 인코딩
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            
            # MJPEG 스트림 형식으로 전송
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            
            time.sleep(0.1)  # 10 FPS
    
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/download-audio', methods=['GET'])
def download_audio():
    """오디오 파일 다운로드"""
    try:
        file_path = request.args.get('filePath')
        
        if not file_path or not os.path.exists(file_path):
            return jsonify({
                'error': '파일을 찾을 수 없습니다.'
            }), 404
        
        return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        logger.error(f"오디오 파일 다운로드 실패: {e}")
        return jsonify({
            'error': '파일 다운로드에 실패했습니다.',
            'details': str(e)
        }), 500

@app.route('/update-settings', methods=['POST'])
def update_settings():
    """설정 업데이트"""
    try:
        data = request.get_json()
        confidence_threshold = data.get('confidenceThreshold')
        audio_saving = data.get('audioSaving')
        
        logger.info(f"설정 업데이트: threshold={confidence_threshold}, audio_saving={audio_saving}")
        
        # 실제 설정 적용 로직 (여기에 구현)
        
        return jsonify({
            'success': True,
            'message': '설정이 업데이트되었습니다.',
            'settings': {
                'confidenceThreshold': confidence_threshold,
                'audioSaving': audio_saving,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"설정 업데이트 실패: {e}")
        return jsonify({
            'error': '설정 업데이트에 실패했습니다.',
            'details': str(e)
        }), 500

@app.route('/system/status', methods=['GET'])
def get_system_status():
    """시스템 상태 조회"""
    try:
        system_info = jetson_monitor.get_system_info()
        return jsonify({
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'jetson_model': JETSON_MODEL,
            'system_info': system_info,
            'services': {
                'detection': detection_active,
                'camera': camera_active,
                'recording': recording_active
            }
        })
        
    except Exception as e:
        logger.error(f"시스템 상태 조회 실패: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    try:
        logger.info(f"Jetson Nano 서버 시작 - 모델: {JETSON_MODEL}")
        logger.info("서버가 http://0.0.0.0:5000 에서 실행됩니다.")
        
        # 개발 모드로 실행
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
        
    except KeyboardInterrupt:
        logger.info("서버가 중지되었습니다.")
    except Exception as e:
        logger.error(f"서버 실행 실패: {e}")
