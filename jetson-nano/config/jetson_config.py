#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Jetson Nano 설정 파일
아기 모니터링을 위한 Jetson Nano 설정
"""

import os
from pathlib import Path

# Jetson Nano 기본 설정
JETSON_CONFIG = {
    # 하드웨어 정보
    'model': os.environ.get('JETSON_MODEL', 'Jetson Nano'),
    'gpu_memory': os.environ.get('GPU_MEMORY', '4GB'),
    'cpu_cores': os.environ.get('CPU_CORES', '4'),
    
    # 네트워크 설정
    'host': os.environ.get('JETSON_HOST', '0.0.0.0'),
    'port': int(os.environ.get('JETSON_PORT', '5000')),
    
    # 카메라 설정
    'camera': {
        'normal': {
            'device_id': 0,
            'width': 640,
            'height': 480,
            'fps': 30,
            'codec': 'MJPG'
        },
        'infrared': {
            'device_id': 1,
            'width': 640,
            'height': 480,
            'fps': 30,
            'codec': 'MJPG'
        }
    },
    
    # 오디오 설정
    'audio': {
        'sample_rate': 16000,
        'channels': 1,
        'chunk_size': 8192,
        'format': 'int16'
    },
    
    # 센서 설정
    'sensors': {
        'temperature': {
            'enabled': True,
            'update_interval': 5,  # 초
            'threshold': {
                'low': 18.0,
                'high': 30.0
            }
        },
        'humidity': {
            'enabled': True,
            'update_interval': 5,  # 초
            'threshold': {
                'low': 30.0,
                'high': 70.0
            }
        }
    },
    
    # 울음 감지 설정
    'cry_detection': {
        'enabled': True,
        'confidence_threshold': 0.8,
        'audio_saving': True,
        'model_path': 'models/baby_cry_detection.h5',
        'sample_duration': 3,  # 초
        'overlap': 0.5  # 오버랩 비율
    },
    
    # 녹화 설정
    'recording': {
        'enabled': True,
        'format': 'mp4',
        'codec': 'H264',
        'quality': 'high',
        'max_duration': 3600,  # 초 (1시간)
        'storage_path': 'recordings/'
    },
    
    # 로깅 설정
    'logging': {
        'level': 'INFO',
        'file': 'logs/jetson_server.log',
        'max_size': '10MB',
        'backup_count': 5
    },
    
    # 저장소 설정
    'storage': {
        'base_path': '/home/nano/baby_monitor',
        'audio_path': 'audio/',
        'video_path': 'video/',
        'logs_path': 'logs/',
        'models_path': 'models/',
        'temp_path': 'temp/'
    },
    
    # 보안 설정
    'security': {
        'cors_enabled': True,
        'allowed_origins': ['*'],
        'api_key_required': False,
        'rate_limit': {
            'enabled': True,
            'max_requests': 100,
            'window': 60  # 초
        }
    },
    
    # 성능 설정
    'performance': {
        'max_threads': 4,
        'gpu_acceleration': True,
        'memory_limit': '2GB',
        'cpu_limit': 80  # %
    }
}

# 환경별 설정
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')

if ENVIRONMENT == 'production':
    # 프로덕션 환경 설정
    JETSON_CONFIG['logging']['level'] = 'WARNING'
    JETSON_CONFIG['security']['cors_enabled'] = False
    JETSON_CONFIG['security']['allowed_origins'] = ['https://yourdomain.com']
    JETSON_CONFIG['performance']['max_threads'] = 8
    JETSON_CONFIG['performance']['memory_limit'] = '4GB'

elif ENVIRONMENT == 'testing':
    # 테스트 환경 설정
    JETSON_CONFIG['logging']['level'] = 'DEBUG'
    JETSON_CONFIG['cry_detection']['enabled'] = False
    JETSON_CONFIG['recording']['enabled'] = False

# 경로 설정
def get_storage_path(path_type):
    """저장소 경로 반환"""
    base_path = Path(JETSON_CONFIG['storage']['base_path'])
    return base_path / JETSON_CONFIG['storage'][f'{path_type}_path']

def ensure_directories():
    """필요한 디렉토리 생성"""
    directories = [
        get_storage_path('audio'),
        get_storage_path('video'),
        get_storage_path('logs'),
        get_storage_path('models'),
        get_storage_path('temp')
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

# 설정 검증
def validate_config():
    """설정 유효성 검증"""
    errors = []
    
    # 포트 번호 검증
    if not (1024 <= JETSON_CONFIG['port'] <= 65535):
        errors.append(f"포트 번호가 유효하지 않습니다: {JETSON_CONFIG['port']}")
    
    # 카메라 설정 검증
    for camera_type, config in JETSON_CONFIG['camera'].items():
        if not (1 <= config['width'] <= 4096):
            errors.append(f"{camera_type} 카메라 너비가 유효하지 않습니다: {config['width']}")
        if not (1 <= config['height'] <= 4096):
            errors.append(f"{camera_type} 카메라 높이가 유효하지 않습니다: {config['height']}")
        if not (1 <= config['fps'] <= 120):
            errors.append(f"{camera_type} 카메라 FPS가 유효하지 않습니다: {config['fps']}")
    
    # 오디오 설정 검증
    audio_config = JETSON_CONFIG['audio']
    if audio_config['sample_rate'] not in [8000, 16000, 22050, 44100, 48000]:
        errors.append(f"샘플 레이트가 유효하지 않습니다: {audio_config['sample_rate']}")
    
    if errors:
        raise ValueError(f"설정 오류:\n" + "\n".join(errors))
    
    return True

# 초기화 시 디렉토리 생성 및 설정 검증
if __name__ == '__main__':
    try:
        ensure_directories()
        validate_config()
        print("✅ Jetson Nano 설정이 유효합니다.")
    except Exception as e:
        print(f"❌ 설정 오류: {e}")
        exit(1)
