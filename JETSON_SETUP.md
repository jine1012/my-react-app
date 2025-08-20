# Jetson Nano 연동 설정 가이드

이 문서는 React 앱을 Jetson Nano와 연동하기 위한 설정 가이드입니다.

## 🔧 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Jetson Nano 서버 설정
JETSON_NANO_URL=http://192.168.0.100:5000
JETSON_NANO_HOST=192.168.0.100
JETSON_NANO_PORT=5000

# Jetson Nano 하드웨어 정보
JETSON_MODEL=Jetson Nano
GPU_MEMORY=4GB
CPU_CORES=4

# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# 서버 설정
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# 보안 설정
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# 로깅 설정
LOG_LEVEL=info
LOG_FILE=logs/server.log

# 파일 업로드 설정
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=100MB

# 개발 환경 설정
DEBUG=true
CORS_ORIGIN=http://localhost:3000
```

## 🌐 네트워크 설정

### 1. Jetson Nano IP 주소 확인
Jetson Nano에서 다음 명령어로 IP 주소를 확인하세요:

```bash
ip addr show
# 또는
hostname -I
```

### 2. 방화벽 설정
Jetson Nano에서 필요한 포트를 열어주세요:

```bash
# UFW 방화벽 활성화
sudo ufw enable

# SSH 허용
sudo ufw allow ssh

# Flask 서버 포트 허용
sudo ufw allow 5000/tcp

# 상태 확인
sudo ufw status
```

### 3. 네트워크 연결 테스트
React 앱 서버에서 Jetson Nano 연결을 테스트하세요:

```bash
# 연결 테스트
curl http://192.168.0.100:5000/health

# 또는 브라우저에서
http://192.168.0.100:5000/health
```

## 🚀 Jetson Nano 서버 실행

### 1. Python 가상환경 생성
```bash
cd jetson-nano
python3 -m venv venv
source venv/bin/activate
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 서버 실행
```bash
python app.py
```

### 4. 백그라운드 실행 (선택사항)
```bash
nohup python app.py > jetson_server.log 2>&1 &
```

## 📱 React 앱에서 Jetson Nano 연동

### 1. API 호출 예시

```typescript
// Jetson Nano 상태 확인
const checkJetsonStatus = async () => {
  try {
    const response = await fetch('http://192.168.0.100:5000/health');
    const data = await response.json();
    console.log('Jetson Nano 상태:', data);
  } catch (error) {
    console.error('Jetson Nano 연결 실패:', error);
  }
};

// 울음 감지 시작
const startCryDetection = async () => {
  try {
    const response = await fetch('http://192.168.0.100:5000/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('울음 감지 시작:', data);
  } catch (error) {
    console.error('울음 감지 시작 실패:', error);
  }
};

// 센서 데이터 조회
const getSensorData = async () => {
  try {
    const response = await fetch('http://192.168.0.100:5000/sensors/all');
    const data = await response.json();
    console.log('센서 데이터:', data);
  } catch (error) {
    console.error('센서 데이터 조회 실패:', error);
  }
};
```

### 2. 비디오 스트림 연동

```typescript
// 비디오 스트림 컴포넌트
const VideoStream = ({ cameraType }: { cameraType: 'normal' | 'infrared' }) => {
  const streamUrl = `http://192.168.0.100:5000/video/stream/${cameraType}`;
  
  return (
    <div>
      <img 
        src={streamUrl} 
        alt={`${cameraType} camera stream`}
        style={{ width: '100%', maxWidth: '640px' }}
      />
    </div>
  );
};
```

## 🔍 문제 해결

### 1. 연결 오류
- **CORS 오류**: Jetson Nano 서버에서 CORS가 활성화되어 있는지 확인
- **네트워크 타임아웃**: 방화벽 설정 및 네트워크 연결 상태 확인
- **포트 충돌**: 다른 서비스가 5000번 포트를 사용하고 있는지 확인

### 2. 성능 문제
- **비디오 스트림 지연**: Jetson Nano의 GPU 가속 활성화
- **메모리 부족**: Jetson Nano의 스왑 메모리 설정
- **CPU 과부하**: 불필요한 서비스 비활성화

### 3. 하드웨어 문제
- **카메라 인식 안됨**: USB 권한 및 드라이버 확인
- **마이크 작동 안됨**: 오디오 디바이스 권한 확인
- **센서 데이터 오류**: I2C/GPIO 연결 상태 확인

## 📊 모니터링 및 로그

### 1. Jetson Nano 로그 확인
```bash
# 실시간 로그 모니터링
tail -f jetson_server.log

