# Baby Monitoring Server

Jetson Nano를 사용한 아기 모니터링 시스템의 서버 부분입니다.

## 🚀 기능

- **실시간 비디오 스트리밍**: 일반 카메라 및 적외선 카메라 지원
- **울음 감지**: AI 기반 아기 울음 감지 및 분석
- **센서 모니터링**: 온도, 습도, 체온 등 환경 데이터 수집
- **녹화 기능**: 비디오 및 오디오 녹화 지원
- **시스템 모니터링**: Jetson Nano 하드웨어 상태 모니터링
- **REST API**: 웹 애플리케이션과의 통신을 위한 API 제공

## 📋 요구사항

### 하드웨어
- **Jetson Nano** (4GB RAM 권장)
- **USB 카메라** (일반 카메라)
- **적외선 카메라** (선택사항)
- **마이크** (울음 감지용)
- **온습도 센서** (DHT22 등)

### 소프트웨어
- **Ubuntu 18.04 LTS** (JetPack 4.6+)
- **Python 3.8+**
- **CUDA 10.2+** (GPU 가속용)

## 🛠️ 설치

### 1. 저장소 클론
```bash
cd /home/nano
git clone <repository-url>
cd baby-monitor/jetson-nano
```

### 2. Python 가상환경 생성
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. 의존성 설치
```bash
pip install -r requirements.txt
```

### 4. Jetson Nano 최적화 패키지 설치
```bash
# OpenCV Jetson Nano 최적화 버전
pip uninstall opencv-python
pip install opencv-python-headless

# NumPy Jetson Nano 최적화 버전
pip install --upgrade numpy
```

## ⚙️ 설정

### 환경변수 설정
```bash
# .env 파일 생성
cat > .env << EOF
JETSON_MODEL=Jetson Nano
GPU_MEMORY=4GB
JETSON_HOST=0.0.0.0
JETSON_PORT=5000
ENVIRONMENT=development
EOF
```

### 설정 파일 수정
`config/jetson_config.py` 파일에서 다음 설정을 확인/수정:

- **카메라 설정**: 디바이스 ID, 해상도, FPS
- **오디오 설정**: 샘플 레이트, 채널 수
- **저장소 경로**: 오디오/비디오 파일 저장 위치
- **성능 설정**: 스레드 수, 메모리 제한

## 🚀 실행

### 개발 모드
```bash
python app.py
```

### 프로덕션 모드
```bash
export ENVIRONMENT=production
python app.py
```

### 시스템 서비스로 등록
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

## 📡 API 엔드포인트

### 기본 정보
- **GET** `/health` - 서버 상태 확인
- **GET** `/system/status` - 시스템 정보 조회

### 울음 감지
- **POST** `/start` - 울음 감지 시작
- **POST** `/stop` - 울음 감지 중지
- **GET** `/status` - 감지 상태 조회

### 센서 데이터
- **GET** `/sensors/all` - 모든 센서 데이터 조회

### 카메라 제어
- **POST** `/camera/switch` - 카메라 전환
- **GET** `/video/stream/<type>` - 비디오 스트림 (normal/infrared)

### 녹화 기능
- **POST** `/recording/start` - 녹화 시작
- **POST** `/recording/stop` - 녹화 중지

### 설정 관리
- **POST** `/update-settings` - 설정 업데이트

## 🔧 하드웨어 연결

### 카메라 연결
```bash
# USB 카메라 확인
lsusb
ls /dev/video*

# 카메라 권한 설정
sudo usermod -a -G video nano
```

### 마이크 연결
```bash
# 오디오 디바이스 확인
arecord -l
aplay -l

# 마이크 권한 설정
sudo usermod -a -G audio nano
```

### 센서 연결
```bash
# I2C 센서 확인
i2cdetect -y 1

# GPIO 센서 확인
ls /sys/class/gpio/
```

## 📊 모니터링

### 로그 확인
```bash
# 실시간 로그 모니터링
tail -f logs/jetson_server.log

# 시스템 서비스 로그
sudo journalctl -u baby-monitor -f
```

### 성능 모니터링
```bash
# GPU 사용률 확인
tegrastats

# CPU 및 메모리 사용률
htop

# 온도 확인
cat /sys/class/thermal/thermal_zone0/temp
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 카메라가 인식되지 않음
```bash
# USB 권한 확인
ls -la /dev/video*
sudo chmod 666 /dev/video0

# 카메라 드라이버 확인
dmesg | grep -i camera
```

#### 2. 오디오 입력이 작동하지 않음
```bash
# 오디오 디바이스 확인
pactl list short sources
pactl list short sinks

# 마이크 볼륨 조정
pactl set-source-volume alsa_input.usb-0c76_USB_PnP_Audio_Device-00.analog-mono 100%
```

#### 3. GPU 가속이 작동하지 않음
```bash
# CUDA 설치 확인
nvcc --version
nvidia-smi

# OpenCV CUDA 지원 확인
python3 -c "import cv2; print(cv2.cuda.getCudaEnabledDeviceCount())"
```

#### 4. 메모리 부족 오류
```bash
# 스왑 메모리 생성
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구 스왑 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 🔒 보안 고려사항

### 프로덕션 환경
- **CORS 설정**: 허용된 도메인만 접근 가능하도록 제한
- **API 키 인증**: 중요한 엔드포인트에 인증 추가
- **HTTPS**: SSL/TLS 인증서 적용
- **방화벽**: 필요한 포트만 열기

### 네트워크 보안
```bash
# UFW 방화벽 설정
sudo ufw enable
sudo ufw allow 5000/tcp
sudo ufw allow ssh
```

## 📈 성능 최적화

### Jetson Nano 최적화
```bash
# GPU 성능 모드 설정
sudo nvpmodel -m 0  # 최대 성능 모드

# CPU 성능 모드 설정
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# 메모리 최적화
echo 3 | sudo tee /proc/sys/vm/drop_caches
```

### Python 최적화
```bash
# NumPy 최적화
export OPENBLAS_NUM_THREADS=4
export MKL_NUM_THREADS=4

# OpenCV 최적화
export OPENCV_OPENCL_RUNTIME=1
export OPENCV_OPENCL_DEVICE=:GPU:0
```

## 🤝 기여

버그 리포트, 기능 요청, 풀 리퀘스트를 환영합니다!

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
