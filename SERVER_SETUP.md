# 서버 설정 가이드

## 서버 구성

### 1. Node.js 서버 (메인 서버)
- **IP 주소**: `192.168.0.4`
- **포트**: `5000`
- **역할**: React 앱 API, 울음 감지 이벤트 수신, OpenAI 연동

### 2. Flask 서버 (라즈베리파이)
- **IP 주소**: `192.168.0.94`
- **포트**: `5000`
- **역할**: 울음 감지 ML 모델, 실시간 오디오 처리

## 설정 방법

### Node.js 서버 설정

1. 환경변수 설정 (`.env` 파일 생성):
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Raspberry Pi Flask Server Configuration
RASPBERRY_PI_URL=http://192.168.0.94:5000
```

2. 서버 시작:
```bash
cd server
npm install
npm start
```

### Flask 서버 설정

1. 환경변수 설정 (라즈베리파이에서):
```bash
export NODEJS_SERVER_URL=http://192.168.0.4:5000
export FLASK_HOST=0.0.0.0
export FLASK_PORT=5000
```

2. 서버 시작:
```bash
cd raspberry-pi
pip install -r requirements.txt
python app.py
```

## 연결 테스트

연결 상태를 확인하려면:

```bash
# Node.js 서버에서
node test-connection.js

# 또는 직접 API 호출
curl http://192.168.0.4:5000/api/health
curl http://192.168.0.94:5000/health
```

## API 엔드포인트

### Node.js 서버 (`192.168.0.4:5000`)
- `GET /api/health` - 서버 상태 확인
- `POST /api/cry-detection/start` - 울음 감지 시작
- `POST /api/cry-detection/stop` - 울음 감지 중지
- `GET /api/cry-detection/status` - 감지 상태 조회
- `GET /api/cry-detection/test-connection` - Flask 서버 연결 테스트

### Flask 서버 (`192.168.0.94:5000`)
- `GET /health` - 서버 상태 확인
- `POST /start` - 울음 감지 시작
- `POST /stop` - 울음 감지 중지
- `GET /status` - 감지 상태 조회
- `POST /detection-event` - 울음 감지 이벤트 수신

## 네트워크 요구사항

- 두 서버는 같은 네트워크 세그먼트에 있어야 함
- 방화벽에서 포트 5000이 열려있어야 함
- 라즈베리파이의 마이크 접근 권한 확인

## 문제 해결

### 연결 실패 시
1. 네트워크 연결 상태 확인
2. IP 주소 정확성 확인
3. 방화벽 설정 확인
4. 서버 프로세스 실행 상태 확인

### 울음 감지 문제
1. 마이크 권한 확인
2. ML 모델 파일 존재 확인
3. 오디오 드라이버 상태 확인
