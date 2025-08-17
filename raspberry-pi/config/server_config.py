# raspberry-pi/config/server_config.py
import os

# Node.js 서버 설정
NODEJS_SERVER_URL = os.getenv('NODEJS_SERVER_URL', 'http://192.168.0.4:5000')

# Flask 서버 설정
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))

# CORS 설정
CORS_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://192.168.0.4:3000',
    'http://192.168.0.4:5173'
]

# 울음 감지 설정
DETECTION_TIMEOUT = int(os.getenv('DETECTION_TIMEOUT', 10))  # 초
EVENT_SEND_TIMEOUT = int(os.getenv('EVENT_SEND_TIMEOUT', 5))  # 초

# 로깅 설정
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'logs/app.log')