# 시스템 서비스 로그 (서비스로 등록한 경우)
sudo journalctl -u baby-monitor -f
```

### 2. React 앱 로그 확인
브라우저 개발자 도구의 콘솔에서 API 호출 결과를 확인하세요.

### 3. 네트워크 모니터링
```bash
# 네트워크 연결 상태 확인
netstat -tulpn | grep :5000

# 포트 스캔
nmap -p 5000 192.168.0.100
```

## 🔒 보안 고려사항

### 1. 프로덕션 환경
- **HTTPS 사용**: SSL/TLS 인증서 적용
- **API 인증**: JWT 토큰 기반 인증 구현
- **IP 제한**: 허용된 IP만 접근 가능하도록 설정

### 2. 네트워크 보안
- **VPN 사용**: 외부 접근 시 VPN 터널 사용
- **포트 스캔 방지**: 불필요한 포트 닫기
- **정기 업데이트**: 보안 패치 정기 적용

## 📈 성능 최적화

### 1. Jetson Nano 최적화
```bash
# GPU 성능 모드 설정
sudo nvpmodel -m 0

# CPU 성능 모드 설정
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 메모리 최적화
echo 3 | sudo tee /proc/sys/vm/drop_caches
```

### 2. React 앱 최적화
- **이미지 압축**: 비디오 스트림 품질 조정
- **캐싱**: 자주 사용되는 데이터 캐싱
- **지연 로딩**: 필요할 때만 데이터 로드

## 🚀 배포 가이드

### 1. Jetson Nano 서비스 등록
```bash
# 서비스 파일 생성
sudo tee /etc/systemd/system/baby-monitor.service > /dev/null << EOF
[Unit]
Description=Baby Monitor Jetson Server
After=network.target

[Service]
Type=simple
User=nano
WorkingDirectory=/home/nano/baby-monitor/jetson-nano
Environment=PATH=/home/nano/baby-monitor/jetson-nano/venv/bin
ExecStart=/home/nano/baby-monitor/jetson-nano/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화 및 시작
sudo systemctl daemon-reload
sudo systemctl enable baby-monitor
sudo systemctl start baby-monitor
```

### 2. React 앱 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 정적 파일 서빙 (예: nginx)
sudo apt install nginx
sudo cp -r build/* /var/www/html/
```

## 📞 지원 및 문의

문제가 발생하거나 추가 도움이 필요하시면:

1. **GitHub Issues**: 프로젝트 저장소에 이슈 생성
2. **로그 분석**: 위의 로그 확인 방법으로 문제 진단
3. **네트워크 진단**: 연결 상태 및 방화벽 설정 확인

## 🔄 업데이트 및 유지보수

### 1. 정기 업데이트
- **Jetson Nano**: JetPack 및 시스템 업데이트
- **Python 패키지**: pip 업데이트 및 보안 패치
- **React 앱**: npm 패키지 업데이트

### 2. 백업 및 복구
- **설정 파일**: 정기적인 설정 파일 백업
- **데이터**: 중요한 데이터 정기 백업
- **시스템 이미지**: 전체 시스템 이미지 백업

이 가이드를 따라 Jetson Nano와 React 앱을 성공적으로 연동하실 수 있습니다!
